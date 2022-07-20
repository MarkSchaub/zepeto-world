# Common Frame
# CreateBy : Maj Zepeto-China 

Git地址： 

## Core Feature
* NetManger
* UI Trigger Event

### Net Manager
1. 玩家的状态同步包控制在20B， 每秒20次= 400B，10个玩家 = 4K，每分钟cost = 240K左右；

![image.png](https://upload-images.jianshu.io/upload_images/1076118-66c4dc33b4129027.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 介绍说明
  * id表示房间内玩家的编号，因为房间最多不会超过24人，1个字节足够；
  * 位置和旋转角度 6个字节，通常地图不会超过500，保留2位整形，最大值不会超过50000（pos.x=3.02 => 302)；
  * 玩家Player Animtor动画和手势 Gesture 通常不会过百，1个字节足够；
  * 玩家的具体信息放到PlayerInfo中（sessionId & userId)


### UI Trigger Event
1. 解决地图的UI交互事件![image.png](https://upload-images.jianshu.io/upload_images/1076118-5c70b9bb14462125.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
2. 介绍说明
  * 给有UI交互的3D物体添加指定Tag "IconTrigger"
![image.png](https://upload-images.jianshu.io/upload_images/1076118-caa5575e88088afb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
  * 点击菜单栏“GameObject" -> "ZEPETO" -> "AddTriggerIcon" 会自动生成事件；
![image.png](https://upload-images.jianshu.io/upload_images/1076118-7d52edf4bc26a371.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
  * 在"IconTriggerRoot"下设置参数，相对简单这些忽略
![image.png](https://upload-images.jianshu.io/upload_images/1076118-60a4cc5cd4022904.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
* 可在UI视图下调整UI位置，缩放，测试前删除”IconItemUIParent";




