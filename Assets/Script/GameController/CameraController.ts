import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import * as UnityEngine from "UnityEngine";
import { ZepetoPlayers, CameraData, ZepetoCamera } from 'ZEPETO.Character.Controller';

export default class CameraController extends ZepetoScriptBehaviour {
    
    private mZepetoCamera : ZepetoCamera;
    private mCameraData : CameraData;
    
    private mPreMaxZoom : number;
    private mPreMinZoom : number;
    private mPreOffset : UnityEngine.Vector3;
    
    public InitCamera()
    {
        this.mZepetoCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera;
        this.mCameraData = ZepetoPlayers.instance.cameraData;
        
        this.mPreMaxZoom = this.mCameraData.maxZoomDistance;
        this.mPreMinZoom = this.mCameraData.minZoomDistance;
        this.mPreOffset = this.mCameraData.offset;
    }
    
    public EnterGestureView(){
         
    }
    
    public LeaveGestureView(){
        this.mCameraData.maxZoomDistance = this.mPreMaxZoom;
        this.mCameraData.minZoomDistance = this.mPreMinZoom;
        this.mCameraData.offset = this.mPreOffset;
    }
    

}