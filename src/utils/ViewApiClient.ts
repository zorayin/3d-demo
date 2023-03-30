/*
 * @Author: 陈诗文
 * @Date: 2020-02-19 16:09:37
 * @LastEditTime: 2022-01-07 17:26:58
 * @LastEditors: Please set LastEditors
 * @Description: 该类作用于组件api服务
 * @FilePath: \audio-vision-platform\src\http\ViewApiClient.ts
 */
import BasicApiService from "./BasicApiService";
import { ModuleTypes } from "@/types/moduleTypes";
import { commit } from "vuex-pathify";
import store from "@/store";
import Vue from "vue"
import streamDevice from "@/electron/api/db/streamdevice/StreamDevice";
import ResponseBodyHelper from "@/electron/api/utils/ResponseBodyHelper";
import { IStreamDevice } from '@/electron/api/model/StreamDevice';
import { IResult, ResultType } from '@/electron/api/model/Result';
import { Message } from "element-ui"
const iMessage = Message;



class ViewApiClient extends BasicApiService {
  // 房间内容管理
  /**
   * @description: 房间内容获取
   * @param { id:房间Id, userId: 用户Id }
   * @return:
   */
  async getRoomList(param: { id?: string; userId?: string; pageId?: number } = {}) {
    let result = await this.getFormat<GlobalBean.ResParams<ViewApiBean.RoomInfo[]>>(this.urlConfig.ROOM_GET, param, this.onlyErrorConfig);
    return result;
  }

  // /**
  //  * @description: 创建/修改房间内容
  //  * @param { ViewApiBean.RoomInfo的信息 }[]
  //  * @return:
  //  */
  // async saveRoomContent(param: ViewApiBean.RoomInfo[] = []) {
  //   let result = await this.postRawJSON<GlobalBean.ResParams<GlobalBean.RoomTreeInfo[]>>(this.urlConfig.ROOM_TREE, param, this.onlyErrorConfig);
  //   return result;
  // }

  async setWinState(param: { devId: string; id?: number; w: number; h: number; x: number; y: number; z: number; input: string } =
    { devId: "192.168.1.12", id: 0, w: 1920, h: 1080, x: 0, y: 0, z: 0, input: "" }) {
    // param.input = `stm://${param.input}/`;
    let result = await this.post<any>(this.urlConfig.WIN_SET_URL, param);
    return result;
  }

  /**
   * @description: 关闭一个窗口
   * @param { devId:输出设备id, id: 窗口id }
   * @return:
   */
  async closeOneWin(param: { devId: string; id: number } = { devId: "192.168.1.12", id: 0 }) {
    let result = await this.getFormat<ViewApiBean.WinInfo>(this.urlConfig.WIN_CLOSE_URL, param);
    return result;
  }

  /**
   * @description: 关闭多个设备多个窗口状态
   * @param { ip:ip地址; id?: 窗口Id,不传入时为开窗，传入有效Id,则改变窗口属性; w: 宽; h: 高; x: x轴; y: y轴; z: 图层; input: 输入源 }
   * @return:
   */
  async closeMultiDevMultiWinState(param: string[]) {
    let result = await this.postRawJSON<any>(this.urlConfig.WIN_CLOSEWINALLINMOREDEV_URL, param);
    return result;
  }


  /**
   * @description: 多个设备关闭同一个窗口
   * @param { devIdList:输出设备id列表, winId: 窗口id }
   * @return:
   */
  async closeMultiWin(param: { devIdList: string[]; winId: number } = { devIdList: ["192.168.1.12"], winId: 0 }) {
    let result = await this.postRawJSON<ViewApiBean.WinInfo[]>(this.urlConfig.WIN_CLOSEWININMOREDEV_URL, param);
    return result;
  }

  /**
   * @description:  关闭多个设备的多个窗口
   * @param {  }
   * @return:
   */
  async closeMoreWinByMoreDev(param: { devId: string, winIds: number[] }[]) {
    let result = await this.postRawJSON<ViewApiBean.WinInfo[]>(this.urlConfig.WIN_CLOSEWINMORE_IN_MOREDEV_URL, param);
    return result;
  }


  /**
  * @description: 设置一个设备窗口状态
  * @param { ip:ip地址; id?: 窗口Id,不传入时为开窗，传入有效Id,则改变窗口属性; w: 宽; h: 高; x: x轴; y: y轴; z: 图层; input: 输入源 }
  * @return:
  */
  async setMultiWinState(winInfo: { id?: number; w: number; h: number; x: number; y: number; z: number; input: string }[]) {
    let result = await this.postRawJSON<any>(this.urlConfig.WIN_CREATEDIFFWININDIFFDEV_URL, winInfo);
    return result;
  }

  /**
   * @description: 设置多个设备窗口状态
   * @param { ip:ip地址; id?: 窗口Id,不传入时为开窗，传入有效Id,则改变窗口属性; w: 宽; h: 高; x: x轴; y: y轴; z: 图层; input: 输入源 append: 创建窗口时是否先清楚该设备的窗口 默认为清除} 
   * @return:
   */
  //第二个参数append意思：
  //true: 创建新的组合信号源时，其他的窗口不会被清除。
  //false: 先清除所有设备的窗口，再执行创建（预案切换和离线布局，要先清屏）。
  async setMultiDevMultiWinState(devIdAndWinList: { devId: string; winInfo: { id?: number; w: number; h: number; x: number; y: number; z: number; input: string } }[], append: boolean = false) {
    let result = await this.postRawJSON<any>(`${this.urlConfig.WIN_CREATEMULTWINDOWBYDIFFDEV_URL}?append=${append}`, devIdAndWinList);
    return result;
  }

  /**
   * @description: 删除场景信息
   * @param { id:场景id }
   * @return:
   */
  async deleteSceneInfo(param: { id: string } = { id: "0" }) {
    let result = await this.post<any>(this.urlConfig.DELETE_SCENE_INFO_URL, param, this.defaultConfig);
    return result;
  }

  //分组管理
  /**
   * @description: 获取分组
   * @param { id:主键}
   * @return:
   */
  async getGroupList(param: { id?: number | null | string }) {
    let result = await this.getFormat<ViewApiBean.GroupMangeInfo[]>(this.urlConfig.GET_GROUP_LIST_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 获取分组
   * @param { keyword: 关键字}
   * @return:
   */
  async queryGroupByKeyword(param: { keyword?: string }) {
    let result = await this.getFormat<ViewApiBean.GroupMangeInfo[]>(this.urlConfig.QUERY_GROUP_LIST_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 新增/更新分组
   * @param { id:分组id, name: 分组名称, parentId: 父id }
   * @return:
   */
  async saveUpdateGroupInfo(param: { id: number | null; name: string; parentId: number | null }) {
    let result = await this.postRawJSON<any>(this.urlConfig.SAVE_UPDATE_GROUP_URL, param, this.defaultConfig);
    return result;
  }

  /**
   * @description: 树状图
   * @param {}
   * @return:
   */
  async getGroupTreeList(param: {}) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.GroupTree[]>>(this.urlConfig.GET_GROUP_TREE_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 删除分组
   * @param { id:分组id }
   * @return:
   */
  async deleteGroupInfo(param: { id: number }) {
    let result = await this.deleteFormat<ViewApiBean.DeleteGroupReturn>(this.urlConfig.DELETE_GROUP_URL, param, this.onlyErrorConfig);
    return result;
  }


  // 场景设备管理
  /**
   * @description: 根据设备id获取场景设备
   * @param { id:设备id}
   * @return:
   */
  async querySceneDevList(param: { id: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.OrderInfo>>(this.urlConfig.GET_SCENE_DEV_LIST_URL, param);
    return result;
  }

  /**
   * @description: 根据页面id查询关联的场景设备
   * @param { pageId: 页面id}
   * @return:
   */
  async querySceneDevListByPageId(param: { pageId: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.OrderInfo[]>>(this.urlConfig.GET_SCENE_DEV_LIST_BY_PAGEID_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 保存一个场景设备
   * @param { devName:场景设备名称, devType: 场景设备类型, channelId: channel的id, deviceId: 关联设备的id, deviceMethod:关联设备的方法, params:关联设备的参数,pageId: 页面id, areaId: 区域id }
   * @return:
   */
  async saveSceneDev(param: {
    devName: string; devType: string | null; channelId: string; deviceId: string; deviceMethod: string; params: string | null; pageId: number | null; areaId: number | null;
  }) {
    let result = await this.postRawJSON<any>(this.urlConfig.SAVE_SCENE_DEV_URL, param, this.defaultConfig);
    return result;
  }

  /**
   * @description: 场景设备信息更新(单个)
   * @param { id: 场景设备id, devName:场景设备名称, devType: 场景设备类型, channelId: channel的id, deviceId: 关联设备的id, deviceMethod:关联设备的方法, params:关联设备的参数,pageId: 页面id, areaId: 区域id }
   * @return:
   */
  async updateSceneDev(param:
    { id: number; devName: string; devType: string | null; channelId: string; deviceId: string; deviceMethod: string; params: string | null; pageId: number; areaId: number | null }
  ) {
    let result = await this.postRawJSON<any>(this.urlConfig.UPDATE_SCENE_DEV_URL, param, this.defaultConfig);
    return result;
  }

  /**
   * @description: 删除场景设备信息
   * @param { id: 场景设备id }
   * @return:
   */
  async deleteSceneDev(param: { id: number }) {
    let result = await this.getFormat<GlobalBean.OrderInfo>(this.urlConfig.DELETE_SCENE_DEV_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 根据页面id获取场景信息
   * @param { pageId: 页面id}
   * @return:
   */
  async queryScenesInfoByPageId(param: { pageId: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.SceneInfo[]>>(this.urlConfig.GET_SCENE_INFO_BY_PAGEID_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 保存一个场景信息
   * @param { sceneName:场景信息名称, sceneDescribe: 场景信息描述, sceneDevIds: 场景设备id}
   * @return:
   */
  async saveScenesInfo(param: { sceneName: string; sceneDescribe?: string; sceneDevIds?: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.SAVE_SCENES_INFO_URL, param, this.defaultConfig);
    return result;
  }

  /**
   * @description: 更新一个场景信息
   * @param { id: 场景信息id, sceneName:场景信息名称,  sceneDescribe: 场景信息描述, sceneDevIds: 场景设备id}
  * @return:
  */
  async updateScenesInfo(param: { id?: number; sceneName: string; sceneDescribe?: string; sceneDevIds?: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.UPDATE_SCENES_INFO_URL, param, this.defaultConfig);
    return result;
  }

  /**
   * @description: 根据id删除场景信息(单个)
   * @param { id: 场景设备id }
   * @return:
   */
  async deleteScenesInfo(param: { id: number }) {
    let result = await this.getFormat<GlobalBean.ScenesInfo>(this.urlConfig.DELETE_SCENES_INFO_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 场景调用
   * @param { id: 场景id }
   * @return:
   */
  async queryScenesInfoInvoke(param: { id: number }) {
    let result = await this.getFormat<any>(this.urlConfig.INVOKE_SCENES_INFO_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 根据页面id查询关联的区域
   * @param { pageId: 页面id}
   * @return:
   */
  async queryScenesAreaListByPageId(param: { pageId: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<any>>(this.urlConfig.GET_SCENE_AREA_BYPAGEID_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 批量添加或更新区域
   * @param { id: 场景区域id, areaName:场景区域名称, description: 场景区域描述, pageId: 页面id}
   * @return:
   */
  async batchSaveUpdateScenesArea(param: { id?: number; areaName: string; description?: string; pageId: number }[]) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.BATCH_SAVE_UPDATE_SCENE_AREA_URL, param, this.defaultConfig);
    return result;
  }

  /**
   * @description: 根据id删除场景区域(单个)
   * @param { id: 场景设备id }
   * @return:
   */
  async deleteScenesArea(param: { id: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.DELETE_SCENE_AREA_URL, param, this.onlyErrorConfig);
    return result;
  }

  //8082端口
  //节点管理
  /**
  * @description: 获取设备(组合查询)
  * @param { id:设备Id, online: 是否在线, devType: 类型值:decoded,encoded, keyword: 关键字}
  * @return:
  */
  async getStreamDeviceList(param: { id?: string; online?: boolean; devType?: string; keyword?: string; roomInfoId?: string }) {
    if (Vue.prototype.$loadMode === 0 && Vue.prototype.$electronEnv) {
      let localRes = ResponseBodyHelper.createResBody<Array<IStreamDevice>>(ResultType.TYPE_OK, await streamDevice.getStreamDeviceList(param), null)
      return localRes;
    }
    let result = await this.postRawJSON<GlobalBean.ResParams<ViewApiBean.InputDeviceInfo[]>>(this.urlConfig.STREAM_DEVICE_GET_URL, param);
    return result;
  }
  // //按区域查询节点
  // /**
  // * @description: 获取设备(组合查询)
  // * @param { id:设备Id, online: 是否在线, devType: 类型值:decoded,encoded, keyword: 关键字}
  // * @return:
  // */
  // async getStreamDeviceByRoomId(param: { roomInfoId?: string }) {
  //   // tslint:disable-next-line:max-line-length
  //   let result = await this.postRawJSON<GlobalBean.ResParams<any>>(this.urlConfig.STREAM_DEVICE_GET_URL, param, this.onlyErrorConfig);
  //   return result;
  // }

  /**
  * @description: 批量保存或更新设备
  * @param { id: 设备id, ip: 设备ip, devType: 设备类型; width, height, rotate, previewUrl, online, name, groupId, config}
  * @return:
  */
  // tslint:disable-next-line:max-line-length
  // param: { id?: string; ip?: string; devType?: string; width?: number; height?: number; rotate?: number; previewUrl?: string; online?: boolean; name: string; groupId?: string; config?: string
  async saveUpdateStreamDevice(param: IStreamDevice[]) {
    if (Vue.prototype.$loadMode === 0 && Vue.prototype.$electronEnv) {
      let res = await streamDevice.putOneData(param[0])
      let localRes = ResponseBodyHelper.createResBody<any>(ResultType.TYPE_OK, null, "更新成功!")
      if (res) {
        iMessage.success("更新成功!");
      }
      return localRes;
    }
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.STREAM_DEVICE_SAVE_UPDATE_URL, param, this.defaultConfig);
    return result;
  }

  /**
  * @description: 节点故障查询
  * @param { id:设备Id, online: 是否在线, devType: 类型值:decoded,encoded, keyword: 关键字}
  * @return:
  */
  async getStreamDeviceExceptList() {
    if (Vue.prototype.$loadMode === 0 && Vue.prototype.$electronEnv) {
      let res = [{ "id": "008903a23b334cc1bad6381a5c025b91", "ip": "192.168.11.222", "devType": "encoded", "width": 1920, "height": 1080, "rotate": null, "previewUrl": null, "online": false, "timeStamp": 1630633444730, "name": null, "roomInfoId": "202005424631714101", "status": "{\"kvm_status\":0,\"statistics\":{\"avgs\":[0,0,0],\"total\":0},\"version\":\"\",\"vi\":{\"height\":1080,\"status\":1,\"width\":1920}}", "config": null }]
      return res;
    }
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.ExceptionInfoInfo[]>>(this.urlConfig.STREAM_DEVICE_EXCEPTINFO_URL, this.onlyErrorConfig);
    return result;
  }

  //   /**
  // * @description: 节点重启
  // * @param { id:设备Id}
  // * @return:
  // */
  //   async getStreamDeviceRestart(param: { id: string }) {
  //     let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.STREAMDEVICE_RESTART_URL, param, this.onlyErrorConfig);
  //     return result;
  //   }

  /**
  * @description: 节点批量重启
  * @param { 传一个id数组}
  * @return:
  */
  async getStreamDeviceMultRestart(param: { ids: string[]; devType: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.STREAMDEVICE_MULT_RESTART_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
* @description: 获取版本号
* @param { id:设备Id}
* @return:
*/
  async getCodedVersion(param: { type: string; version: string }) {
    let result = await this.getFormat<GlobalBean.VersionInfo>(this.urlConfig.DEVPROGRAM_FINDLATEST_URL, param);
    return result;
  }


  //通道管理
  /**
   * @description:获取通道
   * @param {id: 通道id;}
   * @return:
   */
  async getChannelList(param: { id?: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.ChannelInfo[]>>(this.urlConfig.CHANNEL_GET_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 添加通道
  * @param {name; channelType, pollingDelay: 轮询间隔(ms), ip, port, comport: 串口:COM1-COM8, baudrate: 波特率, parity: 校验位:None,Even, dataBits: 数据位, stopBits: 停止位}
  * @return:
  */
  async addChannelInfo(param: any) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.CHANNEL_ADD_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 更新通道
  * @param {name; channelType, pollingDelay: 轮询间隔(ms), ip, port, comport: 串口:COM1-COM8, baudrate: 波特率, parity: 校验位:None,Even, dataBits: 数据位, stopBits: 停止位}
  * @return:
  */
  async updateChannelInfo(param: any) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.CHANNEL_UPDATE_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 删除通道
   * @param { id: 通道id }
   * @return:
   */
  async deleteChannel(param: { id: string }) {
    let result = await this.deleteFormat<any>(this.urlConfig.CHANNEL_DELETE_URL, param, this.onlyErrorConfig);
    return result;
  }

  //设备管理
  /**
   * @description: 获取设备
   * @param {id: 根据id查询}
   * @return:
   */
  async getDeviceList(param: { id?: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<any>>(this.urlConfig.DEVICE_GET_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 根据通道id获取设备
   * @param {chlId: 通道id}
   * @return:
   */
  async getDeviceByChlIdList(param: { chlId: string | null }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.DeviceInfo[]>>(this.urlConfig.DEVICE_GET_BY_CHLID_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 添加设备
  * @param {name; channelId: 通道id, deviceTypeId: 设备类型Id, protocol: 设备协议, address: 设备地址, comport: 串口号, baudrate: 波特率, parity: 校验位, dataBits: 数据位, stopBits: 停止位, comType: 通道类型}
  * @return:
  */
  async addUpdateDeviceInfo(param: any) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.DEVICE_ADD_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 更新设备
  * @param {}
  * @return:
  */
  async saveUptateDeviceInfo(param: any) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.DEVICE_UPDATE_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 删除设备
   * @param { id: 设备id }
   * @return:
   */
  async deleteDevice(param: { id: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.DEVICE_DELETE_URL, param, this.onlyErrorConfig);
    return result;
  }

  //通道管理
  /**
   * @description: 通道协议获取
   * @param {}
   * @return:
   */
  async getCommProtocolChannel(param: any) {
    let result = await this.getFormat<GlobalBean.ResParams<string[]>>(this.urlConfig.COMM_PROTOCOL_CHANNEL_GET_URL, param, this.onlyErrorConfig);
    return result;
  }
  /**
   * @description: 设备协议获取
   * @param {}
   * @return:
   */
  async getCommProtocolDevice(param: any) {
    let result = await this.getFormat<GlobalBean.ResParams<string[]>>(this.urlConfig.COMM_PROTOCOL_DEVICE_GET_URL, param, this.onlyErrorConfig);
    return result;
  }

  //命令执行管理
  /**
   * @description: 设备方法获取
   * @param {chlId: 通道id; devId: 设备id}
   * @return:
   */
  async getDevMethod(param: { chlId?: string; devId: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<any>>(this.urlConfig.CMD_DEV_METHOD_EXPORTED_URL, param, this.onlyErrorConfig);
    return result;
  }

  //页面管理
  /**
   * @description: 页面查询
   * @param {id: 页面id; name: 页面名称关键字; processId: 进程id} 不传参数查询全部,传了参数就根据参数查询,一次只能传一个参数
   * @return:
   */
  async getPageList(param: { id?: number; name?: string; processId?: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<any>>(this.urlConfig.PAGE_GET_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 根据processId和id查询页面
  * @param {processId: 进程id; id: 页面id; }
  * @return:
  */
  async getPageByProIdAndPageId(param: { processId: number; id: number }) {
    let result = await this.getFormat<any>(this.urlConfig.PAGE_BY_PROCESSID_ID_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 保存或更新一个页面
  * @param {id: 权限名称; permissionName: 页面名称; processId: 进程id; content: 内容}
  * @return:
  */
  async saveUpdatePageInfo(param: { id?: number; permissionName: string; processId: number; content: string }) {
    let result = await this.postRawJSON<any>(this.urlConfig.PAGE_SAVE_UPDATE_URL, param, this.defaultConfig);
    return result;
  }

  /**
   * @description: 删除一个页面
   * @param { id: 页面id }
   * @return:
   */
  async deletePageInfo(param: { id: number }) {
    let result = await this.getFormat<any>(this.urlConfig.PAGE_DELETE_URL, param, this.onlyErrorConfig);
    return result;
  }
  /**
   * @description: 复制页面
   * @param { id: 页面id }
   * @return:
   */
  async copyPageInfo(param: { pageId: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.COPY_PAGE_URL, param, this.onlyErrorConfig);
    return result;
  }

  //页面备份
  /**
  * @description: 查询备份页面数据
  * @param { backupId: 页面备份id}
  * @return:
  */
  async getPageBackup(param: { backupId?: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<ViewApiBean.PageBackupInfo>>(this.urlConfig.PAGE_BACKUP_GET, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 备份页面数据还原
  * @param { backupId: 页面备份id}
  * @return:
  */
  async recoverPageBackup(param: { backupId: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.PAGE_BACKUP_RECOVER, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 添加备份页面
  * @param { pageId: 页面id; description: 描述; pageBackupName: 备份名称}
  * @return:
  */
  async addPageBackup(param: { pageId: number; description: string; pageBackupName: string }) {
    let result = await this.post<GlobalBean.ResParams<string | null>>(this.urlConfig.PAGE_BACKUP_BACKUP, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 更新备份页面描述
  * @param { backupId: 页面备份id; description: 描述; pageBackupName: 备份名称}
  * @return:
  */
  async updatePageBackup(param: { backupId: string; description: string; pageBackupName: string }) {
    let result = await this.post<GlobalBean.ResParams<string | null>>(this.urlConfig.PAGE_BACKUP_UPDATE, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 删除一个备份页面
  * @param { backupId: 页面备份id;}
  * @return:
  */
  async deletePageBackup(param: { backupId: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.PAGE_BACKUP_DELETE, param, this.onlyErrorConfig);
    return result;
  }


  //前端组件状态管理
  /**
  * @description: 根据name组件状态管理
  * @param { name: 参数名称}
  * @return:
  */
  async webModuleGet(param: { name: string }) {
    let result = await this.getFormat<any>(this.urlConfig.WEBMODULE_GET, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 根据name组件状态管理
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async webModuleAdd(param: { name: string; value: string }) {
    let result = await this.postRawJSON<any>(this.urlConfig.WEBMODULE_ADD, param);
    return result;
  }

  /**
  * @description: 根据name组件状态管理
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async webModuleUpdate(param: { name: string; value: string }) {
    let result = await this.postRawJSON<any>(this.urlConfig.WEBMODULE_UPDATE, param);
    return result;
  }

  /**
  * @description: 根据name组件状态管理
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async webModuleDelete(param: { name: string }) {
    let result = await this.getFormat<any>(this.urlConfig.WEBMODULE_DELETE, param, this.onlyErrorConfig);
    return result;
  }

  //预案模式接口
  /**
  * @description: 根据name查预案列表
  * @param { name: 参数名称}
  * @return:
  */
  async contingencyPlanGet(param: { name: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.ContingencyPlanInfo>>(this.urlConfig.CONTINGENCYPLAN_GET, param);
    return result;
  }

  /**
  * @description: 根据name添加预案列表
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async contingencyPlanAdd(param: { name: string; value: string }) {
    let result = await this.postRawJSON<any>(this.urlConfig.CONTINGENCYPLAN_ADD, param);
    return result;
  }

  /**
  * @description: 根据name更新预案列表
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async contingencyPlanUpdate(param: { name: string; value: string }) {
    let result = await this.postRawJSON<any>(this.urlConfig.CONTINGENCYPLAN_UPDATE, param, this.defaultConfig);
    return result;
  }

  //房间区域管理
  /**
  * @description: 根据id区域查询
  * @param { name: 参数名称}
  * @return:
  */
  async roomGet(param: { id: string }) {
    let result = await this.getFormat<any>(this.urlConfig.ROOM_GET, param);
    return result;
  }

  /**
  * @description: 根据pageId获取树形结构
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async roomTreeGet(param: { pageId?: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.RoomTreeInfo[]>>(this.urlConfig.ROOM_TREE, param, this.onlyErrorConfig);
    return result;
  }

  //任务计划调度
  /**
   * @description: 查询任务计划
   * @param { id: 任务id; pageId: 页面id}
   * @return:
   */
  async taskGet(param: { id?: number; pageId?: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.TaskInfo>>(this.urlConfig.TASK_GET, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 添加或更新任务计划
  * @param { }
  * @return:
  */
  async taskAddUpdate(param: any) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.TASK_ADD_UPDATE, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 删除任务计划
  * @param { id: 任务id}
  * @return:
  */
  async taskDelete(param: { id: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.TASK_DELETE, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 开启/停用任务
  * @param { id: 任务id, state: true:启用;false:停止}
  * @return:
  */
  async taskUpdateState(param: { id: number; state: boolean }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.TASK_UPDATESTATE, param, this.onlyErrorConfig);
    return result;
  }

  //监控设备管理
  /**
   * @description: 监控设备查询
   * @param { supplierId: 供应商id; keyword: 根据名称模糊查询}
   * @return:
   */
  async monitorGet(param: { supplierId?: string; keyword?: string; online?: boolean }) {
    let result = await this.getFormat<GlobalBean.ResParams<any>>(this.urlConfig.MONITOR_GET, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 添加或更新
  * @param { }
  * @return:
  */
  async monitorAddUpdate(param: any) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.MONITOR_ADD_UPDATE, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 删除设备
  * @param { ids: 任务id}
  * @return:
  */
  async monitorDelete(param: number[]) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.MONITOR_DELETE, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 供应商查询
  * @param { file: }
  * @return:
  */
  async supplierGet() {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.Supplieinfo>>(this.urlConfig.SUPPLIER_GET, this.onlyErrorConfig);
    return result;
  }

  //海康威视摄像头
  /**
  * @description: 摄像头注册
  * @param { }
  * @return:
  */
  async videoStreamRegister(param: { ip: string; port: number; username: string; password: string }) {
    let result = await this.post<GlobalBean.ResParams<string | null>>(this.urlConfig.VIDEOSTREAM_REGISTER, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 开始/停止预览
  * @param { userId: 注册接口返回的唯一标识, channel: 开始预览接口需要传此参数,停止不需要, isPlay: true:开始预览:false:停止预览}
  * @return:
  */
  async videoStreamRealPlay(param: { userId: number; channel: number; isPlay: boolean }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.VIDEOSTREAM_REALPLAY, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 云台控制
  * @param { userId: 注册接口返回的唯一标识, ptzCmdType: 云台命令类型, isStop: (true:开始预览:false:停止预览)}
  * @return:
  */
  async videoStreamPtzCtrl(param: { userId: number; ptzCmdType: number; isStop: boolean }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.VIDEOSTREAM_PTZCTRL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 预置位设置
  * @param { userId: 注册接口返回的唯一标识, ptzPresetCmd: 预置位命令 8:设置预置点;9:清除预置点;39:转到预置点, presetIndex: 预置位索引,取值1-300}
  * @return:
  */
  async videoStreamPreset(param: { userId: number; ptzPresetCmd: number; presetIndex: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.VIDEOSTREAM_PRESET, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: rtsp推流
  * @param { username: , password: , port: rtsp端口, ip: , channel:}
  * @return:
  */
  async videoStreamPush(param: { username: string; password: string; port: number; ip: string; channel: number }) {
    let result = await this.post<GlobalBean.ResParams<GlobalBean.VideoStreamPushInfo>>(this.urlConfig.VIDEOSTREAM_PUSH, param, this.onlyErrorConfig);
    return result;
  }
  /**
* @description: 查询屏幕背景图片
* @param { pageScreenId: 页面屏幕 }
* @return:
*/
  async pagescreenGet(param: { pageScreenId: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.PageScreenInfo>>(this.urlConfig.PAGESCREEN_GET, param);
    return result;
  }

  /**
* @description: 更新屏幕背景图片
* @param { pageScreenId: 页面屏幕 }
* @return:
*/
  async pagescreenSaveorupdate(param: { pageScreenId: string; bgImage: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.PAGESCREEN_SAVEORUPDATE, param);
    return result;
  }

  //自定义布局接口
  /**
  * @description:
  * @param { name: 参数名称}
  * @return:
  */
  async customLayoutGet(param: { name: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.KeyValueInfo>>(this.urlConfig.CUSTOMLAYOUT_GET, param);
    return result;
  }

  /**
  * @description:
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async customLayoutAdd(param: { name: string; value: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.CUSTOMLAYOUT_ADD, param);
    return result;
  }

  /**
  * @description:
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async customLayoutUpdate(param: { name: string; value: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.CUSTOMLAYOUT_UPDATE, param, this.defaultConfig);
    return result;
  }

  /**
* @description:
* @param { name: 参数名称}
* @return:
*/
  async customLayoutdelete(param: { name: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.CUSTOMLAYOUT_DELETE, param);
    return result;
  }

  //屏幕锁接口
  /**
  * @description:
  * @param { name: 参数名称}
  * @return:
  */
  async screenLockGet(param: { name: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.KeyValueInfo>>(this.urlConfig.SCREENLOCK_GET, param);
    return result;
  }

  /**
  * @description:
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async screenLockAdd(param: { name: string; value: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.SCREENLOCK_ADD, param);
    return result;
  }

  /**
  * @description:
  * @param { name: 参数名称，value：值}
  * @return:
  */
  async screenLockUpdate(param: { name: string; value: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.SCREENLOCK_UPDATE, param, this.defaultConfig);
    return result;
  }

  /**
* @description:
* @param { name: 参数名称}
* @return:
*/
  async screenLockDelete(param: { name: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.SCREENLOCK_DELETE, param);
    return result;
  }
}

const apiService = new ViewApiClient();
export default apiService;