/*
 * @Author: 陈诗文
 * @Date: 2021-01-18 15:27:58
 * @LastEditTime: 2022-01-05 15:04:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \audio-vision-platform\src\utils\EchoHelper.ts
 */
import EchoWS from '@/utils/EchoWS';
export interface EchoImgInfo { ele: HTMLImageElement; listener: EchoWS, helper: EchoHelper }

// 新版回显处理,注意所有注册的canvas必须要绑定data-source,且值需要和实际的回显ip一致
export class EchoHelper {
  private mCanvasMap: { [key: string]: (HTMLCanvasElement | null)[] } = {};
  private mCtxMap: { [key: string]: (CanvasRenderingContext2D | null)[] } = {};
  private echoImgsMap: { [key: string]: EchoImgInfo } = {};
  private isDestory: boolean = false;
  private mIsSuspend: boolean = false;
  public suspendKey: string = 'suspendSource';
  public relinkKey: string = 'linkcount';
  // public noEchoImg: string = require("@imgs/winErrorBg.jpg");

  constructor() {
    this.startDraw();
    setTimeout(() => {
      this.startSourceLoop();
    }, 5 * 6 * 10 * 1000)
  }

  set isSuspend(val: boolean) {
    this.mIsSuspend = val;
    this.suspendEchoImg(val);
    this.suspendEchoSocket(val);
  }

  get isSuspend() {
    return this.mIsSuspend;
  }

  getEchoInfo(ip:string){
    return this.echoImgsMap[ip];
  }

  getEchoCanvas(ip:string){
    return this.mCanvasMap[ip];
  }

  suspendEchoSocket(isSuspend: boolean) {
    Object.keys(this.echoImgsMap).forEach((key) => {
      let target = this.echoImgsMap[key];
      if (target && target.listener) {
        target.listener.isSuppend = isSuspend;
      }
    });
  }

  suspendEchoImg(isSuspend: boolean) {
    let eles = document.querySelectorAll<HTMLImageElement>("[data-img-source]");
    let key = this.suspendKey;
    if (isSuspend) {
      eles.forEach(img => {
        let val = img.src;
        img.dataset[key] = val == null ? "" : val;
        img.src = "";
      });
    } else {
      setTimeout(() => {
        eles.forEach(img => {
          let val = img.dataset[key];
          img.src = val == null ? "" : val;
        });
        this.startDraw();
      }, Math.round(Math.random() * 1500));
    }
  }

  private createEchoImg(inSource: string) {
    let tImg: HTMLImageElement = new window.Image();
    tImg.style.position = "absolute";
    tImg.style.top = "-99%";
    tImg.style.left = "-99%";
    tImg.style.zIndex = "-1";
    // tImg.setAttribute('crossOrigin', 'anonymous');

    tImg.dataset["imgSource"] = inSource;

    tImg.onerror = (event) => {
      if (!this.isSuspend && !this.isDestory) {
        let linkCount = parseInt(tImg.dataset.linkcount == undefined ? "0" : tImg.dataset.linkcount) + 1;
        tImg.dataset.linkcount = `${linkCount}`;
        // 重连大于5次
        if (linkCount > 5) {
          // tImg.src = this.noEchoImg;
          console.log('连接失败')
        } else {
          let token = tImg.dataset["token"] as string;
          tImg.src = `http://${tImg.dataset['imgSource']}:8001/?id=${token}`;
        }
      }
    }
    document.body.appendChild(tImg);
    return tImg;
  }

  private addEchoImgsWsToMap(inSrouce: string) {
    if (this.echoImgsMap[inSrouce]) return;
    let img = this.createEchoImg(inSrouce);
    let ws = new EchoWS(`ws://${inSrouce}:8003/`)
    let tData: EchoImgInfo = { ele: img, listener: ws, helper: this };
    ws.setParam(tData);
    ws.connect();
    this.echoImgsMap[inSrouce] = tData;
  }

  private addCanvasToMap(inSource: string, canvas: HTMLCanvasElement) {
    let tCanvasList = this.mCanvasMap[inSource];
    let tCtxList = this.mCtxMap[inSource];
    if (!tCanvasList) {
      tCanvasList = [];
      tCtxList = [];
      this.mCanvasMap[inSource] = tCanvasList;
      this.mCtxMap[inSource] = tCtxList;
    }
    if (tCanvasList.includes(canvas))  return;
    
    tCtxList.push(canvas.getContext("2d"));
    tCanvasList.push(canvas);
    // canvas.dataset['idx'] = `${tCanvasList.length - 1}`;
    // canvas.dataset['source'] = inSource;
  }

  setCanvas(inSource: string, canvas: HTMLCanvasElement) {
    // if (RegUtils.isLegalIP(inSource) && canvas) {
      this.addCanvasToMap(inSource, canvas);
      this.addEchoImgsWsToMap(inSource);
      if (this.isDestory) {
        this.isDestory = false;
        this.startDraw();
      }
    // }
  }

  //5分钟 轮询检测每个回显是否有画板在使用
  private startSourceLoop() {
    Object.keys(this.echoImgsMap).forEach((key) => {
      let target = document.querySelector(
        `[data-source="${key}"]`
      );
      if (target == null) {
        this.recycleOne(key);
      }
    });
    setTimeout(() => {
      this.startSourceLoop();
    }, 5 * 6 * 10 * 1000)
  }

  recycleOne(inSource: string) {
    let target = this.echoImgsMap[inSource];
    try {
      target.listener.close();
      target.ele.src = "";
      target.ele.onerror = null;
      document.body.removeChild(target.ele);
      delete this.echoImgsMap[inSource];
      this.mCtxMap[inSource] = [];
      this.mCanvasMap[inSource] = [];
    } catch (e) { }
  }

  recycleAll() {
    this.isDestory = true;
    this.mCanvasMap = {};
    this.mCtxMap = {};
    Object.keys(this.echoImgsMap).forEach((key) => {
      this.recycleOne(key);
    });
    this.echoImgsMap = {};
  }


  private startDraw() {
    let flag = !this.isDestory && !this.mIsSuspend;
    if (flag) {
      Object.keys(this.mCtxMap).forEach((key) => {
        let target = this.echoImgsMap[key] ? this.echoImgsMap[key].ele : null;
        if (target == null) {
          this.mCtxMap[key] = [];
          this.mCanvasMap[key] = [];
          return;
        }

        // 信号源的实际宽高的八分之一
        let natRWidth = target.naturalWidth / 8;
        let natRHeight = target.naturalHeight / 8;

        // 没有画面时，不绘制
        if (natRWidth <= 0) {
          return;
        }

        // 绘制绘制方法
        const drawEcho = (target: HTMLImageElement | ImageBitmap) => {
          let canvases = this.mCanvasMap[key];
          let ctxs = this.mCtxMap[key];

          /**-----------------------解决多个尺寸画板绘制同一源会闪烁的问题-------------------------- */
          // 最大的宽高的面板
          let maxCanvas!: HTMLCanvasElement | HTMLImageElement | ImageBitmap;
          let maxContext!: CanvasRenderingContext2D;
          let maxWidth = Number.MIN_VALUE;


          // 计算面板的宽高
          ctxs.forEach((ctx, idx) => {
            let tCanvas = canvases[idx];
            if (ctx && target && tCanvas) {
              // canvas样式的宽高
              let sCanWidth = tCanvas.getBoundingClientRect().width;
              // canvas 的绘制宽高的计算策略
              let wRatio = 1;
              if (!!sCanWidth && !!natRWidth) {
                wRatio = Math.max(Math.round(sCanWidth / natRWidth), 1);
                // canvas绘制的宽
                let canWidth = wRatio * natRWidth;
                if (canWidth > maxWidth) {
                  maxWidth = canWidth;
                  maxCanvas = tCanvas;
                  maxContext = ctx;
                }
                if (canWidth !== tCanvas.width) {
                  tCanvas.width = canWidth;
                  tCanvas.height = wRatio * natRHeight;
                }
              }
            }
          });

          if (maxContext) {
            maxContext.drawImage(target, 0, 0, maxCanvas.width, maxCanvas.height);
          } else {
            maxCanvas = target;
          }

          /**------------------------------------------------------------------------------------------- */

          ctxs.forEach((ctx, idx) => {
            let tCanvas = canvases[idx];
            // 处理动态更新canvas的回显源
            let isSameSource = true;
            if (tCanvas) {
              let cSource = tCanvas.dataset["source"] as string;
              isSameSource = key === cSource;
              if (!isSameSource) {
                (ctx as CanvasRenderingContext2D).clearRect(0, 0, tCanvas.width, tCanvas.height);
                (ctx as CanvasRenderingContext2D).closePath();
                this.addCanvasToMap(cSource, tCanvas);
              }
            }
            // 绘制回显到canvas上
            try {
              if (!isSameSource || (tCanvas && !document.contains(tCanvas))) {
                ctxs[idx] = null;
                canvases[idx] = null;
              } else if (ctx && target && tCanvas) {
                let winW = tCanvas.width;
                let winH = tCanvas.height;
                ctx.drawImage(maxCanvas, 0, 0, winW, winH);
              }
            } catch (error) {
              console.log(error)
            }
          });
          this.mCtxMap[key] = ctxs.filter(ele => ele != null);
          this.mCanvasMap[key] = canvases.filter(ele => ele != null);
          (target as ImageBitmap).close && (target as ImageBitmap).close();
        }

        let userAgent = navigator.userAgent;
        if (userAgent.indexOf("Firefox") > -1) {
          // 解决火狐浏览器绘制mjpeg卡顿的问题
          createImageBitmap(target, 0, 0, target.naturalWidth, target.naturalHeight).then(drawEcho).catch((err) => { })
        } else {
          drawEcho(target);
        }
      });
      requestAnimationFrame(this.startDraw.bind(this))
    }
  }

}

const instance = new EchoHelper();
export default instance;