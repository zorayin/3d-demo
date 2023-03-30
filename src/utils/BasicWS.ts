/*
 * @Author: 陈诗文
 * @Date: 2020-02-27 17:29:57
 * @LastEditTime: 2021-12-16 14:11:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \audio-vision-platform\src\views\common\utils\BasicWS.ts
 */

export type Handler<T> = (data: T) => void

export default abstract class BasicWS<T> {
  private ws!: WebSocket
  protected listenersMap: { [key: string]: Handler<T>[] } = {}
  protected isDestory: boolean = false;
  private suppendState: boolean = false;
  private suppendTask: number = -1;
  public isConnect: boolean = false;

  // eslint-disable-next-line no-useless-constructor
  constructor(public url: string, public name: string = "Websocket") { }

  connect() {
    // 挂起就不再执行重连
    if (this.isSuppend) {
      this.suppendTask = window.setInterval(() => {
        if (!this.suppendState) {
          clearInterval(this.suppendTask);
          this.suppendTask = -1;
          if (this.isDestory) return;
          this.connect();
        }
      }, 5 * 1000);
      return;
    }
    let ws = new WebSocket(this.url)
    ws.onopen = this.handleOpen.bind(this)
    ws.onclose = this.handleClose.bind(this)
    ws.onerror = this.handleError.bind(this)
    ws.onmessage = this.handleMessage.bind(this)
    this.ws = ws
    return this;
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.ws) {
      this.ws.send(data);
    }
  }

  close() {
    this.isDestory = true;
    if (this.ws) {
      this.ws.close();
      (this.ws as any) = null;
    }
  }

  private handleOpen() {
    this.isConnect = true;
    console.log(`${this.name} 已连接`)
  }

  private handleClose() {
    this.isConnect = false;
    console.log(`${this.name} 已断开`)
    if (this.isDestory || this.ws == null) return;
    setTimeout(this.connect.bind(this), 3 * 1000);
  }

  private handleError() {
    this.isConnect = false;
    console.log(`${this.name} 发生异常`)
  }

  protected abstract handleMessage(e: MessageEvent<T>): void

  set isSuppend(val: boolean) {
    this.suppendState = val;
  }

  get isSuppend() {
    return this.suppendState;
  }

  on(key: string, handler: Handler<T>) {
    if (this.listenersMap[key] == null) {
      this.listenersMap[key] = []
    }
    this.listenersMap[key].push(handler)
    return this
  }

  protected fire(key: string, data: any) {
    if (this.listenersMap[key] != null) {
      this.listenersMap[key].forEach(handler => handler(data))
    }
  }

  remove(key: string, handler?: Handler<T>) {
    let listeners = this.listenersMap[key]
    if (listeners == null) return
    if (handler === undefined) {
      this.listenersMap[key] = []
      return
    }
    for (let i = listeners.length - 1; i >= 0; i -= 1) {
      if (listeners[i] === handler) {
        listeners.splice(i, 1)
      }
    }
    return this
  }

  removeAll() {
    this.listenersMap = {}
    return this
  }
}