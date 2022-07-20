using UnityEngine;
using UnityEditor;
using ZEPETO.Script;
using System.Collections.Generic;

public class IconEventEditor
{
    private static GameObject mCanvas;
    private static GameObject mIconTriggerPrefab;
    private static GameObject mIconItemUIPrefab;
    private static string TargetTag = "IconTrigger";
    private static string IconTriggerName = "IconTrigger";
    private static string IconItemUIName = "IconItemUI";
    private static string IconTriggerRoot = "IconTriggerRoot";
    private static float DfaultSizeScale = 1f;

    [MenuItem("GameObject/ZEPETO/AddIconTrigger")]       // 菜单
    public static void Add3DIcon()
    {

        GameObject[] targetObjs = GameObject.FindGameObjectsWithTag(TargetTag);
        mIconTriggerPrefab = Resources.Load<GameObject>("Prefabs/UI/" + IconTriggerName);
        mIconItemUIPrefab = Resources.Load<GameObject>("Prefabs/UI/" + IconItemUIName);
        mCanvas = GameObject.Find("DynamicCanvas");

        Transform iconTriggerRoot = GameObject.Find(IconTriggerRoot)?.transform;
        if (iconTriggerRoot == null)
        {
            iconTriggerRoot = new GameObject(IconTriggerRoot).transform;
        }
        
        Transform iconItemUIParent = null;
        if (mCanvas)
        {
            iconItemUIParent = mCanvas.transform.Find("IconItemUIParent");
            if (!iconItemUIParent)
            {
                iconItemUIParent = new GameObject("IconItemUIParent").transform;
                iconItemUIParent.SetParent(mCanvas.transform);
            }
        }
        
        //在标记3dIcon的物体下创建 iconTrigger
        foreach (var obj in targetObjs)
        {
            if (iconTriggerRoot.transform.Find(obj.name) == null)
            {
                
                GameObject item = GameObject.Instantiate(mIconTriggerPrefab, iconTriggerRoot);
                item.name = obj.name;
                
                
                BoxCollider boxTrigger = obj.AddComponent<BoxCollider>();
                Vector3 originBoxsize = boxTrigger.size;
                Vector3 originBoxCenter = boxTrigger.center;
                GameObject.DestroyImmediate(boxTrigger);
                BoxCollider iconTrigger = item.AddComponent<BoxCollider>();
                iconTrigger.size = originBoxsize * DfaultSizeScale;
                iconTrigger.isTrigger = true;
                
                item.transform.position = obj.transform.position + originBoxCenter;
                
                //给trigger绑定父物体gameObject
                var comp = item.GetComponent<ZepetoScriptBehaviourComponent>();
                if (comp.script.Script is TypescriptAsset)
                {
                    if (comp.script.ContainsKey("targetObj"))
                    {
                        comp.script["targetObj"] = obj;
                    }
                }

                if (iconItemUIParent && comp != null)
                {
                    GameObject itemUI = GameObject.Instantiate(mIconItemUIPrefab, iconItemUIParent);
                    var itemUIListener = itemUI.AddComponent<ItemUIListener>();
                    itemUIListener.SetData(comp);

                }
                //CreateSceneIcon(item);
            }
        }
    }
    
}
