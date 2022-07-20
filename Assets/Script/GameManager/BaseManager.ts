import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameMain from '../GameMain'
import { sEventArg } from "./NetManager"

export default class BaseManager extends ZepetoScriptBehaviour {

    public SendEvent(eventName : sEventArg, message : any){
        GameMain.Instance.SendEvent(eventName, message);
    }

    public GetEventData(eventName : sEventArg, message : any) : any {
        return GameMain.Instance.GetEventData(eventName, message);
    }
    
    public CheckGesture(gestrue : number) : boolean{
        return GameMain.Instance.CheckGesture(gestrue);
    }

}