import { AnimationCurve, CanvasGroup, Coroutine, GameObject, Input, Mathf, OperatingSystemFamily, Quaternion, RectTransform, RectTransformUtility, SystemInfo, Vector2, Vector3 } from 'UnityEngine';
import { EventSystem, EventTrigger, EventTriggerType, PointerEventData } from 'UnityEngine.EventSystems'
import { Entry } from 'UnityEngine.EventSystems.EventTrigger';
import { System } from 'UnityEngine.Rendering.VirtualTexturing';
import { Image } from 'UnityEngine.UI';
import { UIZepetoPlayerControl } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class CustomScreenStick extends ZepetoScriptBehaviour {

    @Header("---- Basic Settings ----")
    public UIZepetoPlayerControlObject: UIZepetoPlayerControl;
    public stickMaximumDistance: number;

    @Header("---- Rotator Related ----")
    public isUsingRotatorGO: boolean;
    public rotatorGO: GameObject;

    @Header("---- Other Settings ----")
    public isAutoHideInMobile: boolean;

    private _rotatorRectTransform: RectTransform;

    private _eventTrigger: EventTrigger;
    private _rectTransform: RectTransform;
    private _parentRectTransform: RectTransform;
    private _startPosition: Vector2;

    private _controllerCanvasGroup: CanvasGroup;

    private _isDragging: boolean;

    private _alphaAnimationCoroutine: Coroutine;

    private _isOnEditor;

    private _isInitialized;

    Start() {
        if ((SystemInfo.operatingSystemFamily == OperatingSystemFamily.MacOSX) || (SystemInfo.operatingSystemFamily == OperatingSystemFamily.Windows)) {
            this._isOnEditor = true;
            console.log("[CustomScreenStick]: isAutoHideInMobile will be set false in MacOS or Windows");
        }else{
            this._isOnEditor = false;
        }

        this._eventTrigger = this.gameObject.GetComponent<EventTrigger>();
        this.UIZepetoPlayerControlObject = this.UIZepetoPlayerControlObject;
        this._rectTransform = this.gameObject.GetComponent<RectTransform>();
        this._parentRectTransform = this.transform.parent.gameObject.GetComponent<RectTransform>();
        this._startPosition = this._rectTransform.anchoredPosition;
        this._isDragging = false;

        this._controllerCanvasGroup = this.transform.parent.GetComponent<CanvasGroup>();

        if (this.isAutoHideInMobile) {
            this._controllerCanvasGroup.alpha = 0;
        }

        if (this.isUsingRotatorGO) {
            this._rotatorRectTransform = this.rotatorGO.GetComponent<RectTransform>();
            this.rotatorGO.SetActive(false);
        }




        //Register Point Down
        let _pointerDownEntry = new Entry();
        _pointerDownEntry.eventID = EventTriggerType.PointerDown;
        _pointerDownEntry.callback.AddListener(() => {
            this.UIZepetoPlayerControlObject.StartMoving();

            if (this.isUsingRotatorGO) {
                this.rotatorGO.SetActive(true);
            }

            this._isDragging = true;

            if (this.isAutoHideInMobile)
                this._controllerCanvasGroup.alpha = 1;
        })
        this._eventTrigger.triggers.Add(_pointerDownEntry);

        //Register Drag
        let _dragEntry = new Entry();
        _dragEntry.eventID = EventTriggerType.Drag;
        _dragEntry.callback.AddListener((eventData: PointerEventData) => {
            let _vector2Ref = $ref<Vector2>();
            RectTransformUtility.ScreenPointToLocalPointInRectangle(this._parentRectTransform, eventData.position, eventData.pressEventCamera, _vector2Ref);
            let _vector2Converted = $unref(_vector2Ref);
            let _vector2Normalized = Vector2.op_Subtraction(_vector2Converted, Vector2.Scale(this._parentRectTransform.sizeDelta, new Vector2(0.5, 0.5)));
            let _vector2Clamped = Vector2.ClampMagnitude(_vector2Normalized, this.stickMaximumDistance);
            this._rectTransform.anchoredPosition = _vector2Clamped;
            let _vector2Adjusted = Vector2.op_Division(_vector2Clamped, this.stickMaximumDistance);


            // console.log("🚀 ~ file: CustomScreenStick.ts ~ line 57 ~ CustomScreenStick ~ _dragEntry.callback.AddListener ~ _finalVector2", _vector2Adjusted)

            if (this.isUsingRotatorGO) {
                this._rotatorRectTransform.rotation = Quaternion.Euler(new Vector3(0, 0, 360 - this.Vector2ToAngle(_vector2Adjusted)));
            }

            this._isDragging = true;
            this.UIZepetoPlayerControlObject.Move(_vector2Adjusted);
        })
        this._eventTrigger.triggers.Add(_dragEntry);

        //Register Drag End
        let _dragEndEntry = new Entry();
        _dragEndEntry.eventID = EventTriggerType.EndDrag;
        _dragEndEntry.callback.AddListener((eventData: PointerEventData) => {
            this.UIZepetoPlayerControlObject.StopMoving();
            this._rectTransform.anchoredPosition = this._startPosition;

            if (this.isUsingRotatorGO) {
                this.rotatorGO.SetActive(false);
            }

            this._isDragging = false;

            if (this.isAutoHideInMobile)
                this._controllerCanvasGroup.alpha = 0;
        })
        this._eventTrigger.triggers.Add(_dragEndEntry);

        this._isInitialized = true;
    }

    OnDisable() {
        this.UIZepetoPlayerControlObject.StopMoving();
        this._rectTransform.anchoredPosition = this._startPosition;
    }

    Update() {

        if (this._isInitialized && !this._isOnEditor) {
            if (Input.touchCount == 0) {
                this.UIZepetoPlayerControlObject.StopMoving();
                this._rectTransform.anchoredPosition = this._startPosition;

                if (this.isUsingRotatorGO) {
                    this.rotatorGO.SetActive(false);
                }

                this._isDragging = false;

                if (this.isAutoHideInMobile)
                    this._controllerCanvasGroup.alpha = 0;
            }

        }
    }

    private Vector2ToAngle(input: Vector2): number {
        if (input.x > 0) {
            return 360 - (Mathf.Atan2(input.x, input.y) * Mathf.Rad2Deg * -1);
        } else {
            return Mathf.Atan2(input.x, input.y) * Mathf.Rad2Deg;
        }
    }

}