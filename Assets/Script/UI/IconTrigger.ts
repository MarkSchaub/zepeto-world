import { Collider, GameObject, Sprite, Vector3, Vector2, AnimationClip, Transform } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import UIManager from '../GameManager/UIManager';
import { UIEventCustom } from "../UI/UIEventConst";


export default class IconTrigger extends ZepetoScriptBehaviour {

    public offset: Vector3;
    public uiScale: Vector3; 
    public icon: Sprite;
    public eventId: UIEventCustom;
    public targetObj : GameObject;
    
    @Header("-----------Gesture-----------")
    public animationClip : AnimationClip;
    public useViewChange : boolean = false;
    public cameraZoom : number = 1;
    public cameraAngle : Vector2 = new Vector2(0, 45);
    public targetTransform : Transform;
    public isLock : boolean = true;
    
    private isShow : boolean = false;

    Start(){
        UIManager.Instance.RegisterTriggerData(this);
    }

    OnTriggerEnter(collider: Collider) {
        console.log("[OnTriggerEnter]", collider.tag);
        if (collider.tag == "Player") {
            if(this.isLock){
                let gesture = Number(this.eventId);
                if(UIManager.Instance.CheckIfTriggerLocked(gesture))
                {
                    // todo 要不要执行回调，动态显示
                    return ;
                }
            }
            
            this.isShow = true;
            this.Show();
        }
    }

    OnTriggerExit(collider: Collider) {
        console.log("[OnTriggerExit]");
        if(this.isShow){
            if (collider.tag == "Player") {
                this.Hide();
                this.isShow = false;
            }
        }
        
    }

    private Show() {
        UIManager.Instance.ShowIcon(this);
    }

    private Hide() {
        UIManager.Instance.HideIcon(this);
    }

}