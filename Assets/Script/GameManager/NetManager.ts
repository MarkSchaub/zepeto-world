import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World'
import { Room, RoomData, RoomErrorEvent, RoomLeaveEvent } from 'ZEPETO.Multiplay'
import { sPlayer, sVector3, sPianoState, State } from "ZEPETO.Multiplay.Schema";
import GameMain from '../GameMain'

export enum sEventArg {
    TransformSync = "TransformSync",
    PlayerStateSync = "PlayerStateSync",
    GestureSync = "GestureSync",
    PlayerInfoSync = "PlayerInfoSync",
}

// NetManager 负责管理网络数据，仅负责数据的发送和接受，不负责处理业务逻辑
// 当收到信息后，上报给上级
// 定义所有服务器事件， 通过Room发送给server

export default class NetManager extends ZepetoScriptBehaviour {

    
    
    private mMultiplay : ZepetoWorldMultiplay;
    private mRoom : Room;
    
    private mElapsedTime : number;

    /* Singleton */

    private static _instance: NetManager;
    public static get Instance(): NetManager {
        return NetManager._instance;
    }
    
    
    Awake() {
        NetManager._instance = this;
        this.mMultiplay = this.gameObject.GetComponent<ZepetoWorldMultiplay>();
        if(this.mMultiplay == null){
            this.mMultiplay = this.gameObject.AddComponent<ZepetoWorldMultiplay>();
        }
    }
    
    Start(){
        this.mMultiplay.RoomCreated += this.OnRoomCreated;
        this.mMultiplay.RoomJoined += this.OnRoomJoined;
        this.mMultiplay.RoomError += this.OnRoomError;
        this.mMultiplay.RoomLeave += this.OnRoomLeave;
    }
    
    OnDestroy(){
        if(this.mRoom.IsConnected){
            this.mRoom.Leave(true);
            console.error("room Leave!");
        }
    }
    
    private OnRoomCreated(room : Room){
        this.mRoom = room;
        console.log("OnRoomCreated!");
    }
    
    private OnRoomJoined(room : Room){
        this.BindServerEvent();
        this.mRoom.OnStateChange += this.OnStateChange;
        GameMain.Instance.InitRoomSessionId(this.mRoom.SessionId);
        console.log(`OnRoomJoined! , sessionId = ${this.mRoom.SessionId}`);
    }
    
    private OnRoomError(error : RoomErrorEvent){
        // todo 
        console.error(error.Message);
    }
    
    private OnRoomLeave(leave : RoomLeaveEvent){
        // todo
        // 离开房间后停止发送数据
        this.mRoom.OnStateChange -= this.OnStateChange;
        this.mRoom = null;
        console.warn("OnRoomLeave!")
    }

    private OnStateChange(state : State, isFirst : boolean)
    {
        this.OnReceiveEvent(sEventArg.PlayerStateSync, state.players);
        if(isFirst){
            // 获取用户信息
            this.SendEvent(sEventArg.PlayerInfoSync, new RoomData());
        }
    }
    
    /* 绑定事件 */
    private BindServerEvent(){
        
        this.mRoom.AddMessageHandler<string>(sEventArg.PlayerInfoSync, message => {
            this.OnReceiveEvent(sEventArg.PlayerInfoSync, message);
        });
        
        //todo 
    }
    
    private OnReceiveEvent(eventName : sEventArg, message : any)
    {
        GameMain.Instance.HandleEvent(eventName, message);
    }
    
    
    /* public API */
    public  GetRoomElapsedTime(): number {
        return this.mElapsedTime;
    }
    
    public SendEvent(eventName : string, data : RoomData){

        if(data == null) {
            data = new RoomData();
        }
        
        if(this.mRoom.IsConnected){
            this.mRoom.Send(eventName, data.GetObject());
        }
        else {
            console.error("[SendEvent] room unconnected");
            // todo  缓存data ， some event 恢复网络后重发
        }
    }
}