import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { SpawnInfo, ZepetoPlayer, ZepetoPlayers, LocalPlayer, ZepetoCharacter } from 'ZEPETO.Character.Controller'
import { WorldService } from 'ZEPETO.World'
import { Animator, Camera, GameObject, Quaternion, Renderer, Transform, Vector3 } from 'UnityEngine';


export default class CharacterCtrl extends ZepetoScriptBehaviour {

    Start() {
        console.log(WorldService.userId);
        ZepetoPlayers.instance.CreatePlayerWithUserId(WorldService.userId, new SpawnInfo(), true);

        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            let _player: LocalPlayer = ZepetoPlayers.instance.LocalPlayer;
        });

    }

}