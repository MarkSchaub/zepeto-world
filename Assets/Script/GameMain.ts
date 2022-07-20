import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import UIManager from "./GameManager/UIManager"
import MapManager from "./GameManager/MapManager"
import NetManager, {sEventArg} from "./GameManager/NetManager"
import PlayerManager from "./GameManager/PlayerManager"
import {GameObject} from "UnityEngine";

import { sPlayer, sVector3, sPianoState, State, sPlayerInfo } from "ZEPETO.Multiplay.Schema";
import {RoomData} from "ZEPETO.Multiplay";

export default class GameMain extends ZepetoScriptBehaviour {

    /* Singleton */
    
    private static _instance: GameMain;
    public static get Instance(): GameMain {
        if (!GameMain._instance) {
            const targetObj = GameObject.Find("GameMain");
            if (targetObj) GameMain._instance = targetObj.GetComponent<GameMain>();
        }
        return GameMain._instance;
    }
    
    /* Mgr */
    private mUIMgr : UIManager;
    private mMapmgr : MapManager;
    private mNetMgr : NetManager;
    private mPlayerMgr : PlayerManager;


    Awake(){
        GameMain._instance = this;
    }
    
    Start(){
        this.mNetMgr = NetManager.Instance;
        this.mPlayerMgr = PlayerManager.Instance;
        this.mUIMgr = UIManager.Instance;
    }
    
    public InitRoomSessionId(sessionId : string){
        this.mPlayerMgr.SetSessionId(sessionId);
    }
    
    public OnStateUpdate(playerMap : any){
        playerMap.ForEach( (userId : string, player : sPlayer) =>{
            console.log("[OnStateUpdate] " + userId + " -- " + player.id);
        } )
    }
    
    
    /* Handle Event */
    public HandleEvent(eventName : sEventArg, message : any)
    {
        console.log(`HandleEvent : [${eventName}]  !!!`);
        switch (eventName)
         {
             case sEventArg.PlayerStateSync:
                 this.mPlayerMgr.UpdatePlayerState(message);
                 break;
             case sEventArg.PlayerInfoSync:
                 this.mPlayerMgr.UpdatePlayerInfo(message);
                 break;
         }
    }
    
    public SendEvent(eventName : sEventArg, message : any){
        console.log(`SendEvent : [${eventName}]  !!!`);
        switch (eventName)
        {
            case sEventArg.GestureSync:
                let eventId = 0;
                if(message === null){
                    PlayerManager.Instance.CancelLocalPlayerGesture();
                    this.mUIMgr.ShowAllIcon();
                }
                else {
                    eventId = Number(message.eventId)
                    // 锁定+被占用的， 不触发事件
                    if(!(message.isLock && this.CheckGesture(eventId)))
                        PlayerManager.Instance.SetLocalPlayerGesture(message);
                    this.mUIMgr.HideAllIcon();
                }
                const roomData = new RoomData();
                roomData.Add("gesture", eventId);
                this.mNetMgr.SendEvent(eventName, roomData);
                break;
            default:
                this.mNetMgr.SendEvent(eventName, message);
                break;
        }
    }
    
    public GetEventData(eventName : sEventArg, message : any) : any{
        console.log(`GetEventData : [${eventName}]  !!! [${message}]`);
        switch (eventName){
            case sEventArg.GestureSync:
                let eventId = Number(message);
                if(eventId != null){
                    return this.mUIMgr.GetTriggerData(eventId);
                }
                break;
            default:
                return null;
        }
    }
    
    public CheckGesture(gesture : number) : boolean{
        return  this.mPlayerMgr.CheckGesture(gesture);
    }
   

}