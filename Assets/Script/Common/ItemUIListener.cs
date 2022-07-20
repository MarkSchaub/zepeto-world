using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using ZEPETO.Script;

[ExecuteInEditMode]

public class ItemUIListener : MonoBehaviour
{
    private ZepetoScriptBehaviourComponent mData;  // IconTrigger


    public void SetData(ZepetoScriptBehaviourComponent  data)
    {
        this.mData = data;
        if (data.script.ContainsKey("uiScale"))
        {
            Debug.LogError(data.script["uiScale"]);
            this.gameObject.name = "IconItemUI_" + this.mData.gameObject.name;
            this.transform.localScale = (Vector3) this.mData.script["uiScale"];
            this.transform.localPosition = (Vector3)this.mData.script["offset"] + this.mData.transform.position;
        }
        
    }

    private void Update()
    {
        if (this.mData)
        {
            if (this.mData.script.ContainsKey("offset"))
            {
                this.mData.script["offset"] = this.transform.position - this.mData.transform.position;
                this.mData.script["uiScale"] = this.transform.localScale;
            }
        }
    }
}
