import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Transform, Vector3} from 'UnityEngine';
import IconTrigger from '../UI/IconTrigger'
import IconItemUI from '../UI/IconItemUI'
import UIPoolManager from '../UI/UIPoolManager'
import PlayerManager from './PlayerManager'
import BaseManager from './BaseManager'
import { RoomData } from "ZEPETO.Multiplay";
import { sEventArg } from "./NetManager"

export default class UIManager extends BaseManager {

    /* singleton */
    private static _instance: UIManager;
    public static get Instance(): UIManager {
        return UIManager._instance;
    }
    
    public mDynamicCanvas : GameObject;
    public mStaticCanvas : GameObject;
    
    Awake() {
        UIManager._instance = this;
    }
    
    /* 3d Icon Triiger */
    private mIconItemMap: Map<number, IconItemUI> = new Map<number, IconItemUI>();
    private mIconTriggerMap : Map<number, IconTrigger> = new Map<number, IconTrigger>();
    private readonly ICON_ITEM_UI : string = "IconItemUI";

    RegisterTriggerData(data : IconTrigger){
        if(!this.mIconTriggerMap.has(data.eventId)){
            this.mIconTriggerMap.set(Number(data.eventId), data);
        }
        else {
            console.error("Register Error!");
        }
    }
    
    GetTriggerData(eventId : number) : IconTrigger{
        if(this.mIconTriggerMap.has(eventId)){
            return this.mIconTriggerMap.get(eventId);
        }
        return null;
    }
     
    
    ShowIcon(data: IconTrigger) {
        console.log(data.eventId);
        let iconItem: IconItemUI = null;
        
        if (this.mIconItemMap.has(data.eventId)) {
            iconItem = this.mIconItemMap.get(data.eventId);
        }
        if (iconItem == null) {
            //从对象池获取
            let poolItem = UIPoolManager.Instance.Spawn(this.ICON_ITEM_UI);
            let iconObj: GameObject = poolItem.obj;
            iconObj.transform.SetParent(this.mDynamicCanvas.transform);
            iconItem = iconObj.GetComponent<IconItemUI>();
        }
        iconItem.SetData(data);
        iconItem.Show();
        this.mIconItemMap.set(data.eventId, iconItem);
    }

    HideIcon(data: IconTrigger) {
        if (this.mIconItemMap.has(data.eventId)) {
            let uiItem = this.mIconItemMap.get(data.eventId);
            uiItem.Hide();
            this.mIconItemMap.delete(data.eventId);
            UIPoolManager.Instance.UnSpawn(this.ICON_ITEM_UI);
        }
    }
    
    HideAllIcon(){
        // todo
        this.mIconItemMap.forEach((itemUI : IconItemUI, id : number) =>{
            itemUI.Hide();
        })
    }
    
    ShowAllIcon(){
        this.mIconItemMap.forEach((itemUI : IconItemUI, id : number) =>{
            itemUI.Show();
        })
    }
    
    ClickIcon(data : IconTrigger){
        this.SendEvent(sEventArg.GestureSync, data);
    }
    
    // Trigger 是否被占用
    CheckIfTriggerLocked(eventId : number) : boolean{
        return this.CheckGesture(eventId);  
    }
}