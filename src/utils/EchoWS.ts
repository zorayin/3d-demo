/*
 * @Author: 陈诗文
 * @Date: 2020-02-27 18:16:10
 * @LastEditTime: 2021-10-18 18:04:37
 * @LastEditors: Please set LastEditors
 * @Description: 获取输入设备回显状态
 * @FilePath: \audio-vision-platform\src\ws\InputImageWS.ts
 */
import BasicWS from './BasicWS';
import { EchoHelper, EchoImgInfo } from "@/utils/EchoHelper";

export default class EchoWS extends BasicWS<string> {
  private data!: EchoImgInfo;
  // 没信号时切换到winErrorBg画面
  private switchEchoTask:number = -1;


  constructor(public url: string, name: string = "Echo Websocket") {
    super(url, name);
  }

  setParam(param: EchoImgInfo) {
    this.data = param;
  }

  /**
   * @description: 检测回显连接状态（DISCONNECT, HAVE_FRAME,NO_FRAME,CONNECT  ）//null时不会管，心跳包
   * @param {any} e.data
   */
  protected handleMessage(e: any) {
    if (!this.data) return;
    let rData = e.data;
    let helper = (this.data.helper as EchoHelper);
    let targetEle = this.data.ele;
    let oldKey = targetEle.dataset["token"] as string;
    let tempList = rData.split(" ");
    let isDisconed = tempList[0] === "DISCONNECT";
    let disconKey = tempList[1];
    let newKey = `${Date.now()}`;
    let url = "";
    let isHandle = false;
    if (rData === "HAVE_FRAME") {
      clearTimeout(this.switchEchoTask);
      url = `http://${targetEle.dataset['imgSource']}:8001/?id=${newKey}`;
      isHandle = true;
      targetEle.dataset[helper.relinkKey] = "0";
    } else if(rData === "NO_FRAME"){
      clearTimeout(this.switchEchoTask);
      // this.switchEchoTask = window.setTimeout(() => {
      //   targetEle.src = helper.noEchoImg;
      // }, 1000);
    } else if (isDisconed && oldKey === disconKey) {
      // console.log(`${oldKey}==${targetEle.src}==${newKey}`)
      // 刚刚挂起时，所回调的处理
      if (helper.suspendKey) {
        let tempUrl = targetEle.dataset[helper.suspendKey];
        if (tempUrl) {
          url = tempUrl.replace(oldKey, newKey);
        }
      } else {
        url = targetEle.src.replace(oldKey, newKey);
      }
      isHandle = true;
    }
    if (isHandle) {
      if (helper.isSuspend) {
        targetEle.dataset[helper.suspendKey] = url;
      } else {
        targetEle.src = url;
      }
      targetEle.dataset["token"] = newKey;
    }

  }
}