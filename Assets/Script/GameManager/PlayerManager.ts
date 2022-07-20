// @ts-ignore
import {System} from 'csharp';
import {
    CharacterState,
    SpawnInfo,
    ZepetoCamera,
    ZepetoCharacter,
    ZepetoPlayer,
    ZepetoPlayers
} from 'ZEPETO.Character.Controller';
import {
    AnimationClip,
    Animator,
    AnimatorOverrideController,
    HumanBodyBones,
    Quaternion,
    RuntimeAnimatorController,
    Time,
    Transform,
    Vector3,
    WaitForSeconds
} from "UnityEngine";
import {sPlayer, sPlayerInfo, sVector3} from "ZEPETO.Multiplay.Schema";
import {sEventArg} from "./NetManager"
import {RoomData} from "ZEPETO.Multiplay";
import CameraController from '../GameController/CameraController'
import BaseManager from './BaseManager'

export default class PlayerManager extends BaseManager {

    /* Singleton */

    private static _instance: PlayerManager;
    public static get Instance(): PlayerManager {
        return PlayerManager._instance;
    }

    /* Player Map */
    private mUserIdMap : Map<number, sPlayerInfo> = new Map<number, sPlayerInfo>();
    private mPlayerSessionMap : Map<string, sPlayer> = new Map<string, sPlayer>();
    
    private mSessionId : string;
    private mLocalPlayer : ZepetoPlayer;
    private mLocalCamera : ZepetoCamera;
    private mLocalPlayerTransform;
    private mIsUpdate : boolean;   
    private mPrePos : Vector3;
    private mMaxMoveDistance : number;

    private mPreCameraAngle : Quaternion;
    private mPreCameraPos : Vector3;

    public get LocalPlayer(): ZepetoPlayer{ return  this.mLocalPlayer;}

    /* Camera Controoler */
    private mCameraCtrl : CameraController;
    
    /* sync setting */
    private mFPS : number = 30;
    private mInterval : number = 1 / this.mFPS;
    private mTimer : number = 0;

    Awake() {
        PlayerManager._instance = this;
        this.mCameraCtrl = this.transform.Find("CameraController").GetComponent<CameraController>();
    }
    
    Start() {
        
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.mLocalPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
            this.mLocalCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera;
            this.mLocalCamera.camera.gameObject.tag = "MainCamera";
            this.mLocalPlayerTransform = this.mLocalPlayer.character.transform;
            this.mCameraCtrl.InitCamera();
            this.mLocalPlayer.character.gameObject.tag = "Player";
            this.mMaxMoveDistance = this.mLocalPlayer.character.RunSpeed * this.mLocalPlayer.character.RunSpeed;
            
                // todo
            this.mLocalPlayer.character.OnChangedState.AddListener((cur, prev) =>{
                this.SyncLocalPlayerState(cur);
            })
        });

        ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
            if (this.mSessionId == sessionId) return;
            const player = this.mPlayerSessionMap.get(sessionId);
            player.OnChange += (changeValues) => this.OnSyncRomotePlayer(sessionId, player);
            // 需要延迟一会初始化用户状态
            this.StartCoroutine(this.CoDealyOnSyncRomotePlayer(sessionId, player));
        });
    }

    Update(){
        if(this.mLocalPlayer == null) return ;
        
        this.CheckIfNeedUpdate();
        this.SyncLocalPlayerTransform();
        
        if(this.mLocalPlayer.character.tryJump || this.mLocalPlayer.character.tryMove){
            if(this.mLocalPlayer.character.CurrentState ===  CharacterState.Gesture){
                this.SendEvent(sEventArg.GestureSync, null);
            }
        }
    }
    
    SyncLocalPlayerTransform(){
        if(this.mIsUpdate){
            const data = new RoomData();
            let p = this.mLocalPlayerTransform;
            const pos = new RoomData();
            pos.Add("x", Math.round(p.localPosition.x * 100));
            pos.Add("y", Math.round(p.localPosition.y * 100));
            pos.Add("z", Math.round(p.localPosition.z * 100));
            data.Add("position", pos.GetObject());

            const rot = new RoomData();
            rot.Add("x", Math.round(p.localEulerAngles.x * 100));
            rot.Add("y", Math.round(p.localEulerAngles.y * 100));
            rot.Add("z", Math.round(p.localEulerAngles.z * 100));
            data.Add("rotation", rot.GetObject());
            
            this.SendEvent(sEventArg.TransformSync, data);
            this.mIsUpdate = false;
            this.mPrePos = this.mLocalPlayerTransform.position;
        }
    }
    
    SyncLocalPlayerState(state : CharacterState){
        const data = new RoomData();
        data.Add("state", state);
        this.SendEvent(sEventArg.PlayerStateSync, data);
    }
    
    CheckIfNeedUpdate() {
        this.mTimer += Time.deltaTime;
        if(this.mTimer > this.mInterval){
            this.mTimer = 0;
            this.mIsUpdate = true;
            if(Vector3.Distance(this.mPrePos, this.mLocalPlayerTransform.position) < 1) { this.mIsUpdate = false;}
        }
    }

    *CoDealyOnSyncRomotePlayer(sessionId : string, player : sPlayer){
        yield new WaitForSeconds(0.4);
        this.OnSyncRomotePlayer(sessionId, player);
    }
    
    OnSyncRomotePlayer(sessionId : string, player : sPlayer){
        console.log(`[${"OnSyncRomotePlayer"}] ${player.state}`);
        const zepetoCharacter = this.GetCharacter(sessionId);
        const isOnGesture = player.gesture > 0;
        
        if(zepetoCharacter.CurrentState === CharacterState.Gesture){
            if(player.state != CharacterState.Gesture){
                zepetoCharacter.CancelGesture();
                console.error("Cancel Gesture");
            }
        }
        // 同步手势 阻止位置同步
        if(isOnGesture){
            if(zepetoCharacter.CurrentState != CharacterState.Gesture){
                let data = this.GetEventData(sEventArg.GestureSync, player.gesture);
                this.SetPlayerGesture(zepetoCharacter, data);
                return ;
            }
        }
        else {
            if(!this.CheckIsJump(zepetoCharacter)){
                if(player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove || player.state === CharacterState.Jump){
                    zepetoCharacter.Jump();
                }
            }
            const pos = this.ParseVector3(player.position);
            this.SetPosition(zepetoCharacter, pos);
        }
    }
    
    /* UpdatePlayerInfo */
    
    Obj2Map(obj) {
        let strMap = new Map<number, sPlayerInfo>();

        for (let k of Object.keys(obj)) {
            strMap.set(Number(k), obj[k]);
        }
        return strMap;
    }
    
    public SetSessionId(sessionId : string){
        this.mSessionId = sessionId;
    }
    
    public CheckGesture(gesture : number) : boolean{
        let result : boolean = false;
        this.mPlayerSessionMap.forEach((player : sPlayer, sessionId : string) =>{
            if(player.gesture == gesture){
                result = true;
            }
        })
        return result;
    }
    
    public UpdatePlayerState(players : any)
    {
        players.ForEach((sessionId : string, player : sPlayer) =>{
            if(!this.mPlayerSessionMap.has(sessionId)){
                this.mPlayerSessionMap.set(sessionId, player);
                if(!this.mUserIdMap.has(player.id)) {
                    // Update playerInfo
                    this.SendEvent(sEventArg.PlayerInfoSync, new RoomData());
                }
            }
        });
    }
    
    public UpdatePlayerInfo(playerMapJson : string)
    {
        let playerObj = JSON.parse(playerMapJson);
        let playerMap = this.Obj2Map(playerObj);
        
        let join = new Map<number, sPlayerInfo>();
        let leave = new Map<number, sPlayerInfo>(this.mUserIdMap);
        //console.error(playerMapJson);
        playerMap.forEach((_player : sPlayerInfo, _id:number) => {
            if(_id > 0)
            {
                if(!this.mUserIdMap.has(_id)){
                    join.set(_id, _player);
                }
            }
            leave.delete(_id);
        })
        this.mUserIdMap = playerMap;
        join.forEach((_player : sPlayerInfo, _id:number) => this.CreatePlayer(_player.sessionId, _player.userId , _id));
        leave.forEach((_player : sPlayerInfo, _id:number) => this.RemovePlayer(_player.sessionId, _id));
    }

    /* CreatePlayer */

    CreatePlayer(sessionId: string, userId : string, id : number) {
        let spawnInfo: SpawnInfo = new SpawnInfo();
        let player = this.mPlayerSessionMap.get(sessionId);
        if(player == null){
            this.mUserIdMap.delete(id);
            console.log("no session info");
        }
        else {
            spawnInfo.position = this.ParseVector3(player.position);
            spawnInfo.rotation = this.ParseQuaternion(player.rotation);
            ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, userId, spawnInfo, sessionId == this.mSessionId);
        }
        
    }

    RemovePlayer(sessionId: string, id : number) {
        ZepetoPlayers.instance.RemovePlayer(sessionId);
        if(this.mPlayerSessionMap.has(sessionId)){
            this.mPlayerSessionMap.delete(sessionId);
        }
        if(this.mUserIdMap.has(id)){
            this.mUserIdMap.delete(id);
        }
    }

    GetPlayer(sessionId: string): ZepetoPlayer {
        if (ZepetoPlayers.instance.HasPlayer(sessionId)) {
            return ZepetoPlayers.instance.GetPlayer(sessionId);
        }
        return null;
    }

    GetCharacter(sessionId: string): ZepetoCharacter {
        if (ZepetoPlayers.instance.HasPlayer(sessionId)) {
            return ZepetoPlayers.instance.GetPlayer(sessionId).character;
        }
        return null;
    }
    
    SetLocalPlayerGesture(data : any){
        this.mPreCameraPos = this.mLocalCamera.camera.transform.position;
        this.mPreCameraAngle = this.mLocalCamera.cameraParent.rotation;
        this.SetPlayerGesture(this.LocalPlayer.character, data);
    }

    SetPlayerGesture(character: ZepetoCharacter, data : any){
        console.error("SetRemotePlayerGesture" , data.eventId, data.animationClip.name);
        let targetTransform = data.targetTransform;
        let targetCharacter = character;

        targetCharacter.SetGesture(data.animationClip);

        let animator: Animator = targetCharacter.ZepetoAnimator;
        let bone: Transform = animator.GetBoneTransform(HumanBodyBones.Hips);
        let distance = Vector3.op_Subtraction(bone.position, targetCharacter.Context.transform.position);
        let newPos: Vector3 = Vector3.op_Subtraction(targetTransform.position, distance);
        targetCharacter.transform.position = newPos;
        targetCharacter.transform.rotation = targetTransform.rotation;
        
        if(data.useViewChange){
            this.mLocalCamera.DoZoom(data.cameraZoom);
            console.error(data.cameraAngle);
            this.mLocalCamera.cameraParent.rotation = Quaternion.Euler(data.cameraAngle.x, data.cameraAngle.y, 0);
        }
    }

    SetGesture(character: ZepetoCharacter, gesture: AnimationClip) {
        (character.ZepetoAnimator.runtimeAnimatorController as AnimatorOverrideController).set_Item("gesture", gesture);
        character.SetGesture(gesture);
    }
    
    CancelLocalPlayerGesture(){
        this.mLocalPlayer.character.CancelGesture();
        this.mLocalCamera.camera.transform.position = this.mPreCameraPos ;
        this.mLocalCamera.cameraParent.rotation = this.mPreCameraAngle;
    }

    DelayedSetGesture(character: ZepetoCharacter, gesture: AnimationClip){
        this.StartCoroutine(this.CoDelayedSetGesture(character, gesture));
    }

    *CoDelayedSetGesture(character: ZepetoCharacter, gesture: AnimationClip) {
        character.CancelGesture();
        yield new WaitForSeconds(0.4);
        character.SetGesture(gesture);
        character.ChangeStateAnimation(CharacterState.Gesture);
    }

    SetPosition(character: ZepetoCharacter, position: Vector3) {
        let dis = position - character.transform.position;
        let distance: number = dis.sqrMagnitude;
        if (distance < this.mMaxMoveDistance) {
            character.MoveToPosition(position);
        } else {
            character.transform.position = position;
        }
    }

    Teleport(character: ZepetoCharacter, position: Vector3, rotation: Quaternion = Quaternion.identity) {
        character.Teleport(position, rotation);
    }

    SetSpeed(character: ZepetoCharacter, additionalRunSpeed: number, additionalWalkSpeed: number, additionalJumpPower: number) {
        character.additionalRunSpeed = additionalRunSpeed;
        character.additionalWalkSpeed = additionalWalkSpeed;
        character.additionalJumpPower = additionalJumpPower;
    }

    ChangeRuntimeAnimatorController(character: ZepetoCharacter, runtimeAnimatorController: RuntimeAnimatorController) {
        let overrideController = new AnimatorOverrideController();
        overrideController.runtimeAnimatorController = runtimeAnimatorController;
        character.ZepetoAnimator.runtimeAnimatorController = overrideController;
    }

    private ParseVector3(vector3: sVector3): Vector3 {
        return new Vector3
        (
            vector3.x * 0.01,
            vector3.y * 0.01,
            vector3.z * 0.01
        );
    }
    
    private ParseQuaternion(vector3: sVector3) : Quaternion{
        return Quaternion.Euler(vector3.x * 0.01, vector3.y * 0.01, vector3.z * 0.01);
    }
    
    private CheckIsJump(character : ZepetoCharacter) : boolean{
        return character.CurrentState >= CharacterState.Jump;
    }

}