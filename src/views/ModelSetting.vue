<template>
  <div class="model-setting">
    <div class="menu">
      <el-form label-width="120px" size="large" label-position="right">
        <h3>模型设置</h3>

        <el-form-item label="上传模型文件">
          <input
            ref="file"
            class="fileUploaderClass"
            type="file"
            name="file"
            webkitdirectory
            @change="changesData"
          />
        </el-form-item>
        <el-form-item label="视野范围">
          <el-slider v-model="fov" :min="35" :max="75" @input="fovChange" />
        </el-form-item>
        <el-form-item label="初始视角">
          <el-radio-group v-model="form.resource">
            <el-radio label="区域入口" />
            <el-radio label="区域中心" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="场景亮度">
          <el-slider
            v-model="luminance"
            :step="1"
            :min="0"
            :max="5"
            show-stops
            @input="luminanceChange"
          />
        </el-form-item>
        <el-form-item label="场景切换动画">
          <el-select v-model="form.region" placeholder="请选择">
            <el-option label="动画1" value="动画1" />
            <el-option label="动画2" value="动画2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <span style="font-size: 16px; color: gray">灯光设备绑定</span>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in modelLights"
          :key="index"
          :label="item.value"
        >
          <el-select v-model="item.placeholder" class="m-2" placeholder="Select">
            <el-option
              v-for="item in devLights"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <span style="font-size: 16px; color: gray">屏幕设备绑定</span>
        </el-form-item>
        <el-form-item
          :label="item.label"
          v-for="(item, index) in modelScreen"
          :key="index"
        >
          <el-radio-group v-model="item.mode" @change="modeTypeChange">
            <el-radio label="输入设备" />
            <el-radio label="输出设备" />
          </el-radio-group>
          <el-select
            v-model="item.ip"
            v-if="item.mode == '输入设备'"
            class="m-2"
            @change="bindScreenSignal(item)"
          >
            <el-option
              v-for="(item, index) in inputDev"
              :key="index"
              :label="item.ip"
              :value="item.ip"
            />
          </el-select>
          <el-button
            type="text"
            v-if="item.mode == '输出设备'"
            @click="(dialogFormVisible = true), openConfigPanel(item)"
            >打开屏幕配置面板</el-button
          >
        </el-form-item>
        <el-button type="primary" @click="onSubmit" style="margin-bottom: 10px"
          >预览</el-button
        >
      </el-form>
    </div>
    <div class="model" ref="model"></div>
    <!-- <img src="http://192.168.1.81:8080/test2/192.168.10.109:8001" alt="" /> -->

    <div class="echoCanvas">
      <canvas
        v-for="(item, index) in inputDev"
        :key="index"
        ref="myCanvas"
        width="1960"
        height="1080"
      ></canvas>
    </div>
    <div class="canvas-img">
      <img
        v-for="(item, index) in inputDev"
        :key="index"
        crossorigin="anonymous"
        class="signalImg"
        ref="signalImg"
        style="left: 0; top: 0"
      />
    </div>

    <!-- 屏幕设置 -->
    <el-dialog v-model="dialogFormVisible" title="屏幕配置">
      <el-form>
        <div class="basic-info" style="text-align: left">
          <div class="screen-name" style="margin-bottom: 12px">
            <label for="name">屏幕名称</label>
            <el-input type="text" name="name" style="width: 177px; margin-left: 10px" />
          </div>
          <div class="screen-grid">
            <label for="grid">屏幕网格</label>
            <el-input
              style="width: 177px; margin-left: 10px"
              type="number"
              name="grid"
              v-model="rowNum"
              :min="1"
              :max="4"
            />
            *
            <el-input
              style="width: 177px"
              type="number"
              name="grid"
              v-model="colNum"
              :min="1"
              :max="4"
            />
          </div>
        </div>
        <div class="screen-info">
          <div class="screen-table" ref="screen"></div>
          <div class="screen-list">
            <ul>
              <li
                v-for="(item, index) in inputDev"
                :key="index"
                @dblclick="fillScreen(item)"
              >
                <div class="preview">
                  <img ref="previewImg" class="preview-img" />
                </div>
                <span>{{ item.ip }}</span>
              </li>
            </ul>
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            type="primary"
            @click="(dialogFormVisible = false), saveScreenConfig(item)"
            >保存</el-button
          >
          <el-button @click="dialogFormVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
interface FileInfo {
  file: File;
  link: string;
  fileName: string;
}
interface TextureInfo {
  texture: CanvasTexture;
  sourceIndex: number;
  signalIp: string;
}
interface File {
  lastModified: number;
  lastModifiedDate: any;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}
interface ScreenInfo {
  id: string;
  name: string;
  rowNum: number;
  colNum: number;
  rotate: number;
  gridInfos: any[];
}

import { Options, Vue } from "vue-class-component";
import { reactive, ref, setDevtoolsHook } from "vue";
import * as THREE from "three";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
const OrbitControls = require("three-orbit-controls")(THREE);
const TWEEN = require("@tweenjs/tween.js");
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { CanvasTexture } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Watch } from "vue-property-decorator";
import axios from "axios";
import { ElMessageBox } from "element-plus";

@Options({
  components: {},
})
export default class ModelSetting extends Vue {
  private fileList: any;
  private form = reactive({
    name: "",
    region: "",
    date1: "",
    date2: "",
    delivery: false,
    type: [],
    resource: "",
    desc: "",
    instFilePics: [],
    instFile: [],
  });
  private screenSettingForm = reactive({});
  private fov = ref(50);
  private luminance = ref(1);
  private modelLights: any[] = [];
  private devLights = [{ value: "设备灯光1" }, { value: "设备灯光2" }];

  private modelScreen: any[] = [];
  private devScreen = [
    { value: "192.168.11.236:8001" },
    { value: "192.168.11.231:8001" },
    { value: "192.168.11.227:8001" },
    // { value: "192.168.11.226:8001" },
    { value: "192.168.11.235:8001" },
  ];
  private inputDev: any[] = [];
  private outputDev: any[] = [];

  private renderer: any = "";
  private scene: any = "";
  private camera: any = "";
  private light: any = "";
  private controls: any = "";
  /**
   * 导入模型转链接信息
   */
  private onlineFiles: FileInfo[] = [];
  private ambient: any = "";
  /**
   * 模型屏幕贴图信息
   */
  private textures: TextureInfo[] = [];
  /**
   * 模型类型
   */
  private modelType: string = "";
  /**
   * 模型文件信息
   */
  private file: File[] = [];
  /**
   * 模型屏幕配置
   */
  private screenConfig: any = "";
  /**
   * 输出屏幕配置信息
   */
  private outScreenCon: ScreenInfo | null = null;
  private dialogFormVisible = false;
  private rowNum = ref(1);
  private colNum = ref(1);

  @Watch("rowNum")
  @Watch("colNum")
  tableChange() {
    this.drawScreenGrid();
  }

  @Watch("dialogFormVisible")
  dislogVisibleChange() {
    if (!this.dialogFormVisible) return;
    setTimeout(() => {
      this.drawScreenGrid();
      this.drawOutputPreview();
    }, 0);
  }

  /**
   * 输出配置设置
   */
  openConfigPanel(item: any) {
    console.log(item);
  }

  /**
   * 绘制屏幕网格
   */
  drawScreenGrid() {
    let screen = this.$refs.screen as HTMLElement;
    const { width, height } = screen.getBoundingClientRect();
    console.log(width, height);
    let table = document.getElementById("grid") as HTMLTableElement;
    if (table) {
      screen.removeChild(table);
    }
    table = document.createElement("table");
    table.id = "grid";
    table.style.width = width + "px";
    table.style.height = height + "px";
    table.border = "1";
    table.cellSpacing = "0";
    let row = Number(this.rowNum);
    let col = Number(this.colNum);
    console.log(row, col);
    for (let i = 0; i < row; i++) {
      let tr = document.createElement("tr");
      tr.style.width = width / col + "px";
      tr.style.height = height / row + "px";
      for (let j = 0; j < col; j++) {
        let td = document.createElement("td");
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    screen.appendChild(table);
  }

  /**
   * 绘制输出预览图
   */
  drawOutputPreview() {
    let previews = this.$refs.previewImg as HTMLImageElement[];

    for (let i = 0; i < previews.length; i++) {
      previews[i].src =
        "http://192.168.1.81:8080/test2/" + this.outputDev[i].ip + ":8001";
    }
  }

  /**
   * 双击输出信号源填充到屏幕
   */
  fillScreen(item: any) {
    console.log(item);
    let table = document.getElementById("grid") as HTMLTableElement;
    // console.log(table);
    console.log(table.childNodes);
    let row = table.childNodes;
    for (let i = 0; i < row.length; i++) {
      let screen = row[i].childNodes;
      console.log(screen);

      for (let j = 0; j < screen.length; j++) {
        (screen[j] as HTMLElement).innerText = item.ip;
      }
    }
    // console.log(table.children);
  }

  /**
   * 保存屏幕配置
   */
  saveScreenConfig(value: any) {
    console.log(value);
    //   this.outScreenCon={
    //   id: ,
    // name: ,
    // rowNum:,
    // colNum: ,
    // rotate: ,
    // gridInfos: ,
    //   }
  }

  mounted() {
    // (this.$refs.uploadFile as any).$children[0].$refs.input.webkitdirectory = true;
    let modiDevList = [
      {
        devId: "192.168.1.81:8080",
        winInfo: {
          id: 2,
          z: 2,
          devId: "192.168.1.81:8080",
          x: -33,
          y: 40,
          w: 960,
          h: 1080,
          input: "",
          hasRight: true,
          hasBottom: false,
        },
      },
    ];

    this.test(modiDevList as any);
    this.getDevData();
  }

  fileChang(file: any, fileList: any, name: any) {
    this.form.instFilePics = fileList;
    console.log(fileList);
  }
  fileRemove(file: any, fileList: any, name: any) {
    this.form.instFilePics = fileList;
    console.log(fileList);
  }

  /**
   * 获取输入输出设备配置
   */
  async getDevData() {
    this.inputDev = await axios.get("/data/inputDev.json").then((res) => {
      return res.data.result;
    });
    this.outputDev = await axios.get("/data/outputDev.json").then((res) => {
      return res.data.result;
    });
    console.log(this.inputDev);
    console.log(this.outputDev);
  }

  async test(
    winInfo: {
      id?: number;
      w: number;
      h: number;
      x: number;
      y: number;
      z: number;
      input: string;
    }[]
  ) {
    let tempHeader: any = {
      headers: {
        "content-type": "application/json",
        token:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTA2OTc3MjIsInVzZXJJZCI6ImdkY3MifQ.tWqBE8ZGeivIhzcC1DWafr6pForL8InuVAodXFedJCg",
      },
    };
    try {
      let result = await axios.post(
        "http://localhost:8080/api/media/win/createDiffWinInDiffDev",
        winInfo,
        tempHeader
      );
      console.log(result);
      return result;
    } catch (e: any) {
      console.log(e);
      return e.response;
    }
  }

  /**
   * 摄像机视野更改
   * @param {value:垂直视野角度}
   */
  fovChange(value: number) {
    if (this.camera) {
      this.camera.fov = value;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * 场景亮度更改
   */
  luminanceChange(value: number) {
    if (this.ambient) {
      this.ambient.intensity = value;
    }
  }

  /**
   * 绑定信号源
   */
  bindScreenSignal(item: any) {
    this.screenConfig = this.modelScreen;
    // console.log(item);
    // console.log(this.textures);
    // 236,231
    //找到对应的信号源贴图
    let modelInfo = this.scene.getObjectByName("myModel").children;
    const signalMap = this.textures.filter((ele) => {
      return ele.signalIp == item.ip;
    });
    const material = new THREE.MeshBasicMaterial({
      map: signalMap[0].texture,
    });
    material.name = signalMap[0].signalIp;
    // 更换对应模型的贴图
    for (let i of modelInfo) {
      if (i.name == item.value) {
        i.material = material;
      }
    }
  }

  /**
   * 设备类型改变 输入/输出
   */
  modeTypeChange(mode: string) {
    console.log(mode);
    if (mode == "输出设备") {
      console.log(this.modelScreen);
      // this.screenSettings();
      // this.dialogFormVisible = ref(true);
      //       {
      //   id: string;
      //   name: string;
      //   rowNum: number;
      //   colNum: number;
      //   rotate: number;
      //   gridInfos: (OutputDeviceInfo | null)[];
      // }
    }
    if (mode == "输入设备") {
      console.log(this.modelScreen);
    }
  }

  /**
   * 输出屏信息配置
   */
  setScreenConfig() {
    this.outScreenCon;
  }

  /**
   * 初始化模型
   */
  init() {
    this.drawCanvas();
    this.rendererInit();
    this.sceneInit();
    this.lightInit();
    this.cameraInit();
    // this.findModelToDrag();
    this.controlInit();
    // this.modelInit();
    window.addEventListener("resize", this.onWindowResize);
    this.animate();
  }

  /**
   * 初始化渲染器
   */
  rendererInit() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const modelDrawBoard = this.$refs.model as HTMLElement;
    this.renderer.setSize(modelDrawBoard.clientWidth, modelDrawBoard.clientHeight);
    modelDrawBoard.appendChild(this.renderer.domElement);
  }

  /**
   * 初始化场景
   */
  sceneInit() {
    this.scene = new THREE.Scene();
    var axisHelper = new THREE.AxesHelper(1000);
    this.scene.add(axisHelper);
    this.scene.name = "场景";
  }

  /**
   * 初始化摄像机
   */
  cameraInit() {
    const modelDrawBoard = this.$refs.model as HTMLElement;
    var k = modelDrawBoard.clientWidth / modelDrawBoard.clientHeight;
    var fov = 50; //三维场景显示范围控制系数，系数越大，显示的范围越大
    this.camera = new THREE.PerspectiveCamera(fov, k, 0.01, 2000);
    this.camera.position.set(10, 5, 10);
  }

  /**
   * 初始化灯光
   */
  lightInit() {
    this.ambient = new THREE.AmbientLight(0xffffff, 5);
    this.ambient.name = "场景亮度";
    this.light = new THREE.PointLight("#FFD700", 2, 80);
    this.light.position.set(0, 6, 0);
    this.light.name = "点光源";

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(this.light, sphereSize);
    pointLightHelper.name = "点光源辅助线";

    const rectLight = new THREE.RectAreaLight(0xcaffff, 3, 100, 100);
    rectLight.position.set(0, 100, 0);
    rectLight.lookAt(0, 0, 0);
    rectLight.name = "平面光源";
    const rectLightHelper = new RectAreaLightHelper(rectLight);
    rectLightHelper.name = "平面光源辅助线";

    // this.scene.add(this.light, pointLightHelper, this.ambient);
    this.scene.add(rectLight, rectLightHelper, this.ambient);
  }

  /**
   * 初始化控制器
   */
  controlInit() {
    this.controls = new OrbitControls(this.camera, this.$refs.model);
    this.controls.dampingFactor = 0.2; //惯性大小
    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = 1.5;
    this.controls.enableKeys = true;
    this.controls.screenSpacePanning = false;
    this.controls.target.set(0, 0, 0);
    this.controls.maxZoom = Infinity;
  }

  /**
   * 窗口变化自适应
   */
  onWindowResize() {
    const modelDrawBoard = this.$refs.model as HTMLElement;
    const width = modelDrawBoard.clientWidth;
    const height = modelDrawBoard.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 上传文件
   * @returns {onlineFiles: 模型文件}
   */
  changesData() {
    // this.isFirstImport = true;
    // console.log(this.scene);
    if (this.scene) {
      // console.log("9999999999");
      // this.isFirstImport = false;
      let oldModel = this.scene.getObjectByName("myModel");
      this.scene.remove(oldModel);
      this.fileList = "";
      this.onlineFiles = [];
      this.prepareForModel();
    } else {
      // console.log("0000000000");
      this.init();
      this.prepareForModel();
    }
    // this.getChildSiteInfo();
  }

  /**
   * 模型准备工作
   */
  prepareForModel() {
    this.fileList = (this.$refs.file as any).files;
    // console.log(this.fileList);
    Object.values(this.fileList).forEach((ele: any, idx) => {
      this.onlineFiles.push({
        file: ele,
        link: window.URL.createObjectURL(ele),
        fileName: ele.name,
      });
      // console.log(ele);
    });
    this.modelInit();
    console.log(this.onlineFiles);

    // this.initModelScreen();
    this.initModelLights();
  }

  /**
   * 获取子模型位置信息
   */
  getChildSiteInfo() {
    // console.log("999999");
    console.log(this.scene);
    if (this.scene) {
      let modelInfo = this.scene.getObjectByName("myModel");
      // console.log(modelInfo);
    }

    // var centroid = new THREE.Vector3();
    // centroid.addVectors(modelInfo.boundingBox.min,modelInfo.boundingBox.max);
    // centroid.multiplyScalar(0.5);
    // centroid.applyMatrix4(mesh.matrixWorld);
  }

  /**
   * 初始化模型
   */
  modelInit() {
    for (let i of this.onlineFiles) {
      let type = i.file.name.split(".")[1];
      switch (type) {
        case "obj":
          this.modelType = type;
          this.typeObj();
          break;
        default:
          break;
      }
    }
  }

  typeObj() {
    let mtlFile: any;
    let objFile: any;
    console.log(this.onlineFiles);
    for (let i of this.onlineFiles) {
      let type = i.file.name.split(".")[1];
      if (type == "mtl") {
        mtlFile = i.link;
      } else if (type == "obj") {
        objFile = i.link;
      }
    }

    console.log(mtlFile, objFile);

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    // mtlLoader.parse()
    mtlLoader.load(mtlFile, (mtl: any) => {
      console.log(mtl);
      let mtlInfo = Object.values(mtl.materialsInfo);
      mtlInfo.forEach((ele: any, idx: any) => {
        for (let i of this.onlineFiles) {
          if (ele.map_d) {
            if (i.file.name == ele.map_d) {
              ele.map_d = i.link.split("8080/")[1];
            }
          }
          if (ele.map_kd) {
            if (i.file.name == ele.map_kd) {
              ele.map_kd = i.link.split("8080/")[1];
            }
          }
        }
      });

      //obj模型对应材质
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load(objFile, (obj: any) => {
        obj.scale.set(1, 1, 1);
        obj.position.set(0, 0, 0);
        obj.name = "myModel";
        this.standardScreenName(obj);
        this.scene.add(obj);
        this.getModelScreens(obj);
      });
    });
    console.log(this.scene);
  }

  /**
   * 统一名字
   */
  standardScreenName(obj: any) {
    // console.log(obj);
    // console.log(this.scene);
    obj.children.forEach((ele: any, idx: number) => {
      if (ele.name == "Monitor_Plane.029_Material") {
        ele.name = "roomA_Screen_001";
      } else if (ele.name == "Plane.010_Plane.012_TVscreen") {
        ele.name = "roomA_Screen_002";
      } else if (ele.name == "Jatekgep_Plane.003_Material.003") {
        ele.name = "roomA_Screen_003";
      } else if (ele.name == "Jatekgep_Plane.003_Material.005") {
        ele.name = "roomA_Screen_004";
      }
    });
    // this.scene.updateProjectionMatrix();
    // console.log(this.scene);
  }

  /**
   * 根据屏幕名字找到电脑屏幕
   */
  getModelScreens(obj: any) {
    console.log(obj);
    obj.children.forEach((ele: any, idx: number) => {
      let sampleTag = "roomA_Screen";
      if (ele.name.indexOf(sampleTag) == 0) {
        this.modelScreen.push({
          label: ele.name.split(sampleTag)[1],
          ip: "请选择信号源",
          value: ele.name,
          mode: "",
        });
      }
    });
  }

  /**
   * 获取模型中的电脑屏幕
   * @returns {}
   */
  // initModelScreen() {
  //   if (this.scene) {
  //     this.modelScreen = [
  //       {
  //         label: "大头电脑",
  //         placeholder: "请选择信号源",
  //         value: "Monitor_Plane.029_Material",
  //         mode: "",
  //       },
  //       {
  //         label: "电视机",
  //         placeholder: "请选择信号源",
  //         value: "Plane.010_Plane.012_TVscreen",
  //         mode: "",
  //       },
  //       {
  //         label: "游戏机主屏",
  //         placeholder: "请选择信号源",
  //         value: "Jatekgep_Plane.003_Material.003",
  //         mode: "",
  //       },
  //       {
  //         label: "游戏机副屏",
  //         placeholder: "请选择信号源",
  //         value: "Jatekgep_Plane.003_Material.005",
  //         mode: "",
  //       },
  //     ];
  //   }
  // }

  /**
   * 获取模型中的灯光设备
   * @returns {}
   */
  initModelLights() {
    if (this.scene) {
      this.modelLights = [
        { value: "灯光1", placeholder: "请选择灯光设备" },
        { value: "灯光2", placeholder: "请选择灯光设备" },
      ];
    }
  }

  /**
   * 绘制信号源图片
   */
  drawSignalImg() {
    var imgs = this.$refs.signalImg as HTMLImageElement[];
    if (imgs) {
      for (let i = 0; i < imgs.length; i++) {
        let target = imgs[i];
        target.src = "http://192.168.1.81:8080/test2/" + this.inputDev[i].ip + ":8001";
        // console.log(target.src);
        this.textures[i].signalIp = this.inputDev[i].ip;
        this.textures[i].texture.needsUpdate = true;
        const canvas = this.$refs.myCanvas as HTMLCanvasElement[];
        if (!canvas) return;
        var ctx = canvas[i].getContext("2d") as CanvasRenderingContext2D;
        // console.log(target.naturalWidth, target.naturalHeight);
        ctx.drawImage(
          target,
          0,
          0,
          target.naturalWidth,
          target.naturalHeight,
          0,
          0,
          1920,
          1080
        );
      }
    }
  }

  /**
   * 绘制材质贴图
   */
  drawCanvas() {
    const canvas = this.$refs.myCanvas as HTMLCanvasElement[];
    //创建纹理
    if (canvas) {
      for (let i = 0; i < canvas.length; i++) {
        let texture = new THREE.CanvasTexture(canvas[i]);
        // texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        this.textures.push({
          texture: new THREE.CanvasTexture(canvas[i]),
          sourceIndex: i,
          signalIp: "",
        });
      }
    }
    // console.log(this.textures);
  }

  onSubmit() {
    // console.log("submit!");
    // console.log(this.onlineFiles);
    const newpage = this.$router.resolve({
      path: "/modelReview",
      query: {
        modelType: this.modelType,
        modelFile: JSON.stringify(this.onlineFiles),
        screenConfig: JSON.stringify(this.screenConfig),
      },
    });
    window.open(newpage.href, "_blank");
  }

  /**
   * 渲染
   */
  animate() {
    if (this.inputDev && this.$refs.myCanvas) {
      this.drawSignalImg();
    }
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    this.update();
  }

  /**
   * 更新控件
   */
  update() {
    this.controls.update();
    TWEEN.update();
    // this.stats.update();
  }
}
</script>
<style lang="less" scoped>
.menu {
  width: 365px;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid lightgray;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: scroll;
}
.menu::-webkit-scrollbar {
  width: 0 !important;
}
.model {
  width: calc(~"(100vw - 367px)");
  position: absolute;
  top: 0;
  left: 367px;
  height: 100vh;
}
.light {
  width: 110px;
}
.echoCanvas {
  canvas {
    display: none;
  }
}
.canvas-img {
  display: none;
}
.screen-info {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 20px;
  .screen-list {
    width: 30%;
    height: 210px;
    text-align: left;
    overflow-y: scroll;
    // border-left: 1px solid rgba(0, 0, 0, 0.2);
    ul {
      list-style: none;
      li {
        position: relative;
        margin-bottom: 5px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        .preview {
          width: 100%;
          height: 128px;
          .preview-img {
            width: 100%;
          }
        }

        span {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          line-height: 30px;
          text-align: center;
          color: white;
          background-color: rgba(0, 0, 0, 0.3);
        }
      }
    }
  }
  .screen-table {
    width: 70%;
    height: 210px;
    table {
      width: 70%;
    }
  }
}
</style>
