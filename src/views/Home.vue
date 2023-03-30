<template>
  <div class="home">
    <el-row class="btns">
      <el-button
        v-for="(item, index) in sceneProps"
        :key="index"
        color="#626aef"
        style="color: white"
        @click="changeScene(item.value)"
        >{{ item.text }}</el-button
      >
    </el-row>

    <div class="obj Props">
      <div class="position">模型位置</div>
      <div class="position">
        X: <el-input-number v-model="objX" :min="-100" :max="100" />
      </div>
      <div class="position">
        Y: <el-input-number v-model="objY" :min="-100" :max="100" />
      </div>
      <div class="position">
        Z: <el-input-number v-model="objZ" :min="-100" :max="100" />
      </div>
    </div>

    <div class="camera Props">
      <div class="position">相机位置</div>
      <div class="position">
        X: <el-input-number v-model="camX" :min="-1000" :max="1000" />
      </div>
      <div class="position">
        Y: <el-input-number v-model="camY" :min="-1000" :max="1000" />
      </div>
      <div class="position">
        Z: <el-input-number v-model="camZ" :min="-1000" :max="1000" />
      </div>
    </div>

    <div class="light Props">
      <div class="position">光源位置</div>
      <div class="position">
        X: <el-input-number v-model="ligX" :min="-1000" :max="1000" />
      </div>
      <div class="position">
        Y: <el-input-number v-model="ligY" :min="-1000" :max="1000" />
      </div>
      <div class="position">
        Z: <el-input-number v-model="ligZ" :min="-1000" :max="1000" />
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
    <!-- <div class="page-turn">
      <img src="../assets/img/icons8-left48.png" alt="" />
      <img src="../assets/img/icons8-right48.png" alt="" />
    </div> -->
    <!-- 固定图层 -->
    <div class="echoImgs">
      <img
        v-for="(item, index) in devIps"
        :key="index"
        crossorigin="anonymous"
        ref="echoImg"
        class="echoImg"
      />
    </div>

    <!-- 可移动图层 -->
    <div class="echoImgs">
      <img
        v-for="(item, index) in devIps"
        :key="index"
        crossorigin="anonymous"
        class="echoImg"
        ref="moveImg"
        @mousemove="dragEchoImg($event, index)"
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
    <!-- <dat-gui closeText="关闭控制面板" openText="开启控制面板" closePosition="bottom">
    </dat-gui> -->
  </div>
</template>

<script lang="ts">
interface SceneName {
  value: string;
  text: string;
}

import * as THREE from "three";
import { ref, App } from "vue";
import { Watch } from "vue-property-decorator";
import { Options, Vue } from "vue-class-component";
// import HelloWorld from "@/components/HelloWorld.vue";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
// import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
const OrbitControls = require("three-orbit-controls")(THREE);
const TWEEN = require("@tweenjs/tween.js");
import EchoHelper from "@/utils/EchoHelper";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
// import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import Stats from "three/examples/jsm/libs/stats.module";

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
  private objY: any = ref(-2);
  private objZ: any = ref(0);
  private camX: any = ref(-1);
  private camY: any = ref(-1);
  private camZ: any = ref(7);
  private ligX: any = ref(0);
  private ligY: any = ref(8);
  private ligZ: any = ref(0);
  private lightState: any = ref(true);
  private renderer: any = null; //渲染器 初始
  private scene: any = null; //场景
  private camera: any = null; //相机
  private controls: any = null; //控制器
  private meshHello: any = ""; //第一个three模型
  private helloTween: any = ""; //第一个tween
  private material: any = "";
  private group: any = "";
  private textures: any[] = [];
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
      this.light.intensity = 0.1;
    } else {
      this.light.intensity = 5;
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
    this.cameraInit();
    this.findModelToDrag();
    this.controlInit();
    // this.canvasInit();
    this.modelling();
    // this.statsInit();
    // this.drawImg();

    // this.echoIconInit();
    window.addEventListener("resize", this.onWindowResize);
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
   * 根据射线经过的group找到模型并开启拖拽事件
   * @param ac 当前活动对象
   * @param plane 平移平面由活动对象初始位置和当前相机方向向量确定
   * @param startPosition 目标位置,使用终末位置计算平移量，也可以使用递增量
   * @param startMouseWorldPosition 拖动起始点射线与平移平面的交点
   * @param endMouseWorldPosition 拖动结束点射线与平移平面的交点
   */
  findModelToDrag() {
    let _this = this;
    this.renderer.domElement.addEventListener("mousedown", function (e: MouseEvent) {
      //鼠标落点处创建射线
      let raycaster = _this.screenToWorld(e.clientX, e.clientY);
      //获取射线经过的在指定范围内的物体集合
      let intersect = raycaster.intersectObjects(
        _this.scene.getObjectByName("computer").children
      );
      if (intersect.length > 0) {
        _this.ac = intersect[0].object;
        console.log(_this.ac);
        //创建经过物体中心点的垂直于相机方向的平面
        _this.plane = new THREE.Plane();
        _this.plane.setFromNormalAndCoplanarPoint(
          _this.camera.getWorldDirection(_this.plane.normal),
          _this.ac.position
        );
        //如果使用世界原点构建平面会导致物体位移和鼠标位移不对等，应该使用物体的初始位置中心作为视角切面平面
        // plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(plane.normal), new THREE.Vector3());
        _this.startMouseWorldPosition = new THREE.Vector3();
        raycaster.ray.intersectPlane(_this.plane, _this.startMouseWorldPosition);
        //备份物体初始点
        _this.startPosition = _this.ac.position.clone();
      }
    });
    this.renderer.domElement.addEventListener("mousemove", function (e: MouseEvent) {
      if (_this.ac) {
        e.preventDefault();
        e.stopPropagation();
        //鼠标移动点处创建射线
        let raycaster = _this.screenToWorld(e.clientX, e.clientY);

        _this.endMouseWorldPosition = new THREE.Vector3();
        //目标点射线与平移平面的焦点即为平移目标点
        raycaster.ray.intersectPlane(_this.plane, _this.endMouseWorldPosition);
        //计算平移向量
        let addVector3 = _this.endMouseWorldPosition.sub(_this.startMouseWorldPosition);
        let target = _this.startPosition.clone().add(addVector3).clone();
        _this.ac.position.copy(target);
      }
    });
    this.renderer.domElement.addEventListener("mouseup", function (e: MouseEvent) {
      if (_this.ac) {
        // 回到原点
        let map = _this.ac.material.map;
        let name = _this.ac.material.name;
        _this.castScreen(e, map, name);
        _this.ac.position.set(-2, 2, 0.5);
        _this.ac = false;
      }
    });
  }

  /**
   * 投屏操作
   */
  castScreen(e: MouseEvent, map: any, name: string) {
    // console.log(this.scene.children[2].children[0].material.name);
    let raycaster = this.screenToWorld(e.clientX, e.clientY);
    //获取射线经过的在指定范围内的物体集合
    let intersect = raycaster.intersectObjects(
      this.scene.getObjectByName("大屏").children
    );
    let screen: any;
    if (intersect.length > 0) {
      screen = intersect[0].object;
      // console.log(this.ac);
      if (screen.name == "模拟大屏屏幕" && screen.material.name !== name) {
        screen.material.map = map;
        screen.material.name = name;
      }
    }
    // console.log(this.scene.children[2].children[0].material.name);
    console.log(this.scene);
  }

  // 拖拽操作
  dragEchoImg(e: MouseEvent, index: number) {
    // e.preventDefault &&
    e.preventDefault();
    e.stopPropagation();
    // 获取当前操作对象
    let id = "echo" + index;
    let drag = document.getElementById(id) as HTMLElement;
    // console.log(drag);
    let _this = this;
    drag.addEventListener("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.button == 0) {
        var x = e.clientX;
        var y = e.clientY;
        document.onmousemove = function (e) {
          e.preventDefault();
          e.stopPropagation();
          drag.style.left = parseInt(drag.style.left.slice(0, -2)) + e.clientX - x + "px";
          drag.style.top = parseInt(drag.style.top.slice(0, -2)) + e.clientY - y + "px";
          x = e.clientX;
          y = e.clientY;
        };
        document.onmouseup = function (e) {
          let map = _this.textures[index];
          let name = `视频源${index}`;
          _this.castScreen(e, map, name);
          drag.style.left = "0px";
          drag.style.top = "0px";
          document.onmousemove = document.onmouseup = null;
        };
      }
    });
  }

  /**
   * 鼠标在坐标系中的位置
   */
  onPointerMove(event: any) {
    // if (event.isPrimary === false) return;
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log(this.mouse);
    this.checkIntersection();
  }

  /**
   * 获取鼠标悬停的物体
   */
  addSelectedObject(object: any) {
    this.selectedObjects = []; //被拾取物体列表
    this.selectedObjects.push(object); //添加被拾取物体
    console.log(this.selectedObjects);
  }

  /**
   * 添加与鼠标交叉的物体
   */
  checkIntersection() {
    this.raycaster = new THREE.Raycaster();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    var intersects = this.raycaster.intersectObjects([this.scene], true);
    if (intersects.length > 0) {
      var selectedObject = intersects[0].object;
      this.addSelectedObject(selectedObject);
    }
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

  private mouse: any = new THREE.Vector2();
  private selectedObjects: any[] = [];
  private raycaster: any = new THREE.Raycaster();

  // 获取与射线相交的对象数组
  getIntersects(event: MouseEvent) {
    event.preventDefault();
    console.log("event.clientX:" + event.clientX);
    console.log("event.clientY:" + event.clientY);

    // 声明 raycaster 和 mouse 变量
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
    raycaster.setFromCamera(mouse, this.camera);

    // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
    var intersects = raycaster.intersectObjects(this.scene.children);

    //返回选中的对象
    return intersects;
  }

  /**
   * 初始化渲染器
   */
  rendererInit() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    (this.$refs.startDom as HTMLElement).appendChild(this.renderer.domElement);
    // this.renderer.domElement.addEventListener("pointermove", this.onPointerMove);
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
   * 初始化场景 并向场景添加光源和辅助坐标系
   */
  sceneInit() {
    this.scene = new THREE.Scene();
    var ambient = new THREE.AmbientLight(0x383838);
    // var ambient = new THREE.AmbientLight(0xffffff);

    // this.spotLight = new THREE.SpotLight(0xffffff);
    // this.spotLight.intensity = 1;
    // this.spotLight.angle = Math.PI / 6;
    // // this.spotLight.penumbra = 2;
    // this.spotLight.position.set(this.ligX, this.ligY, this.ligZ);
    // this.spotLight.castShadow = true;
    var axisHelper = new THREE.AxesHelper(1000);
    // const spotLightHelper = new THREE.SpotLightHelper(this.spotLight);

    this.light = new THREE.PointLight(0xffffff, 2, 80);
    this.light.position.set(this.ligX, this.ligY, this.ligZ);

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(this.light, sphereSize);

    // RectAreaLightUniformsLib.init();

    // const rectLight1 = new THREE.RectAreaLight(0xffffff, 5, 4, 10);
    // rectLight1.position.set(this.ligX, this.ligY, this.ligZ);
    this.scene.add(this.light, pointLightHelper, ambient, axisHelper);
    // this.scene.add(new RectAreaLightHelper(rectLight1));
    // this.scene.add(ambient, this.spotLight, axisHelper, spotLightHelper);
  }

  /**
   * 初始化相机
   */
  cameraInit() {
    var k = window.innerWidth / window.innerHeight;
    var fov = 40; //三维场景显示范围控制系数，系数越大，显示的范围越大
    this.camera = new THREE.PerspectiveCamera(fov, k, 1, 2000);
    // this.camera.position.set(0, 10, 10);
    this.camera.position.set(this.camX, this.camY, this.camZ);
    const helper = new THREE.CameraHelper(this.camera);
    this.scene.add(helper);
    // this.camera.position.set(0, 0, 0);
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  /**
   * 初始化控制器
   */
  controlInit() {
    this.controls = new OrbitControls(this.camera, this.$refs.startDom);
    this.controls.dampingFactor = 0.2; //惯性大小
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = 1.5;
    this.controls.enableKeys = true;
    // this.controls.minAzimuthAngle = 0;
    // this.controls.maxAzimuthAngle = Math.PI / 2;
    this.controls.screenSpacePanning = false;
    // this.controls.panSpeed = 2;
    // this.controls.rotateSpeed = 2;
    // this.controls.zoomSpeed = 2;
    // this.controls.rotateSpeed = 0.5;
    this.controls.target.set(0, 0, 0);
    // this.controls.addEventListener("change", this.refresh);

    //解决键盘控制失效问题
    window.addEventListener("keydown", (event) => {
      this.controls.onKeyDown(event);
    });
  }

  /**
   * 初始化模型
   */
  modelling() {
    // let mtlLoader = new MTLLoader();
    // // mtlLoader.setBaseUrl("/model/dzzd1123/");
    // mtlLoader.setPath("/model/20-livingroom_obj/");
    // mtlLoader.load("InteriorTest.mtl", (mtl: any) => {
    //   mtl.preload();
    //   console.log(mtl);
    //   // mtl.crossOrigin = "Anonymous";
    //   let objLoader = new OBJLoader();
    //   objLoader.setMaterials(mtl);
    //   objLoader.setPath("/model/20-livingroom_obj/");
    //   objLoader.load("InteriorTest.obj", (obj: any) => {
    //     obj.scale.set(2, 2, 2);
    //     obj.position.set(this.objX, this.objY, this.objZ);
    //     // obj.position.set(-2, -1.5, 0);
    //     obj.name = "房间";
    //     this.meshHello = obj;
    //     this.scene.add(this.meshHello);
    //   });
    // });
    // console.log(this.scene);

    let manager = new THREE.LoadingManager();
    manager.addHandler(/\.dds$/i, new DDSLoader());
    const objLoader = new OBJLoader(manager);
    const mtlLoader = new MTLLoader(manager).setPath("/model/dzzd1123/");
    mtlLoader.load("dzzd.mtl", (mtl: any) => {
      //obj模型对应材质
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load("/model/dzzd1123/dzzd.obj", (obj: any) => {
        obj.scale.set(2, 2, 2);
        obj.position.set(this.objX, this.objY, this.objZ);
        obj.name = "模拟房间";
        this.meshHello = obj;
        this.scene.add(this.meshHello);
        // this.scene.add(obj);
      });
    });

    this.initScreenModel();
    this.initComputerModel();
    // console.log(this.scene);
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
        this.textures[i].needsUpdate = true;
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
   * 绘制贴图
   */
  drawCanvas() {
    const canvas = this.$refs.myCanvas as HTMLCanvasElement[];
    //创建纹理
    if (canvas) {
      for (let i = 0; i < canvas.length; i++) {
        this.textures.push(new THREE.CanvasTexture(canvas[i]));
      }
    }
  }

  //模拟屏幕模型
  initScreenModel() {
    //创建贴图

    this.drawCanvas();
    console.log(this.textures);
    // 创建屏幕模型
    const geometry = new THREE.BoxGeometry(2, 1, 0.01);
    // 创建材质
    this.material = new THREE.MeshBasicMaterial({
      map: this.textures[0],
      transparent: true,
    });
    this.material.name = "视频源0";
    // 贴图
    const cube = new THREE.Mesh(geometry, this.material);
    cube.position.set(0, 1, 0);
    cube.name = "模拟大屏屏幕";
    let group = new THREE.Group();
    group.name = "大屏";
    group.add(cube);

    // this.group.add(cube);
    this.scene.add(group);
  }

  // 模拟模型电脑
  initComputerModel() {
    this.group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1, 0.5, 0.01);
    let material = new THREE.MeshBasicMaterial({
      map: this.textures[1],
      // transparent: true,
    });
    material.name = "视频源1";
    // 贴图
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(-2, 2, 0.5);
    cube.name = "模拟电脑屏幕";
    this.group.add(cube);
    this.group.name = `computer`;
    this.scene.add(this.group);
  }

  /**
   * 补间动画
   */
  addTween(mesh: any) {
    this.helloTween = new TWEEN.Tween([this.meshHello.position, this.meshHello.rotation])
      .to(
        [
          {
            x: 10,
            y: 0,
            z: 0,
          },
          {
            x: 0,
            y: 0,
            z: 0,
          },
        ],
        2000
      )
      // .yoyo(true)
      .easing(TWEEN.Easing.Linear.None)
      // .repeat("3")
      .onUpdate(() => {});
    this.helloTween.start();
  }

  /**
   * 渲染
   */
  animate() {
    this.drawImg();
    // window.requestAnimationFrame(() => this.animate());
    requestAnimationFrame(this.animate);
    this.update();
    // this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    // this.stats.end();

    // console.log(this.camera);
    // window.setTimeout(() => {
    //   let i = 0;
    //   i++;
    // }, 3000);
  }

  // 更新控件
  update() {
    this.controls.update();
    TWEEN.update();
    this.stats.update();
  }

  /**
   * 切换场景
   */
  changeScene(sceneName: string) {
    console.log(sceneName);
    switch (sceneName) {
      case "back":
        this.helloTween = new TWEEN.Tween(this.camera.position)
          .to(
            {
              x: -1,
              y: -1,
              z: 7,
            },
            2000
          )
          .easing(TWEEN.Easing.Linear.None)
          .onUpdate(() => {});
        this.helloTween.start();
        this.camera.fov = 45;
        this.camera.updateProjectionMatrix();
        // this.camera.position.set(-1, -1, 7);
        break;
      case "lighthouse":
        this.helloTween = new TWEEN.Tween(this.camera.position)
          .to(
            {
              x: 55,
              y: 55,
              z: -10,
            },
            2000
          )
          .easing(TWEEN.Easing.Linear.None)
          .onUpdate(() => {});
        // this.camera.lookAt(-4, -2, 3);
        this.helloTween.start();
        // this.camera.fov = 10;
        // this.camera.lookAt(2, 2, 2);
        // this.camera.updateProjectionMatrix();
        this.controls.target.set(20, 20, 20);
        this.controls.update();
        break;
      case "building":
        this.helloTween = new TWEEN.Tween(this.meshHello.position)
          .to(
            {
              x: -13,
              y: 5,
              z: 44,
            },
            2000
          )
          .easing(TWEEN.Easing.Linear.None)
          .onUpdate(() => {});
        this.helloTween.start();
        this.camera.position.set(-1, 8, 28);
        break;
      case "tower":
        this.helloTween = new TWEEN.Tween(this.meshHello.position)
          .to(
            {
              x: 39,
              y: 0,
              z: -27,
            },
            2000
          )
          .easing(TWEEN.Easing.Linear.None)
          .onUpdate(() => {});
        this.helloTween.start();
        this.camera.position.set(16, 5, 1);
        break;
      default:
        break;
    }
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
  bottom: 20px;
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
</style>
