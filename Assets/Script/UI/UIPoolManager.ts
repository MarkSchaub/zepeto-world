import { GameObject, Quaternion, Vector3 } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class UIPoolManager extends ZepetoScriptBehaviour {

    private _pool: Map<string, PoolItem[]> = new Map<string, PoolItem[]>();

    private static _instance: UIPoolManager;
    public static get Instance(): UIPoolManager {
        return UIPoolManager._instance;
    }

    prefabs: GameObject[] = [];

    Awake() {
        UIPoolManager._instance = this;
    }

    /**
     * 从对象池获取对象
     * @param prefabName 
     * @returns 
     */
    Spawn(prefabName: string): PoolItem {
        let poolItem: PoolItem;
        if (!this._pool.has(prefabName)) {
            this._pool.set(prefabName, []);
        }

        let isGetObject: boolean = false;
        for (let i = 0; i < this._pool.get(prefabName).length; i++) {
            let item = this._pool.get(prefabName)[i];
            if (item.isUse == false) {
                poolItem = item;
                item.isUse = true;
                item.obj.SetActive(true);
                isGetObject = true;
                break;
            }
        }
        //对象池中没有的话，创建一个出来
        if (!isGetObject) {
            let prefab: GameObject;
            for (let i = 0; i < this.prefabs.length; i++) {
                if (this.prefabs[i].name == prefabName) {
                    prefab = this.prefabs[i];
                }
            }
            let obj = GameObject.Instantiate<GameObject>(prefab);
            poolItem = new PoolItem(true, obj);
            this._pool.get(prefabName).push(poolItem);
        }
        return poolItem;
    }


    /**
     * 清理对象池
     * @param prefabName 
     */
    UnSpawn(prefabName: string) {
        if (this._pool.has(prefabName)) {
            for (let i = 0; i < this._pool.get(prefabName).length; i++) {
                let item: PoolItem = this._pool.get(prefabName)[i];
                item.Destory();
                item.obj.transform.SetParent(this.transform, false);
            }
        }
    }
}

export class PoolItem {

    public isUse: boolean;
    public obj: GameObject;

    constructor(isUse: boolean, obj: GameObject) {
        this.isUse = isUse;
        this.obj = obj;
    }

    public Destory() {
        this.isUse = false;
        this.obj.SetActive(false);
        this.obj.transform.localScale = Vector3.one;
        this.obj.transform.localPosition = Vector3.zero;
        this.obj.transform.localRotation = Quaternion.identity;
    }
}