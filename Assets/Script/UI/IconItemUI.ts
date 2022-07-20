import { Camera, Color, Coroutine, GameObject, Mathf, Quaternion, Time, Vector3, WaitForEndOfFrame } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image, Button } from 'UnityEngine.UI';
import { WaitForSeconds } from "UnityEngine";
import IconTrigger from './IconTrigger';
import UIManager from '../GameManager/UIManager';

export default class IconItemUI extends ZepetoScriptBehaviour {

    private mOwner: IconTrigger;
    mBtn: Button;
    mImg: Image;

    private mOffset: Vector3;

    private mInitialRotation : Quaternion;
    private mShowIconCoroutine : Coroutine;
    private mHideIconCoroutine : Coroutine;
    private mUpdateUICoroutine : Coroutine;
    
    private  mEuler : Vector3 = Vector3.zero;

    Awake() {
        if (this.mBtn == null) this.mBtn = this.gameObject.GetComponent<Button>();
        if (this.mImg == null) this.mImg = this.gameObject.GetComponent<Image>();
        this.mInitialRotation = this.transform.rotation;
    }

    OnEnable() {
        if (this.mBtn) {
            this.mBtn.onClick.AddListener(this.ClickBtn.bind(this));
        }
        this.mUpdateUICoroutine = this.StartCoroutine(this.UpdateUI());
    }

    // 修改为监听
    //todo
    private *UpdateUI() {
        while (true) {
            if (Camera.main) {
                let cam = Camera.main;
                this.mEuler.x = cam.transform.eulerAngles.x;
                this.mEuler.y = cam.transform.eulerAngles.y;
                this.transform.localEulerAngles = this.mEuler;
            }
            yield new WaitForSeconds(0.1);
        }
    }

    OnDisable() {
        if (this.mBtn) {
            this.mBtn.onClick.RemoveAllListeners();
        }
        if (this.mUpdateUICoroutine != null || this.mUpdateUICoroutine != undefined){
            this.StopCoroutine(this.mUpdateUICoroutine);
            console.log("Stop Coroutine");
        }
            
    }

    public SetData(owner: IconTrigger) {
        this.mOwner = owner;
        this.mOffset = owner.offset;
        this.gameObject.name = "IconItemUI_" + owner.eventId;
        if (owner.icon != null) this.mImg.sprite = owner.icon;
        this.transform.localScale = owner.uiScale;
        this.transform.localPosition = owner.transform.position + owner.offset;
    }

    private ClickBtn() {
        UIManager.Instance.ClickIcon(this.mOwner);
    }

    OffIcon() {
        this.mImg.raycastTarget = false;
        this.mImg.color = new Color(1, 1, 1, 0);
    }

    Hide(){
        this.OnShow(false);
    }
    
    Show(){
        this.OnShow(true);
    }
    
    private OnShow(isShow: bool) {
        if (isShow) {
            this.mImg.raycastTarget = true;

            if (this.mHideIconCoroutine != null || this.mHideIconCoroutine != undefined)
                this.StopCoroutine(this.mHideIconCoroutine);

            this.mShowIconCoroutine = this.StartCoroutine(this.CoShowIcon());
        } else {
            this.mImg.raycastTarget = false;
            if (this.mShowIconCoroutine != null || this.mShowIconCoroutine != undefined)
                this.StopCoroutine(this.mShowIconCoroutine);
            this.mHideIconCoroutine = this.StartCoroutine(this.CoHideIcon());
        }
    }

    //图标渐显
    private *CoShowIcon() {
        let timeElapsed = 0;
        let timeMax = 0.2;
        while (true) {
            timeElapsed += Time.deltaTime;
            let alpha = Mathf.Lerp(0, 1, timeElapsed / timeMax);
            this.mImg.color = new Color(1, 1, 1, alpha);
            if (alpha == 1) {
                break;
            }
            yield WaitForEndOfFrame;
        }
    }

    //图标渐隐
    private *CoHideIcon() {
        if (this.mImg.color.a == 0) return;
        let timeElapsed = 0;
        let timeMax = 0.3;
        while (true) {
            timeElapsed += Time.deltaTime;
            let alpha = Mathf.Lerp(1, 0, timeElapsed / timeMax);
            this.mImg.color = new Color(1, 1, 1, alpha);
            if (alpha == 0) {
                break;
            }
            yield WaitForEndOfFrame;
        }
    }

}