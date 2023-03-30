<template>
  <div class="home">
    <div class="obj Props">
      <div class="position">模型位置</div>
      <div class="position">
        X: <el-input-number v-model="objX" :min="-Infinity" :max="Infinity" />
      </div>
      <div class="position">
        Y: <el-input-number v-model="objY" :min="-Infinity" :max="Infinity" />
      </div>
      <div class="position">
        Z: <el-input-number v-model="objZ" :min="-Infinity" :max="Infinity" />
      </div>
    </div>

    <div class="camera Props">
      <div class="position">相机位置</div>
      <div class="position">
        X: <el-input-number v-model="camX" :min="-Infinity" :max="Infinity" />
      </div>
      <div class="position">
        Y: <el-input-number v-model="camY" :min="-Infinity" :max="Infinity" />
      </div>
      <div class="position">
        Z: <el-input-number v-model="camZ" :min="-Infinity" :max="Infinity" />
      </div>
    </div>

    <div class="light Props">
      <div class="position">光源位置</div>
      <div class="position">
        X: <el-input-number v-model="ligX" :min="-Infinity" :max="Infinity" />
      </div>
      <div class="position">
        Y: <el-input-number v-model="ligY" :min="-Infinity" :max="Infinity" />
      </div>
      <div class="position">
        Z: <el-input-number v-model="ligZ" :min="-Infinity" :max="Infinity" />
      </div>
    </div>

    <div ref="startDom" class="Dom-style"></div>
    <div class="echoCanvas">
      <canvas
        v-for="(item, index) in devIps"
        :key="index"
        ref="myCanvas"
        width="1960"
        height="1080"
      ></canvas>
    </div>

    <!-- 固定图层 -->
    <div class="echoImgs">
      <img
        v-for="(item, index) in devIps"
        :key="index"
        crossorigin="anonymous"
        ref="echoImg"
        class="echoImg"
        @mousedown="dragEchoImg($event, index)"
      />
    </div>

    <!-- 可移动图层 -->
    <div class="movableImg">
      <img
        v-for="(item, index) in devIps"
        :key="index"
        crossorigin="anonymous"
        class="echoImg"
        ref="moveImg"
        :id="getID('echo', index)"
        style="left: 0px; top: 0px"
      />
    </div>

    <div class="panel">
      <el-switch
        v-model="lightState"
        size="large"
        active-text="开灯"
        inactive-text="关灯"
      />
    </div>
  </div>
</template>

<script lang="ts">
interface SceneName {
  value: string;
  text: string;
}
interface TextureInfo {
  texture: CanvasTexture;
  sourceIndex: number;
}

import * as THREE from "three";
import { ref, App } from "vue";
import { Watch } from "vue-property-decorator";
import { Options, Vue } from "vue-class-component";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
// import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
const OrbitControls = require("three-orbit-controls")(THREE);
const TWEEN = require("@tweenjs/tween.js");
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { CanvasTexture } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
// import { Router } from "vue-router";
import Router from "@/router";

@Options({
  components: {},
})
export default class Home extends Vue {
  private devIps: string[] = [
    "192.168.11.236:8001",
    "192.168.11.231:8001",
    "192.168.11.227:8001",
  ];
  private sceneProps: SceneName[] = [
    { value: "back", text: "原点" },
    { value: "lighthouse", text: "灯塔" },
    { value: "building", text: "建筑" },
    { value: "tower", text: "发射台" },
  ];
  private objX: any = ref(0);
  private objY: any = ref(0);
  private objZ: any = ref(0);
  private camX: any = ref(8);
  private camY: any = ref(4);
  private camZ: any = ref(9);
  private ligX: any = ref(0);
  private ligY: any = ref(10);
  private ligZ: any = ref(0);
  private lightState: any = ref(true);
  private renderer: any = ""; //渲染器 初始
  private scene: any = ""; //场景
  private camera: any = ""; //相机
  private controls: any = ""; //控制器
  private meshHello: any = ""; //第一个three模型
  private helloTween: any = ""; //第一个tween
  private material: any = "";
  private group: any = "";
  private textures: TextureInfo[] = [];
  private light: any = "";
  private canDrag: boolean = false;
  private ac: any = "";
  private plane: any = "";
  private startPosition: any = "";
  private startMouseWorldPosition: any = "";
  private endMouseWorldPosition: any = "";
  private stats: any = "";

  @Watch("objX")
  @Watch("objY")
  @Watch("objZ")
  objChange() {
    this.meshHello.position.set(this.objX, this.objY, this.objZ);
  }

  @Watch("camX")
  @Watch("camY")
  @Watch("camZ")
  camChange() {
    this.camera.position.set(this.camX, this.camY, this.camZ);
  }

  @Watch("ligX")
  @Watch("ligY")
  @Watch("ligZ")
  ligChange() {
    this.light.position.set(this.ligX, this.ligY, this.ligZ);
  }

  @Watch("lightState")
  lightStateChange() {
    if (this.lightState == false) {
      this.light.intensity = 0;
    } else {
      this.light.intensity = 1.5;
    }
  }

  mounted() {
    this.drawMoveImg();
    this.init();
    this.animate();
  }

  /**
   * 初始化
   */
  init() {
    this.statsInit();
    this.rendererInit();
    this.sceneInit();
    this.lightInit();
    this.cameraInit();
    this.findModelToDrag();
    this.controlInit();
    this.modelling();
    window.addEventListener("resize", this.onWindowResize);
  }

  private canDragName: string[] = [
    "Jatekgep_Plane.003_Material.005",
    "Jatekgep_Plane.003_Material.003",
    "Monitor_Plane.029_Material",
    "Plane.010_Plane.012_TVscreen",
  ];

  private createImg: HTMLImageElement | null = null;

  /**
   * 根据射线经过的group找到模型并开启拖拽事件
   */
  findModelToDrag() {
    let _this = this;
    this.renderer.domElement.addEventListener("mousedown", function (e: MouseEvent) {
      let raycaster = _this.screenToWorld(e.clientX, e.clientY);
      let intersect = raycaster.intersectObjects(
        _this.scene.getObjectByName("ArcadeRoom").children
      );
      if (intersect.length > 0) {
        //限制可拖拽的模型
        _this.canDragName.forEach((ele, idx) => {
          if (intersect[0].object.name == ele) {
            _this.ac = intersect[0].object;
          }
        });
        console.log(_this.ac);
        if (!_this.ac) return;
        let imgIndex = parseInt(_this.ac.material.name.slice(3));
        _this.dragEchoImg(e, imgIndex);
      }
    });
    this.renderer.domElement.addEventListener("mouseup", function (e: MouseEvent) {
      if (_this.ac) {
        _this.ac = false;
      }
    });
  }

  /**
   * 投屏操作
   */
  castScreen(e: MouseEvent, map: any, name: string) {
    let raycaster = this.screenToWorld(e.clientX, e.clientY);
    //获取射线经过的在指定范围内的物体集合
    let intersect = raycaster.intersectObjects(
      this.scene.getObjectByName("ArcadeRoom").children
    );
    let screen: any;
    console.log(intersect);
    if (intersect.length > 0) {
      screen = intersect[0].object;
      intersect.forEach((ele, idx) => {
        screen = ele.object;
        this.canDragName.forEach((item, index) => {
          if (screen.name == item && screen.material.name !== name) {
            screen.material.map = map;
            screen.material.name = name;
          }
        });
      });
    }
  }

  /**
   * 拖拽屏幕移动，投屏
   */
  dragEchoImg(event: MouseEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    // 获取当前操作对象
    let id = "echo" + index;
    let drag = document.getElementById(id) as HTMLElement;
    console.log(drag);
    let _this = this;
    var x = event.clientX;
    var y = event.clientY;
    drag.style.left = x - 70 + "px";
    drag.style.top = y - 40 + "px";
    drag.style.display = "block";

    window.addEventListener("mousemove", function (e) {
      e.preventDefault();
      e.stopPropagation();

      drag.style.left = e.clientX - 70 + "px";
      drag.style.top = e.clientY - 40 + "px";
    });
    drag.addEventListener("mouseup", function (e) {
      let map = _this.textures[index].texture;
      let name = `视频源${index}`;
      _this.castScreen(e, map, name);
      drag.style.left = "0px";
      drag.style.top = "0px";
      drag.style.display = "none";
      _this.ac = false;
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
   * 绘制可拖拽图层
   */
  drawMoveImg() {
    var imgs = this.$refs.moveImg as HTMLImageElement[];
    if (imgs) {
      for (let i = 0; i < imgs.length; i++) {
        imgs[i].src = "http://192.168.1.81:8080/test2/" + this.devIps[i];
      }
    }
  }

  /**
   * 动态设置图片Id
   */
  getID(text: string, i: number) {
    return text + i;
  }

  /**
   * 初始化渲染器
   */
  rendererInit() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    (this.$refs.startDom as HTMLElement).appendChild(this.renderer.domElement);
  }

  /**
   * 窗口变化自适应
   */
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 监测FPS
   */
  statsInit() {
    this.stats = Stats();
    // 0为监测帧率(FPS), 1为监测渲染时间(MS) 2为监测内存(MB)
    this.stats.setMode(0);
    // this.stats.showPanel(1);
    let statsDom = this.stats.domElement as HTMLElement;
    (this.$refs.startDom as HTMLElement).appendChild(statsDom);
    statsDom.style.left = "initial";
    statsDom.style.right = "0px";
  }

  /**
   * 初始化场景 并向场景添加光源和辅助坐标系
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
    var ambient = new THREE.AmbientLight(0xffffff, 5);
    this.light = new THREE.PointLight("#FFD700", 2, 80);
    this.light.position.set(this.ligX, this.ligY, this.ligZ);

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(this.light, sphereSize);

    const rectLight = new THREE.RectAreaLight(0xcaffff, 3, 10, 10);
    rectLight.position.set(0, 6, 0);
    rectLight.lookAt(0, 0, 0);
    const rectLightHelper = new RectAreaLightHelper(rectLight);

    this.scene.add(this.light, pointLightHelper, ambient);
    // this.scene.add(rectLight, rectLightHelper);
  }

  /**
   * 初始化相机
   */
  cameraInit() {
    var k = window.innerWidth / window.innerHeight;
    var fov = 50; //三维场景显示范围控制系数，系数越大，显示的范围越大
    this.camera = new THREE.PerspectiveCamera(fov, k, 0.01, 2000);
    this.camera.position.set(this.camX, this.camY, this.camZ);
  }

  /**
   * 初始化控制器
   */
  controlInit() {
    this.controls = new OrbitControls(this.camera, this.$refs.startDom);
    this.controls.dampingFactor = 0.2; //惯性大小
    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = 1.5;
    this.controls.enableKeys = true;
    this.controls.screenSpacePanning = false;
    this.controls.target.set(0, 0, 0);
    this.controls.maxZoom = Infinity;

    //解决键盘控制失效问题
    window.addEventListener("keydown", (event) => {
      this.controls.onKeyDown(event);
    });
  }

  /**
   * 初始化模型
   */
  modelling() {
    // let manager = new THREE.LoadingManager();
    // manager.addHandler(/\.dds$/i, new DDSLoader());
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader().setPath("/model/little-room/ArcadeRoom_V1/");
    mtlLoader.load("ArcadeRoom_V1.mtl", (mtl: any) => {
      //obj模型对应材质
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load("/model/little-room/ArcadeRoom_V1/ArcadeRoom_V1.obj", (obj: any) => {
        obj.scale.set(1, 1, 1);
        // obj.position.set(this.objX, this.objY, this.objZ);
        obj.position.set(0, 0, 0);
        obj.name = "ArcadeRoom";
        // console.log(obj);
        this.meshHello = obj;
        // obj.children.forEach((ele: any, idx: number) => {
        //   let material = new THREE.MeshPhysicalMaterial();
        //   ele.material = material;
        // });
        this.drawComputerTexture(obj);
        this.scene.add(this.meshHello);
        // this.scene.add(obj);
      });
    });
    this.drawCanvas();
    console.log(this.scene);
  }

  simulateLight() {
    const width = 10;
    const height = 10;
    const intensity = 1;
    const rectLight = new THREE.RectAreaLight(0x00ffff, 5, width, height);
    rectLight.position.set(5, 5, 0);
    rectLight.lookAt(0, 0, 0);
    this.scene.add(rectLight);

    const rectLightHelper = new RectAreaLightHelper(rectLight);
    rectLight.add(rectLightHelper);
  }

  /**
   * 给电脑屏幕贴图
   * @param obj 存在电脑的group
   */
  drawComputerTexture(obj: any) {
    obj.children.forEach((ele: any, idx: number) => {
      // console.log(ele.name);
      if (ele.name == "Monitor_Plane.029_Material") {
        // 创建材质
        const material = new THREE.MeshBasicMaterial({
          map: this.textures[0].texture,
        });
        material.name = `视频源${this.textures[0].sourceIndex}`;
        ele.material = material;
      }
      if (ele.name == "Plane.010_Plane.012_TVscreen") {
        const material = new THREE.MeshBasicMaterial({
          map: this.textures[1].texture,
        });
        material.name = `视频源${this.textures[1].sourceIndex}`;
        ele.material = material;
      }
      if (ele.name == "Jatekgep_Plane.003_Material.003") {
        const material = new THREE.MeshBasicMaterial({
          map: this.textures[2].texture,
        });
        material.name = `视频源${this.textures[2].sourceIndex}`;
        ele.material = material;
      }
      if (ele.name == "Jatekgep_Plane.003_Material.005") {
        const material = new THREE.MeshBasicMaterial({
          map: this.textures[0].texture,
        });
        material.name = `视频源${this.textures[0].sourceIndex}`;
        ele.material = material;
      }
      if (ele.name == "Jatekgep_Plane.003_Material.004") {
        const material = new THREE.MeshPhysicalMaterial({
          color: "#00ff00",
        });
        ele.material = material;
      }
    });
  }

  /**
   * 绘制固定图层
   */
  drawImg() {
    var imgs = this.$refs.echoImg as HTMLImageElement[];
    if (imgs) {
      for (let i = 0; i < imgs.length; i++) {
        let target = imgs[i];
        target.src = "http://192.168.1.81:8080/test2/" + this.devIps[i];
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
   * 绘制贴图
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
        });
      }
    }
  }

  /**
   * 渲染
   */
  animate() {
    this.drawImg();
    // window.requestAnimationFrame(() => this.animate());
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    this.update();
  }

  // 更新控件
  update() {
    this.controls.update();
    TWEEN.update();
    this.stats.update();
  }
}
</script>

<style lang="less" scoped>
.btns {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}
.Props {
  position: absolute;
  display: flex;
  flex-direction: row;
  z-index: 99999;
  color: aliceblue;
}
.obj {
  top: 80px;
  left: 40px;
}
.camera {
  top: 120px;
  left: 40px;
}
.light {
  top: 160px;
  left: 40px;
}
.position {
  margin-right: 10px;
  color: #42b983;
}

.texture {
  position: absolute;
  bottom: 30px;
  left: 40px;
  background-color: red;
  color: white;
  border-radius: 5px;
  border: none;
  padding: 4px 8px;
  font-size: 12px;
}
.texture:hover {
  background-color: #626aef;
  cursor: pointer;
}

.signal-box {
  width: 100%;
  flex: 1;
  margin: 1.146rem 0;
  position: absolute;
  bottom: 50px;
  ul {
    // width: 70%;
    height: 100%;
    list-style: none;
    display: flex;
    flex-direction: row;
    justify-content: center;
    li {
      width: 160px;
      height: 84px;
      border: 1px solid #4d5459;
      position: relative;
      margin: 0 10px;
      h5 {
        position: absolute;
        left: 0;
        bottom: -20px;
        right: 0;
        height: 24px;
        line-height: 24px;
        background: rgba(0, 0, 0, 0.4);
        font-size: 12px;
        font-family: Source Han Sans CN;
        font-weight: 500;
        color: #ffffff;
        text-align: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
.echoImgs {
  display: flex;
  flex-direction: row;
  position: absolute;
  bottom: 70px;
  justify-content: center;
  align-items: center;
  width: 100%;
  .echoImg {
    width: 160px;
    height: 84px;
    border: 1px solid #4d5459;
    position: relative;
    // top: 0px;
    // left: 0px;
    cursor: move;
    margin: 0 10px;
  }
}
.panel {
  position: absolute;
  bottom: 70px;
  left: 140px;
  background-color: rgba(187, 187, 187, 0.6);
  padding: 0 20px;
  border-radius: 5px;
}
.echoCanvas {
  canvas {
    display: none;
  }
}
.movableImg {
  img {
    position: absolute;
    width: 140px;
    height: 80px;
    display: none;
  }
}
</style>
