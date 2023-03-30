import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import qs from "qs";
import moment from "moment";
import URLConfig from "@/utils/UrlConfig";
import { StateCode } from "@/utils/StateCodeConstants";
import { Message } from "element-ui"
// import Vue from "*.vue";
import Router from "@/router"
import Vue from "vue"
// import { IResult } from '@src/electron/api/service/PageService';


const iMessage = Message;

//请求拦截携带token
axios.interceptors.request.use((config: any) => {
  if (Vue.prototype.$loadMode === 0 && Vue.prototype.$electronEnv === true) {
    return Promise.reject(config);
    // return config;
  }
  let token = SecureHelper.getToken();
  if (token) {
    config.headers.token = token;
  }
  return config;
});

let loopTask = () => {
  if (window.Electron && Vue.prototype.$loadMode === undefined && Vue.prototype.$electronEnv === undefined) {
    setTimeout(loopTask, 300);
    return;
  }
  if (Vue.prototype.$loadMode === 0 && Vue.prototype.$electronEnv === true) {
    axios.interceptors.response.use((res: any) => {
      return res;
    },
      (err: any) => {
        let promise: any = null;
        let tempMap: { [key: string]: any } = {};
        // && url === "/api/media/page/get?"  url==='/api/media/page/delete?id=4&'

        //本地环境下返回
        let url: string = err.url;

        let { headers, method, data } = err;
        let isJsonFormat = headers['content-type'] === "application/json";
        let paramStr = "";
        let realData: { [key: string]: any } = {};
        let secondData: any = null;
        // 截取get请求的参数
        if (method === "get" || method === "delete" || url.includes("?")) {
          let tempUrl = url.split("?"); //get请求，参数在地址上
          url = tempUrl[0];
          if (tempUrl[1]) {
            paramStr = tempUrl[1];

          }
        } else if (!isJsonFormat && (method === 'post' || method === 'put')) {
          paramStr = data;
        }
        // 解析?**=**的请求结构的参数
        if (paramStr) {
          let paramArr = paramStr.split('&');
          paramArr.forEach((ele: string) => {
            let arr = ele.split('=');
            if (arr[0]) {
              realData[arr[0]] = arr[1];
            }
          })
        }

        if (isJsonFormat) {
          if (typeof data === "object" && !Array.isArray(data)) {
            Object.assign(realData, data);
          } else {
            if (!Object.keys(realData).length) {
              realData = data;
            } else {
              realData['extraParam'] = data;
            }
          }
        }



        // let url = err.config.url;
        // let data = null;
        // let tempDataMap: any = null;

        // if (postData) { //post请求
        // if (typeof (postData) === 'string') {
        //   //     let index = postData.indexOf("{");
        //   //     if (index === -1) { //如果不是JSON类的字符串，而是参数拼接的纯字符串

        //   // let k = -1
        //   // if (postData) {
        //   //   let postDataStr = JSON.stringify(postData)
        //   //   k = postDataStr.indexOf("[");
        //   // }
        //   // if ((k === -1 && typeof (postData) !== 'object') || !postData) {

        //   if (postData) { //post请求
        //     let index = postData.indexOf("{");
        //     if (index === -1) { //如果不是JSON类的字符串，而是参数拼接的纯字符串
        //       let paramArr = postData.split('&');
        //       let paramMap: { [key: string]: any } = {};
        //       paramArr.forEach((ele: string) => {
        //         let arr = ele.split('=');
        //         if (arr[0]) {
        //           paramMap[arr[0]] = arr[1];
        //         }
        //       })
        //       data = paramMap;
        //     } else {
        //       data = JSON.parse(postData);
        //     }
        //   } else {
        //     data = postData;
        //   }
        //   tempDataMap = JSON.parse(JSON.stringify(data));
        //   console.log('post请求', data)
        // }

        // let tempUrl = err.url.split("?"); //get请求，参数在地址上
        // // let tempUrl = err.config.url.split("?"); //get请求，参数在地址上
        // url = tempUrl[0];
        // if (tempUrl[1]) {
        //   let paramArr = tempUrl[1].split('&');
        //   paramArr.forEach((ele: string) => {
        //     let arr = ele.split('=');
        //     if (arr[0]) {
        //       tempMap[arr[0]] = arr[1];
        //     }
        //   })
        //   // Object.assign(tempDataMap, tempMap);
        //   tempDataMap = tempMap;
        // }
        // data = tempDataMap;

        let { ipcRenderer } = Electron;
        let replyToken = GlobalUtils.generateUUID();

        promise = new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
          // ipcRenderer.on("response", (event: any, arg: {
          ipcRenderer.on(replyToken, (event: any, arg: {
            message: string; result: any; type: string;
          }) => {
            console.log(event);
            try {
              if (arg) {
                err.data = arg;
                resolve(err);
              } else {
                reject(null);
              }
            } catch (e) {
              reject(e);
            }
          })
        });
        console.log('url', url, 'realData', realData)
        ipcRenderer.send(url, replyToken, realData);
        return promise ? promise : err;
      })
  };
}
setTimeout(loopTask, 300);



export interface CustomConfig {
  AUTO_HINT: boolean;
  ONLY_HINT_FAIL: boolean;
}

// const dateFormatString = "YYYY-MM-DD HH:mm:00";
export default class BasicApiService {
  readonly httpClient = axios;
  readonly format = moment;
  readonly urlConfig = URLConfig;
  readonly qs = qs;
  readonly stateCode = StateCode;
  protected readonly defaultConfig = this.getCustomConfig();
  protected onlyErrorConfig = this.getCustomConfig();

  constructor() {
    this.onlyErrorConfig["ONLY_HINT_FAIL"] = true;
  }

  getCustomConfig(): CustomConfig {
    return {
      AUTO_HINT: true,
      ONLY_HINT_FAIL: false
    };
  }

  getOnlyErrorConfig() {
    return this.onlyErrorConfig;
  }

  private extraOperate<T>(result: AxiosResponse<T>, customConfig?: CustomConfig): T {
    let lastResult: any = false;
    // 当前请求已被cancel掉
    if (result === undefined) return lastResult;
    let realResult: any = result.data;

    if (realResult.type != null) {
      if (customConfig != null && customConfig.AUTO_HINT) {
        if (realResult.type === StateCode.SUCCESS) {
          if (!customConfig.ONLY_HINT_FAIL) {
            let hintText = realResult.message ? realResult.message : "执行成功！";
            if (realResult.message !== null && realResult.message !== "没有查询到数据") {
              iMessage.success(hintText);
            }
          }
        } else {
          if (realResult.type === StateCode.EMPTY) {
            if (realResult.message !== null) {
              if (realResult.message !== "没有查询到数据" || realResult.message !== "未查询到数据" || realResult.message !== "没有符合的数据") {
              } else {
                iMessage.warning(realResult.message);
              }
            }
          }
        }
      }
    }

    lastResult = realResult ? realResult : true;
    this.printLog(realResult);
    return lastResult;
  }

  private operateError<T>(result: any, customConfig?: CustomConfig): T {
    let lastResult: any = false;
    // 当前请求已被cancel掉
    if (result === undefined) return lastResult;
    if (Vue.prototype.$loadMode !== 0 && Vue.prototype.$electronEnv !== true) {
      let paramFailCode: number = 400;
      let serverFailCode: number = 500;
      let realResult: any = result.data;
      let status = result.status;
      let hintText = realResult.message;
      if (customConfig != null && customConfig.AUTO_HINT) {
        if (status >= paramFailCode && status < serverFailCode) {
          if (result.message !== null && result.message !== "没有查询到数据" && result.message !== "未查询到数据") {
            iMessage.warning(hintText);
          }
        } else {
          iMessage.error("网络异常/服务器繁忙");
        }
      }
      if (realResult.type === "TOKEN.INVALID") {
        localStorage.removeItem('token');
        Router.push({
          name: "login",
          query: { redirect: Router.currentRoute.fullPath }
        })
      }
    }
    // this.printLog(realResult);
    return lastResult;
  }

  protected async get<T>(url: string, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {

    // setLocalServe() {
    //   // console.log("switchLocalServe");
    //   // console.log(Vue.prototype.$electronEnv);
    //   // console.log(Vue.prototype.$loadMode);
    //   if (Vue.prototype.$electronEnv && Vue.prototype.$loadMode === 0) {
    //     const { ipcRenderer } = this.$electron;

    //   }
    // }


    try {
      let result = <AxiosResponse<T>>(await this.httpClient.get(url, httpConfig));
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      return this.operateError(e.response, customConfig);
    }

  }

  protected async getFormat<T>(url: string, param?: any, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {
    let tempUrl = url;
    if (param) {
      tempUrl = `${url}?${GlobalUtils.serialRequestParam(param)}`;
    }
    try {
      let result = <AxiosResponse<T>>(await this.httpClient.get(tempUrl, httpConfig));
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      if (e && e.response) {
        return this.operateError(e.response, customConfig);
      } else {
        return this.operateError(null, customConfig);
      }
    }
  }

  protected async postRawJSON<T>(url: string, param?: any, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {
    let tempHeader: any = { headers: { "content-type": "application/json" }, ...httpConfig };
    try {
      let result = await this.httpClient.post(url, param, tempHeader);
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      return this.operateError(e.response, customConfig);
    }

  }
  //ForamData传参数
  protected async postFormData<T>(url: string, param?: any, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {
    let tempHeader: any = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, ...httpConfig };
    let strParam = qs.stringify(param)
    try {
      let result = await this.httpClient.post(url, strParam, tempHeader);
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      return this.operateError(e.response, customConfig);
    }
  }

  protected async put<T>(url: string, param?: any, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {


    let tempHeader: any = { headers: { "content-type": "application/json" }, ...httpConfig };
    try {
      let result = await this.httpClient.put(url, param, tempHeader);
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      return this.operateError(e.response, customConfig);
    }
  }


  protected async delete<T>(url: string, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {
    try {
      let result = await this.httpClient.delete(url);
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      return this.operateError(e.response, customConfig);
    }
  }

  protected async deleteFormat<T>(url: string, param?: any, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {
    let tempUrl = url;
    if (param) {
      tempUrl = `${url}?${GlobalUtils.serialRequestParam(param)}`;
    }
    try {
      let result = await this.httpClient.delete(tempUrl);
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      return this.operateError(e.response, customConfig);
    }
  }

  protected async post<T>(url: string, param?: any, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {
    let tempParam = param;
    if (param != null && !(param instanceof FormData)) {
      tempParam = this.qs.stringify(param);
    }
    try {
      let result = await this.httpClient.post(url, tempParam, httpConfig);
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      return this.operateError(e.response, customConfig);
    }
  }

  protected async upload<T>(url: string, param?: any, customConfig?: CustomConfig, httpConfig?: AxiosRequestConfig): Promise<T> {
    let tempHeader: any = { headers: { "Content-Type": "multipart/form-data" }, ...httpConfig };
    let tempParam = param;
    if (param != null && !(param instanceof FormData)) {
      tempParam = new FormData();
      for (let key in param) {
        tempParam.append(key, param[key]);
      }
    }
    try {
      let result = await this.httpClient.post(url, tempParam, tempHeader);
      return this.extraOperate(result, customConfig);
    } catch (e: any) {
      return this.operateError(e.response, customConfig);
    }
  }

  protected printLog(result: any) {
    if (process.env.NODE_ENV === "development") {
      // console.log("================请求结果==================");
      // console.log(result);
    }
  }
}