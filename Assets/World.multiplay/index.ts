import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { sPlayer, sVector3, sPlayerInfo } from "ZEPETO.Multiplay.Schema";

enum sEventArg {
    TransformSync = "TransformSync",
    PlayerStateSync = "PlayerStateSync",
    GestureSync = "GestureSync",
    PlayerInfoSync = "PlayerInfoSync",
}

export default class extends Sandbox {

    private mStartTime : number;
    private mUserIdMap : Map<number, sPlayerInfo> = new Map<number, sPlayerInfo>();
    private mCount : boolean[] = new Array(100);
    
    onCreate(options: SandboxOptions) {

        this.onMessage(sEventArg.TransformSync, (client: SandboxPlayer, message) => {
            const player = this.state.players.get(client.sessionId);

            const position = new sVector3();
            position.x = message.position.x;
            position.y = message.position.y;
            position.z = message.position.z;
            player.position = position;

            const rotation = new sVector3();
            rotation.x = message.rotation.x ;
            rotation.y = message.rotation.y ;
            rotation.z = message.rotation.z ;
            player.rotation = rotation;
            //console.log(`sEventArg.TransformSync: ${message.position.x} , ${message.position.z}`);
        });

        this.onMessage(sEventArg.PlayerStateSync, (client: SandboxPlayer, message) => {
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
            //console.log(`player.state: ${message.state}`);
        });

        this.onMessage(sEventArg.GestureSync, (client: SandboxPlayer, message) => {
            const player = this.state.players.get(client.sessionId);
            player.gesture = message.gesture;
            console.log(`player.gesture: ${message.gesture}`);
        });
        
        this.onMessage(sEventArg.PlayerInfoSync, (client : SandboxPlayer, message) =>{
            this.BroadcastUserMap();
        })
        
        this.mStartTime = this.getSandboxTime();
        for(var i =  0; i < this.mCount.length; i++) this.mCount[i] = true;
        console.log(`onCreate ${this.mStartTime}`);
    }
    
    BroadcastUserMap()
    {
        let mapJson = JSON.stringify(this.Map2Obj(this.mUserIdMap));
        //console.warn(mapJson);
        // 广播给所有用户
        this.broadcast(sEventArg.PlayerInfoSync, mapJson);
    }
    
    Map2Obj(strMap : Map<number, sPlayerInfo>) : Object
    {
        let temp = new sPlayerInfo();
        const obj = {0 : temp};
        
        strMap.forEach((item, key, strMap) =>{
            obj[key as keyof typeof obj] = item;
        })
        return obj;
    }
    
    GetIndex() : number{
        for(var i = 1; i < this.mCount.length; i++){
            if(this.mCount[i]) {
                this.mCount[i] = false;
                return i;
                break;
            }
        }
    }

    onJoin(client: SandboxPlayer) {
        
        const player: sPlayer = new sPlayer();
        let position: sVector3 = new sVector3();
        // 保留2位小数， 整形传递数据； v * 100
        position.x = 100;
        position.y = 0;
        position.z = 200;

        let rot: sVector3 = new sVector3();
        rot.x = 0;
        rot.y = 18000;
        rot.z = 0;
        
        player.position = position;
        player.rotation = rot;
        player.id = this.GetIndex();

        this.state.players.set(client.sessionId, player);
        let playerInfo = new sPlayerInfo();
        playerInfo.userId = client.userId;
        playerInfo.sessionId = client.sessionId;
        this.mUserIdMap.set(player.id, playerInfo);
        this.BroadcastUserMap();
        console.warn("OnJoin!!!!!" + " - " + player.id + " - " + client.userId);
    }
    
    onLeave(client: SandboxPlayer, consented?: boolean) {
        if (this.state.players.has(client.sessionId)) {
            let _id = this.state.players.get(client.sessionId).id;
            this.state.players.delete(client.sessionId);
            this.mUserIdMap.delete(_id);
            this.BroadcastUserMap();
            this.mCount[_id] = true;
        }
    }
    
    getSandboxTime(){
        return Date.now();
    }
     
    // deltaTime -> 110ms , FPS -> 10
    onTick(deltaTime: number) {
        //this.state.elapsedTime = this.getSandboxTime() - this.mStartTime;
        // console.log(this.state.elapsedTime);
    }
    
}