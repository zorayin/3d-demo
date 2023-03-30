import BasicApiService from "./BasicApiService";
import { ModuleTypes } from "@/types/moduleTypes";
import { commit } from "vuex-pathify";
import store from "@/store";
import { Message } from "element-ui"
import Vue from "vue"

const iMessage: any = Message;

const globalPath = (attr: string) => {
  return `${ModuleTypes.GLOBAL_MODULE}/${attr}`;
}

class GlobalApiClient extends BasicApiService {
  async getLoginInfo() {
    let result = await this.post<ViewApiBean.UserByRoleInfo | null>(this.urlConfig.GET_LOGIN_INFO, {}, this.onlyErrorConfig);
    return result;
  }

  async loginOut() {
    let result = await this.get<string | null>(this.urlConfig.LOGIN_OUT_URL, this.onlyErrorConfig);
    return result;
  }


  async getUserList() {
    if (Vue.prototype.$loadMode === 0 && Vue.prototype.$electronEnv) {
      return [];
    }
    let result = await this.get<GlobalBean.ResParams<GlobalBean.UserByCurUserId[]>>(this.urlConfig.USER_GET_URL, this.onlyErrorConfig);
    return result;
  }

  // 设备管理
  async getChannelList(param: any) {
    let result = await this.get<GlobalBean.ResParams<GlobalBean.ChannelInfo[]>>(`${this.urlConfig.CHANNEL_GET_URL}?${param}`, this.onlyErrorConfig);
    return result;
  }

  async addChannelInfo(param: any) {
    let result = await this.postRawJSON<GlobalBean.ChannelInfo>(this.urlConfig.CHANNEL_ADD_URL, param, this.defaultConfig);
    return result;
  }

  async updateChannelInfo(param: any) {
    let result = await this.put<boolean>(this.urlConfig.CHANNEL_UPDATE_URL, param, this.defaultConfig);
    return result;
  }

  // async getDeviceList(param: any) {
  //   let result = await this.get<GlobalBean.ResParams<ViewApiBean.InputDeviceInfo[] | ViewApiBean.OutputDeviceInfo[]>>(`${this.urlConfig.DEVICE_GET_URL}?${param}`, this.onlyErrorConfig);
  //   return result;
  // }

  async getDeviceBychlId(param: any) {
    let result = await this.get<GlobalBean.ResParams<GlobalBean.DeviceInfo[]>>(`${this.urlConfig.DEVICE_GET_BY_CHLID_URL}?${param}`, this.onlyErrorConfig);
    return result;
  }


  // 设备类型管理
  async getDeviceTypeList() {
    let result = await this.get<GlobalBean.DeviceTypeInfo[]>(this.urlConfig.GET_DEVICE_TYPE_URL, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 添加设备类型
   * @param { name: 类型名称, description: 类型描述 }
   * @return:
   */
  async addDevTypeInfo(param: GlobalBean.DeviceTypeInfo = { name: "新设备类型", description: "类型描述" }) {
    let result = await this.postRawJSON<GlobalBean.DeviceTypeInfo>(this.urlConfig.ADD_DEV_TYPE_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 更新设备类型
   * @param {id: 设备类型id, name: 类型名称, description: 类型描述 }
   * @return:
   */
  async updateDevTypeInfo(param: GlobalBean.DeviceTypeInfo = { id: "", name: "新设备类型", description: "类型描述" }) {
    let result = await this.put<boolean>(this.urlConfig.UPDATE_DEV_TYPE_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 删除设备类型
   * @param {id: 设备类型id }
   * @return:
   */
  async deleteDevTypeInfo(param: { id: string } = { id: "" }) {
    let result = await this.deleteFormat<boolean>(this.urlConfig.DELETE_DEV_TYPE_URL, param, this.onlyErrorConfig);
    return result;
  }


  // // 设备类型导出/导入
  // /**
  //  * @description: 设备类型数据导出
  //  * @param { devTypeId: 设备类型id }
  //  * @return:
  //  */
  // async exportOperationInfo(param: { devTypeId: string } = { devTypeId: "" }) {
  //   let result = await this.postRawJSON<any>(this.urlConfig.DEVICE_TYPE_EXPORT, param, this.onlyErrorConfig);
  //   return result;
  // }

  /**
   * @description: 设备类型数据导入
   * @param { devTypeId: 设备类型id, file: excel文件 }
   * @return:
   */
  async importOperationInfo(param: { devTypeId: string | undefined; file: any } = { devTypeId: "", file: "" }) {
    let result = await this.upload<any>(this.urlConfig.DEVICE_TYPE_IMPORT, param, this.onlyErrorConfig);
    return result;
  }

  // /**
  //  * @description: 获取渠道方法以及参数
  //  * @param { chlId: 渠道Id }
  //  * @return:
  //  */
  // async getMethodParamList(param: { chlId: string; devId: string }) {
  //   let result = await this.getFormat<GlobalBean.ResParams<any>>(this.urlConfig.CMD_DEV_METHOD_EXPORTED_URL, param, this.onlyErrorConfig);
  //   return result;
  // }

  /**
   * @description: 通道执行方法
   * @param { chlId: 渠道Id; devId: 设备Id; method: 方法名称; parameters: 附加参数,多个参数时使用|分割; timeout: 超时时间，默认500ms }
   * @return:
   */
  async executeChannelTask<T>(param: GlobalBean.ExecuteOrderBean) {
    let result = await this.postRawJSON<GlobalBean.ResParams<T>>(this.urlConfig.CMD_DEV_METHOD_INVOKE_URL, param);
    return result;
  }

  // // 操作类型
  // /**
  //  * @description: 获取设备操作类型列表
  //  * @param { id: 设备id }
  //  * @return:
  //  */
  // async getDevOperateList(param: { id: string }) {
  //   let result = await this.getFormat<GlobalBean.ResParams>(this.urlConfig.GET_OPERATION_BY_TYPE_URL, param, this.onlyErrorConfig);
  //   return result;
  // }

  /**
  * @description: 查询所有超链接地址
  * @param null
  * @return:
  */
  async getAllHyperlink() {
    let result = await this.get<any>(this.urlConfig.GET_PAGESTORAGE_GET_HYPERLINK, this.onlyErrorConfig);
    return result;
  }

  //   /**
  // * @description: 获取分组
  // * @param {}
  // * @return:
  // */
  //   async getGroupTree(param: {}) {
  //     let result = await this.get<GlobalBean.ResParams<GlobalBean.GroupTree[]>>(this.urlConfig.GET_GROUP_TREE_URL, this.onlyErrorConfig);
  //     return result;
  //   }

  /**
 * @description: 添加或者修改
 * @param {  "id":"0", "nickName":"","url":"" }
 * @return:
 */
  async postSaveOrUpdateHyperlink(param: { id: string; nickName: string; url: string }) {
    let result = await this.postRawJSON<any>(this.urlConfig.POST_PAGESTORAGE_SAVEORUPDATE_HYPERLINK, param, this.defaultConfig);
    return result;
  }


  /**
 * @description: 删除
 * @param {  "id":"0" }
 * @return:
 */
  async deleteHyperlink(id: string) {
    let result = await this.get<any>(`${this.urlConfig.DELETE_PAGESTORAGE_DELETE_HYPERLINK}?id=${id}`, this.onlyErrorConfig);
    return result;
  }


  //静态资源管理
  /**
   * @description: 文件查询
   * @param {orderType:排序(字段类型1:uploadTime;2:materialName;3:materialSize),isAscOrder:(true:升序;false:降序),materialName: 名称, materialType: 类型(iamge,video,audio,document),directoryPath:文件夹路径,此参数优先级最大 }
   * @return:
   */
  async getResourceStatis(param: { orderType?: number | null; isAscOrder?: boolean; materialType?: string | null; materialName?: string | null; directoryPath?: string | null }) {
    let result = await this.postRawJSON<any>(this.urlConfig.GET_RESOURCE_STATIC, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 文件删除
   * @param { ids: 带有文件名(不含后缀)数组 }
   * @return:
   */
  async deleteResourceStatis(param: string[]) {
    let result = await this.postRawJSON<any>(this.urlConfig.DELETE_RESOURCE_STATIC, param, this.defaultConfig);
    return result;
  }

  /**
   * @description: 创建文件夹
   * @param { directoryPath: 文件夹路径 }
   * @return:
   */
  async creatDirectory(param: { directoryPath: string }) {
    let result = await this.getFormat<any>(this.urlConfig.CREAT_DIRECTORY_RESOURCE_STATIC, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 文件树获取
   * @param null
   * @return:
  */
  async getDirectoryTree() {
    let result = await this.get<any>(this.urlConfig.GET_DIRECTORY_TREE_RESOURCE_STATIC, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 文件夹名称修改
   * @param { directoryPath: 文件路径名,如image/test.jpg; newName: 新的文件名包含后缀 }
   * @return:
   */
  async updateDirectoryName(param: { directoryPath: string | null; newName: string }) {
    let result = await this.getFormat<any>(this.urlConfig.UPDATE_DIRECTORY_MODIFYNAME, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 文件名称修改
   * @param { id: 资源的id; newMaterialName: 新的名称 }
   * @return:
   */
  async updateFileName(param: { id: string; newMaterialName: string }) {
    let result = await this.getFormat<any>(this.urlConfig.UPDATE_FILE_MODIFYNAME, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 文件上传
   * @param { file: 文件信息 }
   * @return:
   */
  async uploadFile(param: { directoryPath: string, uploadFiles: any }) {
    let result = await this.postFormData<any>(this.urlConfig.UPLOAD_RESOURCE_STATIC, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 文件下载
   * @param { filePath: 文件路径 }
   * @return:
   */
   async downloadFile(filePath: string) {
    let result = await this.get<any>(filePath, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 解析本地路径
   * @param { filePath: 文件路径 }
   * @return:
   */
   async resolveLocalPath(filePath: string) {
    let result = await this.get<GlobalBean.ResParams<string>>(`${this.urlConfig.RESOLVE_LOCAL_PATH}?filePath=${filePath}`, this.onlyErrorConfig);
    return result;
  }


  //8082端口
  //用户管理
  /**
   * @description: 用户登录
   * @param { id: 资源的id; newMaterialName: 新的名称 }
   * @return:
   */
  async userLogin(param: { username: string; password: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<GlobalBean.UserloginiInfo>>(this.urlConfig.USER_LOGIN_URL, param, this.onlyErrorConfig);
    return result;
  }
  /**
   * @description: 查询用户 (id和username不传则查询当前用户权限可获取的全部用户)
   * @param { id: 用户id; username: 用户名; currentUserId: 当前登录用户的id }
   * @return:
   */
  async getUserInfoList(param: { id?: number; username?: string }) {

    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.UserByCurUserId[]>>(this.urlConfig.USER_GET_URL, param, this.onlyErrorConfig);
    // tslint:disable-next-line:max-line-length
    let res: any = { result: { id: 7, username: "gdcs", nickName: null, password: "919f1ed8e15cea828ac8bed26dc9290d", phone: "13174895602", mail: "123@qq.com", department: "管理部", role: "超级管理员", lastLoginTime: "2021-04-25 15:26:36", otherLoginSource: null, roleId: 1, departId: 4, otherLogin: false }, message: null, type: "SUCCESS" }
    if (Vue.prototype.$loadMode === 0 && Vue.prototype.$electronEnv) {
      result = res
    }
    if (result.type === 'SUCCESS') {
      let uInfo: GlobalBean.UserByCurUserId | null = null;
      if (Array.isArray(result.result)) {
        result.result.forEach((ele) => {
          if (!param.id) return;
          if (ele.id === param.id) {
            uInfo = ele;
          }
        })
      } else {
        uInfo = result.result;
      }
      commit(globalPath("SET_USER_INFO"), uInfo);
    } else {
      commit(globalPath("SET_USER_INFO"), null);
      if (result.message !== null && result.message !== "没有查询到数据" && result.message !== "未查询到数据") {
        iMessage.warning(result.message);
      }
    }
    return result;
  }
  /**
  * @description: 用户添加
  * @param {username:用户名; nickName:昵称别名; phone: 电话号码; mail:邮箱; departmentId:部门id;}
  * @return:
  */
  async addUserInfo(param: { username: string; nickName?: string; phone: string; mail: string; departmentId?: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.USER_ADD_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 用户更新
  * @param {id: 用户id; username:用户名; nickName:昵称别名; password: 密码; phone: 电话号码; mail:邮箱; departId:部门id; roleId: 角色id}
  * @return:
  */
  async updateUserInfo(param: any) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.USER_UPDATE_URL, param, this.onlyErrorConfig);
    return result;
  }
  /**
   * @description: 删除用户
   * @param { id: 删除用户的id; currentUserId: 当前登录用户id}
   * @return:
   */
  async deleteUserInfo(param: { id: number; currentUserId: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.USER_DELETE_URL, param, this.onlyErrorConfig);
    return result;
  }
  /**
   * @description: 发送验证码到邮箱
   * @param {mailAddress: 邮箱地址}
   * @return:
   */
  async getVerCode(param: { mailAddress: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.VER_CODE_GET_URL, param, this.onlyErrorConfig);
    return result;
  }
  /**
   * @description: 重置密码
   * @param {verCode: 获取到的验证码; password: 新的密码}
   * @return:
   */
  async resetPassword(param: { verCode: string; password: string }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.RESET_PASSWORD_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 修改密码
   * @param {newPsw: 新的密码}
   * @return:
   */
  async modifyPassword(param: { newPsw: string }) {
    let result = await this.post<GlobalBean.ResParams<string | null>>(this.urlConfig.MODIFY_PASSWORD_URL, param, this.onlyErrorConfig);
    return result;
  }


  //角色管理
  /**
   * @description: 查询全部角色
   * @param {}
   * @return:
   */
  async getRoleList(param: {}) {
    let result = await this.getFormat<GlobalBean.ResParams<ViewApiBean.RoleInfo>>(this.urlConfig.ROLE_GET_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 新增角色
  * @param {roleName: 角色名称, permissionIds: 权限id数组}
  * @return:
  */
  async addRoleInfo(param: { roleName: string; permissionIds: number[] }) {
    let result = await this.postRawJSON<GlobalBean.ResParams<string | null>>(this.urlConfig.ROLE_ADD_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 更新角色
  * @param {id: 角色id; roleName: 角色名称; permissionIds: 权限id数组}
  * @return:
  */
  async updateRoleInfo(param: { id: number; roleName: string; permissionIds?: number[] }) {
    let result = await this.postRawJSON<any>(this.urlConfig.ROLE_UPDATE_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 删除角色
   * @param { id: 角色id }
   * @return:
   */
  async deleteRoleInfo(param: { id: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.ROLE_DELETE_URL, param, this.onlyErrorConfig);
    return result;
  }



  //部门管理
  /**
   * @description: 查询全部部门信息
   * @param {}
   * @return:
   */
  async getDepartmentList(param: any) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.DepartmentInfo[]>>(this.urlConfig.DEPART_GET_URL, param, this.onlyErrorConfig);
    return result;
  }

  // /**
  // * @description: 新增部门
  // * @param {departName: 角色名称}
  // * @return:
  // */
  // async addDepartmentInfo(param: { departName: string }) {
  //   let result = await this.postRawJSON<any>(this.urlConfig.DEPART_ADD_URL, param, this.defaultConfig);
  //   return result;
  // }

  // /**
  // * @description: 更新部门
  // * @param {oldDepartName: 原部门名称; newDepartName: 新的部门名称}
  // * @return:
  // */
  // async updateDepartmentInfo(param: { oldDepartName: string; newDepartName: string }) {
  //   let result = await this.postRawJSON<any>(this.urlConfig.DEPART_UPDATE_URL, param, this.defaultConfig);
  //   return result;
  // }

  // /**
  //  * @description: 删除部门
  //  * @param { departName: 部门名称 }
  //  * @return:
  //  */
  // async deleteDepartmentInfo(param: { departName: string }) {
  //   let result = await this.deleteFormat<any>(this.urlConfig.ROLE_DELETE_URL, param, this.onlyErrorConfig);
  //   return result;
  // }

  //权限管理
  /**
   * @description:获取权限
   * @param {id: 权限id; userId: 用户id}
   * @return:
   */
  async getPermissionList(param: { id?: number }) {
    let result = await this.getFormat<GlobalBean.ResParams<GlobalBean.PermissionInfo[]>>(this.urlConfig.PERMISSION_GET_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 新增权限
  * @param {permissionName: 权限名称; parentId: 父权限id}
  * @return:
  */
  async addPermissionInfo(param: { permissionName: string; parentId?: number }) {
    let result = await this.postRawJSON<any>(this.urlConfig.PERMISSION_ADD_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
  * @description: 根据权限id更新权限名称
  * @param {id: 权限id; perimissionName: 权限名称; parentId: 权限父id}
  * @return:
  */
  async updatePermissionInfo(param: { id: number; perimissionName: string; parentId?: number }) {
    let result = await this.postRawJSON<any>(this.urlConfig.PERMISSION_UPDATE_URL, param, this.onlyErrorConfig);
    return result;
  }

  /**
   * @description: 删除权限
   * @param { 参数传递为带有权限id的数组,例:[8,9,10] }
   * @return:
   */
  async deletePermissionInfo(param: number[]) {
    let result = await this.postRawJSON<any>(this.urlConfig.PERMISSION_DELETE_URL, param, this.onlyErrorConfig);
    return result;
  }
  /**
   * @description: 获取权限树形结构
   * @param { id: 角色id }
   * @return:
   */
  async getPermissionTree() {
    let result = await this.get<GlobalBean.ResParams<GlobalBean.PermissionInfo[]>>(this.urlConfig.PERMISSION_TREE_URL, this.onlyErrorConfig);
    // tslint:disable-next-line:object-literal-key-quotes
    let res: any = { "result": [{ "id": 71, "permissionName": "设备运维", "parentId": null, "processId": null, "createTime": "2021-05-12 15:04:14", "content": null, "children": [{ "id": 73, "permissionName": "节点管理", "parentId": 71, "processId": null, "createTime": "2021-05-12 15:05:48", "content": null, "children": [], "page": false }, { "id": 74, "permissionName": "设备管理", "parentId": 71, "processId": null, "createTime": "2021-05-12 15:06:02", "content": null, "children": [], "page": false }, { "id": 75, "permissionName": "设备测试", "parentId": 71, "processId": null, "createTime": "2021-05-12 15:06:31", "content": null, "children": [], "page": false }, { "id": 76, "permissionName": "场景管理", "parentId": 71, "processId": null, "createTime": "2021-05-12 15:06:37", "content": null, "children": [], "page": false }, { "id": 77, "permissionName": "设备命令", "parentId": 71, "processId": null, "createTime": "2021-05-12 15:07:02", "content": null, "children": [], "page": false }, { "id": 78, "permissionName": "区域管理", "parentId": 71, "processId": null, "createTime": "2021-05-12 15:07:17", "content": null, "children": [], "page": false }, { "id": 114, "permissionName": "计划调度", "parentId": 71, "processId": null, "createTime": "2021-08-10 17:12:24", "content": null, "children": [], "page": false }, { "id": 115, "permissionName": "摄像头管理", "parentId": 71, "processId": null, "createTime": "2021-08-10 17:12:41", "content": null, "children": [], "page": false }, { "id": 116, "permissionName": "页面备份", "parentId": 71, "processId": null, "createTime": "2021-08-10 17:12:54", "content": null, "children": [], "page": false }], "page": false }, { "id": 72, "permissionName": "界面制作", "parentId": null, "processId": null, "createTime": "2021-05-12 15:05:31", "content": null, "children": [], "page": false }, { "id": 94, "permissionName": "主界面", "parentId": null, "processId": null, "createTime": "2021-06-15 16:55:50", "content": null, "children": [{ "id": 144, "permissionName": "节点配置管理", "parentId": 94, "processId": null, "createTime": "2021-09-24 16:53:01", "content": null, "children": [], "page": false }], "page": false }, { "id": 0, "permissionName": "页面列表", "parentId": null, "processId": null, "createTime": null, "content": null, "children": [{ "id": 13, "permissionName": "测试音视频", "parentId": 0, "processId": 4, "createTime": "2021-05-13 16:52:54", "content": null, "children": [], "page": true }, { "id": 62, "permissionName": "测试组件", "parentId": 0, "processId": 4, "createTime": "2021-05-25 11:24:42", "content": null, "children": [], "page": true }, { "id": 63, "permissionName": "测试音视频", "parentId": 0, "processId": 4, "createTime": "2021-05-11 14:42:51", "content": null, "children": [], "page": true }, { "id": 90, "permissionName": "测试页面", "parentId": 0, "processId": 4, "createTime": "2021-06-07 17:01:42", "content": null, "children": [], "page": true }, { "id": 91, "permissionName": "新版畅视展厅", "parentId": 0, "processId": 4, "createTime": "2021-08-12 11:06:10", "content": null, "children": [], "page": true }, { "id": 93, "permissionName": "演示制作畅视展厅", "parentId": 0, "processId": 4, "createTime": "2021-07-21 09:59:07", "content": null, "children": [], "page": true }, { "id": 95, "permissionName": "大埔音视频", "parentId": 0, "processId": 4, "createTime": "2021-07-21 09:57:54", "content": null, "children": [], "page": true }, { "id": 99, "permissionName": "大浦音视频(正式版)", "parentId": 0, "processId": 4, "createTime": "2021-09-22 15:45:28", "content": null, "children": [], "page": true }, { "id": 136, "permissionName": "测试页面_备份", "parentId": 0, "processId": 4, "createTime": "2021-09-15 19:09:38", "content": null, "children": [], "page": true }, { "id": 138, "permissionName": "测试大浦返回输出盒子", "parentId": 0, "processId": 4, "createTime": "2021-09-15 19:12:54", "content": null, "children": [], "page": true }, { "id": 140, "permissionName": "测试页面_备份", "parentId": 0, "processId": 4, "createTime": "2021-09-15 19:11:39", "content": null, "children": [], "page": true }, { "id": 179, "permissionName": "新建页面_备份3_备份", "parentId": 0, "processId": 4, "createTime": "2021-10-19 09:49:57", "content": null, "children": [], "page": true }, { "id": 182, "permissionName": "测试按钮绑定命令", "parentId": 0, "processId": 4, "createTime": "2021-10-22 11:42:30", "content": null, "children": [], "page": true }, { "id": 184, "permissionName": "新建页面11111111111111111111111111111", "parentId": 0, "processId": 4, "createTime": "2021-10-25 11:35:42", "content": null, "children": [], "page": true }, { "id": 188, "permissionName": "新建页面", "parentId": 0, "processId": 4, "createTime": "2021-10-26 14:44:24", "content": null, "children": [], "page": true }], "page": false }], "message": null, "type": "SUCCESS" }
    if (Vue.prototype.$loadMode === 0 && Vue.prototype.$electronEnv) {
      result = res
    }
    return result;
  }

  /**
 * @description: 添加上传一个配置文件
 * @param { alias: 别名; strConfigJson: 默认配置的json}
 * @return:
 */
  async defaultConfigAddOneConfigFile(param: { alias: string; strConfigJson: string }) {
    let result = await this.postFormData<GlobalBean.ResParams<string | null>>(this.urlConfig.DEFAULTCONFIG_ADDONECONFIGFILE, param, this.onlyErrorConfig);
    return result;
  }

  /**
* @description: 查看全部文件信息
* @param {  }
* @return:
*/
  async defaultConfigGet() {
    let result = await this.get<GlobalBean.ResParams<GlobalBean.ConfigInfo[]>>(this.urlConfig.DEFAULTCONFIG_GET);
    return result;
  }

  /**
* @description: 获取单个配置文件信息
* @param { id: string }
* @return:
*/
  async defaultConfigGetconfig(param: { id: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<string>>(this.urlConfig.DEFAULTCONFIG_GETCONFIG, param);
    return result;
  }

  /**
* @description: 更新配置信息json
* @param { alias: 别名; strConfigJson: 默认配置的json}
* @return:
*/
  async defaultConfigUpdateConfigById(param: { id: string; strConfigJson: string }) {
    let result = await this.postFormData<GlobalBean.ResParams<string | null>>(this.urlConfig.DEFAULTCONFIG_UPDATECONFIGBYID, param, this.defaultConfig);
    return result;
  }

  /**
* @description: 删除一个配置文件
* @param { id: string }
* @return:
*/
  async defaultConfigDelete(param: { id: string }) {
    let result = await this.getFormat<GlobalBean.ResParams<string | null>>(this.urlConfig.DEFAULTCONFIG_DELETE, param, this.defaultConfig);
    return result;
  }

}

const apiService = new GlobalApiClient();
export default apiService;