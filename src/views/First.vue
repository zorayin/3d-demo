<template>
  <div>
    <div ref="startDom"></div>
    <!-- <div class="echoImgs">
      <img
        v-for="(item, index) in devIps"
        :key="index"
        crossorigin="anonymous"
        ref="echoImg"
        class="echoImg"
        @click="choosedItem(index)"
        draggable="true"
        ondragstart="event.dataTransfer.setData('text/plain',null)"
      />
    </div>
    <canvas ref="myCanvas" width="900" height="500"></canvas> -->
  </div>
</template>

<script lang="ts">
interface TextureInfo {
  texture: any;
  sourceIndex: number;
}

import * as THREE from "three";
import { ref, App } from "vue";
import { Watch } from "vue-property-decorator";
import { Options, Vue } from "vue-class-component";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { Ray } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

// const { FirstPersonControls } = require("../utils/FirstPersonControls.js");

@Options({
  components: {},
})
export default class ModelFormat extends Vue {
  private renderer: any = "";
  private stats: any = "";
  private scene: any = "";
  private camera: any = "";
  private ambientLight: any = "";
  private pointLight: any = "";
  private orbitControls: any = "";
  private controls: any = "";
  private curModelType: string = "";
  private clock: any = "";
  private deg: number = 0;
  private textures: TextureInfo[] = [];
  private devIps: string[] = [
    "https://desk-fd.zol-img.com.cn/t_s208x130c5/g7/M00/0D/07/ChMkLGI9JMKIQwVUAB4EajPj8joAAB1zwN_7nAAHgSC345.jpg",
    "https://desk-fd.zol-img.com.cn/t_s208x130c5/g7/M00/06/02/ChMkK2JU2GSIalsMABRnN4xk09QAACYlQKOso4AFGdP781.jpg",
    "https://desk-fd.zol-img.com.cn/t_s208x130c5/g7/M00/01/04/ChMkK2JzQDeIdHtWAAVBMqa_elsAADFBQJ_sG0ABUFK945.jpg",
    "https://desk-fd.zol-img.com.cn/t_s208x130c5/g7/M00/0D/07/ChMkLGI9JMKIQwVUAB4EajPj8joAAB1zwN_7nAAHgSC345.jpg",
  ];
  private curDrag: any = "";

  changeMaterial(obj: any) {
    obj.children.forEach((ele: any, idx: number) => {
      if (ele.name == "Cube.006_Cube") {
        const material = new THREE.MeshBasicMaterial({ color: "#444" });
        ele.material = material;
      } else if (ele.name == "Cube.002_Cube.003") {
        const material = new THREE.MeshBasicMaterial({ color: "#6e5959" });
        ele.material = material;
      } else if (ele.name == "Cube_Cube.001") {
        const material = new THREE.MeshBasicMaterial({ color: "#a89191" });
        ele.material = material;
      } else if (ele.name == "Cube.003_Cube.004") {
        const material = new THREE.MeshBasicMaterial({ color: "#f7d184" });
        ele.material = material;
      } else if (ele.name == "Cube.005_Cube.007") {
        const material = new THREE.MeshBasicMaterial({ color: "#f7d184" });
        ele.material = material;
      } else if (ele.name == "Cube.004_Cube.006") {
        const material = new THREE.MeshBasicMaterial({ color: "#a89191" });
        ele.material = material;
      }
    });
  }

  choosedItem(index: number) {
    console.log(index);
    let imgs = this.$refs.echoImg as HTMLElement[];
    console.log(imgs);
  }

  /**
   * 绘制固定图层
   */
  drawImg() {
    var imgs = this.$refs.echoImg as HTMLImageElement[];
    const canvas = this.$refs.myCanvas as HTMLCanvasElement;
    if (!canvas) return;
    var ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (imgs) {
      for (let i = 0; i < imgs.length; i++) {
        let target = imgs[i];
        target.src = this.devIps[i];
        this.textures[0].texture.needsUpdate = true;
        // console.log(target.naturalWidth, target.naturalHeight);
        if (i == 0) {
          ctx.drawImage(
            target,
            0,
            0,
            target.naturalWidth / 2,
            target.naturalHeight / 2,
            0,
            0,
            450,
            250
          );
        } else if (i == 1) {
          ctx.drawImage(
            target,
            target.naturalWidth / 2,
            0,
            target.naturalWidth / 2,
            target.naturalHeight / 2,
            450,
            0,
            450,
            250
          );
        } else if (i == 2) {
          ctx.drawImage(
            target,
            0,
            target.naturalHeight / 2,
            target.naturalWidth / 2,
            target.naturalHeight / 2,
            0,
            250,
            450,
            250
          );
        } else if (i == 3) {
          ctx.drawImage(
            target,
            target.naturalWidth / 2,
            target.naturalHeight / 2,
            target.naturalWidth / 2,
            target.naturalHeight / 2,
            450,
            250,
            450,
            250
          );
        }
      }
    }
  }

  /**
   * 绘制贴图
   */
  drawCanvas() {
    const canvas = this.$refs.myCanvas as HTMLCanvasElement;
    //创建纹理
    if (canvas) {
      let texture = new THREE.CanvasTexture(canvas);
      // texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.wrapS = THREE.RepeatWrapping;
      this.textures.push({
        texture: new THREE.CanvasTexture(canvas),
        sourceIndex: 0,
      });
      // for (let i = 0; i < canvas.length; i++) {
      //   let texture = new THREE.CanvasTexture(canvas[i]);
      //   // texture.wrapT = THREE.ClampToEdgeWrapping;
      //   texture.wrapS = THREE.RepeatWrapping;
      //   this.textures.push({
      //     texture: new THREE.CanvasTexture(canvas[i]),
      //     sourceIndex: i,
      //   });
      // }
    }
  }

  mounted() {
    this.init();
    this.animate();
  }

  /**
   * 初始化
   */
  init() {
    // this.statsInit();
    this.rendererInit();
    this.sceneInit();
    this.lightInit();
    this.cameraInit();
    // this.findModelToDrag();
    this.controlInit();
    this.modelling();
    // this.fbxInit();
    window.addEventListener("resize", this.onWindowResize);
    // (this.$refs.startDom as HTMLElement).addEventListener("mousemove", this.onMouseMove);
  }

  /**
   * obj+mtl模型
   */
  modelling() {
    let manager = new THREE.LoadingManager();
    // manager.addHandler(/\.dds$/i, new DDSLoader());
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader(manager).setPath("/static/1111/");
    mtlLoader.load("11111.mtl", (mtl: any) => {
      //   //obj模型对应材质
      mtl.preload();
      //   objLoader.setMaterials(mtl);
      //   console.log(mtl);
      // });
      objLoader.load("/static/1111/11111.obj", (obj: any) => {
        obj.scale.set(1, 1, 1);
        obj.position.set(0, 0, 0);
        // obj.name = "obj";
        // this.changeMaterial(obj);
        this.scene.add(obj);
      });
      // this.scene.add(child);
      // this.drawCanvas();
      // this.setScreen();
      console.log(this.scene);

      //     const loader = new OBJLoader();

      // // load a resource
      // loader.load(
      // 	// resource URL
      // 	'models/monster.obj',
      // 	// called when resource is loaded
      // 	 (obj: any) => {

      // 		this.scene.add( obj );

      // 	},
      // );
    });
  }

  fbxInit() {
    const loader = new FBXLoader();
    loader.load("/model/1111/111111111.fbx", (object) => {
      object.scale.set(1, 1, 1);
      object.name = "fbx";
      this.curModelType = object.name;
      this.scene.add(object);
    });
  }

  private ac: any = "";

  /**
   * 根据射线经过的group找到模型并开启拖拽事件
   */
  findModelToDrag() {
    let _this = this;
    this.renderer.domElement.addEventListener("mousedown", function (e: MouseEvent) {
      // console.log(_this.curModelType);

      let raycaster = _this.screenToWorld(e.clientX, e.clientY);
      let intersect = raycaster.intersectObjects(
        _this.scene.getObjectByName("obj").children
      );
      if (intersect.length > 0) {
        _this.ac = intersect[0].object;
        if (_this.ac.name == "Cube.001_Cube.005") {
          const material = new THREE.MeshBasicMaterial({
            map: _this.textures[0].texture,
          });
          _this.ac.material = material;
        }
        console.log(_this.ac);
        if (!_this.ac) return;
      }
    });

    this.renderer.domElement.addEventListener("mouseup", function (e: MouseEvent) {
      if (_this.ac) {
        _this.ac = false;
      }
    });
  }

  private curPart: any = "";

  /**
   * 场景世界坐标转平面二维坐标
   * @param offsetX 鼠标相对于画布左上角横向坐标
   * @param offsetY 鼠标相对于画布左上角纵向坐标
   * @returns {Raycaster}
   */
  screenToWorld(offsetX: number, offsetY: number) {
    // let x = (offsetX / window.innerWidth) * 2 - 1,
    //   y = -(offsetY / window.innerHeight) * 2 + 1;
    // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
    //这里的container就是画布所在的div，也就是说，这个是要拿整个scene所在的容器来界定的
    let dom = this.$refs.startDom as HTMLElement;
    let getBoundingClientRect = dom.getBoundingClientRect();
    let x = ((offsetX - getBoundingClientRect.left) / dom.offsetWidth) * 2 - 1;
    let y = -((offsetY - getBoundingClientRect.top) / dom.offsetHeight) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    return raycaster;
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
    this.stats = new (Stats as any)();
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
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.background = new THREE.Color(0xbfe3dd);
    var axisHelper = new THREE.AxesHelper(1000);
    this.scene.add(axisHelper);
  }

  /**
   * 初始化灯光
   */
  lightInit() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.pointLight = new THREE.PointLight(0xffffff, 2, 80);
    this.pointLight.position.set(0, 10, 0);
    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(this.pointLight, sphereSize);
    this.scene.add(this.pointLight, pointLightHelper, this.ambientLight);
  }

  /**
   * 初始化相机
   */
  cameraInit() {
    var k = window.innerWidth / window.innerHeight;
    var fov = 45; //三维场景显示范围控制系数，系数越大，显示的范围越大
    this.camera = new THREE.PerspectiveCamera(fov, k, 0.01, 2000);
    this.camera.position.set(0, 2, 0);
  }

  /**
   * 初始化控制器
   */
  controlInit() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.$refs.startDom as HTMLElement
    );
    this.orbitControls.dampingFactor = 0.2; //惯性大小
    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = 1.5;
    this.orbitControls.enableKeys = true;
    this.orbitControls.screenSpacePanning = false;
    this.orbitControls.target.set(0, 0, 0);
    this.orbitControls.maxZoom = Infinity;
    this.orbitControls.keys = {
      LEFT: "KeyA", //ArrowLeft
      UP: "KeyW", //ArrowUp
      RIGHT: "KeyD", //ArrowRight
      BOTTOM: "KeyS", //ArrowDown
    };
    //解决键盘控制失效问题
    this.orbitControls.listenToKeyEvents(window);
    // this.clock = new THREE.Clock();
    // this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);

    // this.controls.lookSpeed = 0.05; //环视速度
    // this.controls.movementSpeed = 1; //移动速度
    // this.controls.noFly = true;
    // this.controls.lookVertical = false;
    // this.controls.constrainVertical = true;
    // this.controls.verticalMin = 1.0;
    // this.controls.verticalMax = 2.0;
  }

  /**
   * 渲染
   */
  animate() {
    this.drawImg();
    requestAnimationFrame(this.animate);
    // this.update();
    this.renderer.render(this.scene, this.camera);
  }

  private duration: number = 1; //遥控器按下到松开的时长

  /**
   * 改变控制器
   */
  changeControls() {
    // const delta = this.clock.getDelta(); //获取自上次调用的时间差
    // const delta = 20;
    // console.log(delta);
    this.controls.update(this.deg);
  }

  // 更新控件
  update() {
    // this.orbitControls.update();
    // this.stats.update();
    const delta = this.clock.getDelta(); //获取自上次调用的时间差
    // console.log(delta);
    // this.controls.update();
    this.orbitControls.update();
    // this.controls.update(this.deg);
  }
}
</script>

<style lang="less" scoped>
.menuControl {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  .el-tree {
    background: rgba(255, 255, 255, 0.7);
    width: 200px;
    height: 350px;
    border-radius: 0 5px 5px 0;
    --el-tree-expand-icon-color: #000000;
    --el-tree-text-color: #2a2a2a;
    overflow: scroll;
    /deep/ .el-tree-node__content {
      height: 35px;
    }
  }

  .el-tree::-webkit-scrollbar {
    width: 0 !important;
  }
}
.modelType {
  position: absolute;
  left: 10px;
  top: 10px;
}

.corona {
  position: absolute;
  top: 20px;
  right: 50px;
  z-index: 999999;
  /* width: 150px; */
  /* height: 50px; */
  /* background-color: red; */
  color: white;
  display: flex;
  flex-direction: row;
  /* line-height: 50px; */
  button {
    background-color: none;
    padding: 5px;
    font-size: 16px;
  }
}
.echoImgs {
  position: absolute;
  bottom: 0;
}
</style>
