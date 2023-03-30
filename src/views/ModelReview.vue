<template>
  <div class="model-review">
    <!-- <el-button type="text" @click="dialogFormVisible = true">打开屏幕配置面板</el-button> -->
    <div ref="model" class="model"></div>
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
    <!-- <div class="movableImg">
      <img
        v-for="(item, index) in inputDev"
        :key="index"
        crossorigin="anonymous"
        class="echoImg"
        ref="moveImg"
        style="left: 0px; top: 0px"
      />
    </div> -->
    <!-- <el-select class="m-2" placeholder="Select">
      <el-option
        v-for="(item, index) in inputDev"
        :key="index"
        :label="item.ip"
        :value="item.ip"
      />
    </el-select> -->
  </div>
</template>

<script lang="ts">
interface TextureInfo {
  texture: CanvasTexture;
  sourceIndex: number;
  signalIp: string;
}

import { Options, Vue } from "vue-class-component";
import { reactive, ref, setDevtoolsHook, watch } from "vue";
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
import { tr } from "element-plus/lib/locale";
// import ReviewModel from "@/utils/ReviewModel";

export default class ModelReview extends Vue {
  private dialogFormVisible = ref(false);

  private renderer: any = "";
  private scene: any = "";
  private camera: any = "";
  private light: any = "";
  private controls: any = "";
  /**
   * 场景亮度
   */
  private ambient: any = "";
  /**
   * 导入的模型类型
   */
  private modelType: string = "";
  /**
   * 导入模型的文件信息
   */
  private onlineFiles: any[] = [];
  /**
   * 模型屏幕配置
   */
  private screenConfig: any = "";
  /**
   * 输入配置
   */
  private inputDev: any = "";
  /**
   * 输出配置
   */
  private outputDev: any = "";
  /**
   * 屏幕材质
   */
  private textures: TextureInfo[] = [];
  /**
   * 输入屏幕
   */
  private canDragScreen: any = "";
  /**
   * 当前鼠标所在模型零件
   */
  private activeCur: any = "";
  /**
   * 输出屏幕
   */
  private canCastScreen: any = "";

  created() {
    this.modelType = this.$route.query.modelType as string;
    this.onlineFiles = JSON.parse(this.$route.query.modelFile as any);
    this.screenConfig = JSON.parse(this.$route.query.screenConfig as any);
    console.log(this.onlineFiles);
    console.log(this.modelType);
    console.log(this.screenConfig);
  }

  mounted() {
    this.init();
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
  }
  /**
   * 初始化模型
   */
  async init() {
    await this.getDevData();
    this.rendererInit();
    this.sceneInit();
    this.lightInit();
    this.cameraInit();
    this.findModelToDrag();
    this.controlInit();
    this.drawCanvas();
    this.modelInit();
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

  /**
   * 初始化模型
   */
  modelInit() {
    switch (this.modelType) {
      case "obj":
        this.typeObj();
        break;
      default:
        break;
    }
  }

  /**
   * obj类型模型
   */
  typeObj() {
    let mtlFile: any;
    let objFile: any;

    for (let i of this.onlineFiles) {
      let type = i.fileName.split(".")[1];
      if (type == "mtl") {
        mtlFile = i.link;
      } else if (type == "obj") {
        objFile = i.link;
      }
    }

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    // mtlLoader.parse()
    mtlLoader.load(mtlFile, (mtl: any) => {
      console.log(mtl);
      let mtlInfo = Object.values(mtl.materialsInfo);
      mtlInfo.forEach((ele: any, idx: any) => {
        for (let i of this.onlineFiles) {
          if (ele.map_d) {
            if (i.fileName == ele.map_d) {
              ele.map_d = i.link.split("8080/")[1];
            }
          }
          if (ele.map_kd) {
            if (i.fileName == ele.map_kd) {
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
        this.InitScreen(obj);
      });
    });
    console.log(this.scene);
  }

  /**
   * 统一名字
   */
  standardScreenName(obj: any) {
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
  }

  /**
   * 根据初始值设置值初始化屏幕
   */
  InitScreen(obj: any) {
    //限制输入设备可拖拽
    this.canDragScreen = this.screenConfig.filter((item: any) => {
      return item.mode == "输入设备";
    });
    this.canCastScreen = this.screenConfig.filter((item: any) => {
      return item.mode == "输出设备";
    });

    // 初始化屏幕 输入
    for (let i of this.screenConfig) {
      let screen: any;
      const signalMap = this.textures.filter((ele) => {
        return ele.signalIp == i.ip;
      });

      if (signalMap.length > 0) {
        screen = new THREE.MeshBasicMaterial({
          map: signalMap[0].texture,
        });

        obj.children.forEach((ele: any, idx: number) => {
          if (ele.name == i.value) {
            ele.material = screen;
          }
        });
      }
    }

    //初始化屏幕 输出
  }

  /**
   * 绘制信号源图片
   */
  drawSignalImg() {
    var imgs = this.$refs.signalImg as HTMLImageElement[];
    if (imgs) {
      for (let i = 0; i < imgs.length; i++) {
        let target = imgs[i];
        target.src =
          "http://192.168.1.81:8080/test2/" + this.inputDev[i].ip + ":8001?v=2";
        this.textures[i].signalIp = this.inputDev[i].ip;
        this.textures[i].texture.needsUpdate = true;
        const canvas = this.$refs.myCanvas as HTMLCanvasElement[];
        if (!canvas) return;
        var ctx = canvas[i].getContext("2d") as CanvasRenderingContext2D;
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
  }

  /**
   * 根据射线经过的group找到模型并开启拖拽事件
   */
  findModelToDrag() {
    let _this = this;
    let curScreenConfig: any; //当前屏幕配置信息
    this.renderer.domElement.addEventListener("mousedown", function (e: MouseEvent) {
      let raycaster = _this.screenToWorld(e.clientX, e.clientY);
      let intersect = raycaster.intersectObjects(
        _this.scene.getObjectByName("myModel").children
      );
      if (intersect.length > 0) {
        //限制可拖拽的模型
        _this.canDragScreen.forEach((ele: any, idx: number) => {
          if (intersect[0].object.name == ele.value) {
            _this.activeCur = intersect[0].object;
            curScreenConfig = ele;
          }
        });
        if (!_this.activeCur) return;
        _this.dragEchoImg(e, curScreenConfig);
      }
    });
    this.renderer.domElement.addEventListener("mouseup", function (e: MouseEvent) {
      if (_this.activeCur) {
        _this.activeCur = false;
      }
    });
  }

  /**
   *场景世界坐标转平面二维坐标
   * @param offsetX 鼠标相对于画布左上角横向坐标
   * @param offsetY 鼠标相对于画布左上角纵向坐标
   * @returns {Raycaster|Raycaster}
   */
  screenToWorld(offsetX: number, offsetY: number) {
    let x = (offsetX / window.innerWidth) * 2 - 1,
      y = -(offsetY / window.innerHeight) * 2 + 1;
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    return raycaster;
  }

  /**
   * 拖拽屏幕移动，投屏
   */
  dragEchoImg(event: MouseEvent, selectScreen: any) {
    event.preventDefault();
    event.stopPropagation();
    // 获取当前操作对象
    let imgs = this.$refs.signalImg as HTMLImageElement[];
    let dragScreen: HTMLImageElement | null = null;
    for (let i of imgs) {
      if (i.src.includes(selectScreen.ip)) {
        dragScreen = i;
      }
    }
    if (!dragScreen) return;
    let _this = this;
    var x = event.clientX;
    var y = event.clientY;
    dragScreen.style.left = x - 70 + "px";
    dragScreen.style.top = y - 40 + "px";
    dragScreen.style.display = "block";

    window.addEventListener("mousemove", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!dragScreen) return;
      dragScreen.style.left = e.clientX - 70 + "px";
      dragScreen.style.top = e.clientY - 40 + "px";
    });
    dragScreen.addEventListener("mouseup", function (e) {
      let material: any;
      const signalMap = _this.textures.filter((ele) => {
        return ele.signalIp == selectScreen.ip;
      });

      if (signalMap.length > 0) {
        material = new THREE.MeshBasicMaterial({
          map: signalMap[0].texture,
        });
      }
      _this.castScreen(e, material, selectScreen.value);
      if (!dragScreen) return;

      dragScreen.style.left = "0px";
      dragScreen.style.top = "0px";
      dragScreen.style.display = "none";
      dragScreen = null;
      _this.activeCur = false;
    });
  }

  /**
   * 投屏操作
   */
  castScreen(e: MouseEvent, material: any, name: string) {
    // console.log()
    let raycaster = this.screenToWorld(e.clientX, e.clientY);
    //获取射线经过的在指定范围内的物体集合
    let intersect = raycaster.intersectObjects(
      this.scene.getObjectByName("myModel").children
    );
    let screen: any;
    console.log(intersect);
    if (intersect.length > 0) {
      screen = intersect[0].object;
      console.log(screen);
      // intersect.forEach((ele, idx) => {
      //   screen = ele.object;
      console.log(this.canCastScreen);
      this.canCastScreen.forEach((item: any, index: number) => {
        if (screen.name == item.value && screen.name !== name) {
          console.log(screen);
          console.log(item);
          screen.material = material;
        }
        // });
      });
    }
  }
}
</script>
<style lang="less" scoped>
.model {
  width: 100vw;
  height: 100vh;
}
.echoCanvas {
  canvas {
    display: none;
  }
}
.canvas-img {
  .signalImg {
    display: none;

    position: absolute;
    width: 140px;
    height: 80px;
  }
}
</style>
