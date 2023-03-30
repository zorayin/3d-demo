<template>
  <div class="page">
    <!-- 模型展示区 -->
    <div ref="startDom" class="startDom"></div>

    <!-- 屏幕布局区 -->
    <div class="layout">
      <!-- 画板 -->
      <div class="painter">
        <canvas id="drawing-canvas" refs="paintCanvas" width="800" height="400"></canvas>
      </div>
      <!-- 素材 -->
      <div class="material">
        <img
          v-for="(item, index) in devIps"
          :key="index"
          crossorigin="anonymous"
          ref="echoImg"
          class="echoImg"
          :src="item"
          @mousedown="dragEchoImg($event, index)"
          :style="imgStyle(index)"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { reactive, ref, setDevtoolsHook } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";
import { Clock, GridHelper } from "three";
import Color from "element-plus/es/components/color-picker/src/color";
import { da } from "element-plus/lib/locale";
import { months, monthsShort } from "moment";
@Options({
  components: {},
})
export default class CutTo extends Vue {
  private renderer: any = "";
  private stats: any = "";
  private scene: any = "";
  private camera: any = "";
  private ambientLight: any = "";
  private pointLight: any = "";
  private controls: any = "";
  private devIps: string[] = [
    // "https://desk-fd.zol-img.com.cn/t_s208x130c5/g7/M00/0D/07/ChMkLGI9JMKIQwVUAB4EajPj8joAAB1zwN_7nAAHgSC345.jpg",
    // "https://desk-fd.zol-img.com.cn/t_s208x130c5/g7/M00/06/02/ChMkK2JU2GSIalsMABRnN4xk09QAACYlQKOso4AFGdP781.jpg",
    // "https://desk-fd.zol-img.com.cn/t_s208x130c5/g7/M00/01/04/ChMkK2JzQDeIdHtWAAVBMqa_elsAADFBQJ_sG0ABUFK945.jpg",
    // "https://desk-fd.zol-img.com.cn/t_s208x130c5/g7/M00/0D/07/ChMkLGI9JMKIQwVUAB4EajPj8joAAB1zwN_7nAAHgSC345.jpg",
    "http://192.168.11.215:8001",
    "http://192.168.11.216:8001",
    "http://192.168.11.217:8001",
    "http://192.168.11.218:8001",
  ];

  imgStyle(index: number) {
    if (index == 0) {
      return {
        top: `480px`,
        left: `970px`,
      };
    } else if (index == 1) {
      return {
        top: `480px`,
        left: `1380px`,
      };
    } else if (index == 2) {
      return {
        top: `715px`,
        left: `970px`,
      };
    } else if (index == 3) {
      return {
        top: `715px`,
        left: `1380px`,
      };
    }
  }

  mounted() {
    this.init();
    this.setupCanvasDrawing();
    this.animate();
  }

  /**
   * 初始化
   */
  init() {
    this.rendererInit();
    this.sceneInit();
    this.lightInit();
    this.cameraInit();
    this.controlInit();
    this.modelling();
    window.addEventListener("resize", this.onWindowResize);

    // (this.$refs.startDom as HTMLElement).addEventListener(
    //   "pointerdown",
    //   this.onPointerDown
    // );
  }

  private painterInfo: any[] = []; //画板上所有的绘制信息
  private painterEle: any = ""; //绘制信息
  private initPos: any = { x: 0, y: 0 };

  dragEchoImg(event: MouseEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    const drawingCanvas = document.getElementById("drawing-canvas") as HTMLCanvasElement;
    const drawingContext = drawingCanvas.getContext("2d") as CanvasRenderingContext2D;
    let imgs = this.$refs.echoImg as HTMLImageElement[];
    let curImg: any = imgs[index];
    const { width: imgW, height: imgH } = curImg.getBoundingClientRect();
    if (!curImg) return;
    const { l, r, t, b } = this.scope;

    window.addEventListener("mousemove", (e: MouseEvent) => {
      if (!curImg) return;
      e.preventDefault();
      e.stopPropagation();
      curImg.style.left = `${e.clientX - imgW / 2}px`;
      curImg.style.top = `${e.clientY - imgH / 2}px`;
    });

    curImg.addEventListener("mouseup", (e: MouseEvent) => {
      if (!curImg) return;

      if (index == 0) {
        curImg.style.left = `970px`;
        curImg.style.top = `480px`;
      } else if (index == 1) {
        curImg.style.left = `1380px`;
        curImg.style.top = `480px`;
      } else if (index == 2) {
        curImg.style.left = `970px`;
        curImg.style.top = `715px`;
      } else if (index == 3) {
        curImg.style.left = `1380px`;
        curImg.style.top = `715px`;
      }

      if (e.clientX < l || e.clientX > r || e.clientY < t || e.clientY > b) {
        curImg = null;
      } else {
        // 假设分4个区
        // A : (0,0)--(400,0)--(400,200)--(0,200)
        // B : (400,0)--(800,0)--(800,200)--(400,200)
        // C : (0,200)--(400,200)--(400,400)--(0,400)
        // D : (400,200)--(800,200)--(800,400)--(400,400)
        let pos = { x: -99, y: -99 };
        if (e.clientX >= l && e.clientX < l + 400) {
          if (e.clientY >= t && e.clientY < t + 200) {
            console.log("AAAA");
            pos = {
              x: 0,
              y: 0,
            };
          } else {
            console.log("CCCC");
            pos = {
              x: 0,
              y: 200,
            };
          }
        } else {
          if (e.clientY >= t && e.clientY < t + 200) {
            console.log("BBBB");
            pos = {
              x: 400,
              y: 0,
            };
          } else {
            console.log("DDDD");
            pos = {
              x: 400,
              y: 200,
            };
          }
        }

        drawingContext.drawImage(
          curImg,
          0,
          0,
          curImg.naturalWidth,
          curImg.naturalHeight,
          pos.x,
          pos.y,
          400,
          200
        );
        if (this.material.map) {
          this.material.map.needsUpdate = true;
        }

        this.painterEle = {
          id: index,
          img: imgs[index],
          x: pos.x,
          y: pos.y,
          with: 400,
          height: 200,
        };

        // 记录屏幕布局信息
        let hasEle = this.painterInfo.filter((item) => {
          return item.x == pos.x && item.y == pos.y;
        });
        if (hasEle.length == 0) {
          this.painterInfo.push(this.painterEle);
        } else {
          let comIdx = this.painterInfo.findIndex((item) => {
            return item.x == pos.x && item.y == pos.y;
          });
          this.painterInfo[comIdx] = this.painterEle;
        }

        console.log(this.painterInfo);

        curImg = null;
      }
    });
  }

  /**
   * 刷新屏幕
   */
  updateMaterial() {
    // if(this.painterInfo)
    const drawingCanvas = document.getElementById("drawing-canvas") as HTMLCanvasElement;
    const drawingContext = drawingCanvas.getContext("2d") as CanvasRenderingContext2D;
    let imgs = this.$refs.echoImg as HTMLImageElement[];
    this.painterInfo.forEach((ele, idx) => {
      drawingContext.drawImage(
        ele.img,
        0,
        0,
        ele.img.naturalWidth,
        ele.img.naturalHeight,
        ele.x,
        ele.y,
        400,
        200
      );
      if (this.material.map) {
        this.material.map.needsUpdate = true;
      }
    });
  }

  private drawStartPos = new THREE.Vector2();
  private material = new THREE.MeshBasicMaterial();
  private scope: any = "";

  setupCanvasDrawing() {
    const drawingCanvas = document.getElementById("drawing-canvas") as HTMLCanvasElement;

    //进入canvas范围
    const { x, y, width, height } = drawingCanvas.getBoundingClientRect();

    this.scope = { l: x, r: x + width, t: y, b: y + height };

    const drawingContext = drawingCanvas.getContext("2d") as CanvasRenderingContext2D;

    drawingContext.fillStyle = "#ff9090";
    drawingContext.fillRect(0, 0, 800, 400);

    this.material.map = new THREE.CanvasTexture(drawingCanvas);
    let paint = false;
    let _this = this;
    drawingCanvas.addEventListener("pointerdown", function (e) {
      paint = true;
      _this.drawStartPos.set(e.offsetX, e.offsetY);
    });

    drawingCanvas.addEventListener("pointermove", function (e) {
      if (paint) _this.draw(drawingContext, e.offsetX, e.offsetY);
    });

    drawingCanvas.addEventListener("pointerup", function () {
      paint = false;
    });

    drawingCanvas.addEventListener("pointerleave", function () {
      paint = false;
    });
  }

  draw(drawContext: CanvasRenderingContext2D, x: number, y: number) {
    drawContext.moveTo(this.drawStartPos.x, this.drawStartPos.y);
    drawContext.strokeStyle = "#ffffff";
    drawContext.lineTo(x, y);
    drawContext.stroke();
    this.drawStartPos.set(x, y);
    if (!this.material.map) return;
    this.material.map.needsUpdate = true;
  }

  onPointerDown(event: PointerEvent) {
    let pointer = new THREE.Vector2();
    pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, this.camera);
    let objects = this.scene.getObjectByName("plane");
    // console.log(objects);
    const intersects = raycaster.intersectObjects(this.scene.children, false);
    console.log(intersects);
    if (intersects.length > 0) {
      let intersect: any = "";
      intersect = intersects[0];

      // let cubeGeo = new THREE.BoxGeometry(1, 1, 1);
      // let cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xfeb74c });
      // console.log(cubeMaterial);
      // const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);

      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff * Math.random(),
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(geometry, material);
      // plane.rotateY(Math.PI / 2);

      // if(intersect==null||intersect==undefined)return;
      // if(!intersect)return;
      console.log(intersect);
      // if (intersect.object.name == "Cube.001_Cube.005") {
      //   console.log("111111");
      // }

      plane.position.copy(intersect.point).add(intersect.face.normal);
      // plane.position.divideScalar(1).floor().multiplyScalar(1).addScalar(0.5);
      this.scene.add(plane);

      // objects.push(voxel);
    }
  }

  modelling() {
    // const objLoader = new OBJLoader();
    // objLoader.load("/model/tv.obj", (obj: any) => {
    //   obj.scale.set(0.5, 0.5, 0.5);
    //   obj.position.set(0, -2, 0);
    //   obj.name = "obj";
    //   this.changeMaterial(obj);

    //   this.scene.add(obj);
    // });

    // this.setScreen();

    const geometry = new THREE.PlaneGeometry(8, 4);
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xffff00,
    //   side: THREE.DoubleSide,
    // });
    const plane = new THREE.Mesh(geometry, this.material);
    plane.name = "plane";
    this.scene.add(plane);

    console.log(this.scene);
  }

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
      } else if (ele.name == "Cube.001_Cube.005") {
        console.log(ele);
        //计算物体的长宽高
        const box = new THREE.Box3();
        ele.geometry.computeBoundingBox();
        box.copy(ele.geometry.boundingBox).applyMatrix4(ele.matrixWorld);
        let size = new THREE.Vector3(0, 0, 0);
        // console.log(box);
        this.screenSize = box.getSize(size);
        console.log(this.screenSize);
        ele.material = this.material;
        console.log(this.scene);
      }
    });
  }

  private screenSize: any = "";

  /**
   * 初始化渲染器
   */
  rendererInit() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff);
    let dom = this.$refs.startDom as HTMLElement;
    const { width, height } = dom.getBoundingClientRect();
    this.renderer.setSize(width, height);
    dom.appendChild(this.renderer.domElement);
  }

  /**
   * 窗口变化自适应
   */
  onWindowResize() {
    let dom = this.$refs.startDom as HTMLElement;
    const { width, height } = dom.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 初始化场景 并向场景添加光源和辅助坐标系
   */
  sceneInit() {
    this.scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.background = new THREE.Color(0xbfe3dd);
    // var axisHelper = new THREE.AxesHelper(1000);
    // this.scene.add(axisHelper);
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
    this.scene.add(this.pointLight, this.ambientLight);
  }

  /**
   * 初始化相机
   */
  cameraInit() {
    // var k = window.innerWidth / window.innerHeight;
    let dom = this.$refs.startDom as HTMLElement;
    const { width, height } = dom.getBoundingClientRect();
    var fov = 45; //三维场景显示范围控制系数，系数越大，显示的范围越大
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.01, 2000);
    this.camera.position.set(8, 4, 9);
  }

  /**
   * 初始化控制器
   */
  controlInit() {
    this.controls = new OrbitControls(this.camera, this.$refs.startDom as HTMLElement);
    this.controls.dampingFactor = 0.2; //惯性大小
    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = 1.5;
    this.controls.enableKeys = true;
    this.controls.screenSpacePanning = false;
    this.controls.target.set(0, 0, 0);
    this.controls.maxZoom = Infinity;
    this.controls.keys = {
      LEFT: "KeyA", //ArrowLeft
      UP: "KeyW", //ArrowUp
      RIGHT: "KeyD", //ArrowRight
      BOTTOM: "KeyS", //ArrowDown
    };
    //解决键盘控制失效问题
    this.controls.listenToKeyEvents(window);
  }

  /**
   * 渲染
   */
  animate() {
    if (this.material.map) {
      this.material.map.needsUpdate = true;
    }
    this.updateMaterial();
    this.controls.update();
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }
}
</script>
<style lang="less">
.page {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  .startDom {
    width: 50vw;
    height: 100vh;
  }
  .layout {
    width: 50vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    .painter {
      // width: 800px;
      // height: 400px;
      width: 100%;
      height: 50%;
      background-color: khaki;
    }
    .material {
      width: 100%;
      height: 50%;
      margin-top: 10px;
      // position: relative;
      // top: 490px;
      // left: auto;
      .echoImg {
        position: absolute;
        width: 200px;
        margin-left: 5px;
      }
    }
  }
}
.moveImg {
  width: 200px;
  position: absolute;
  top: -99%;
  left: -99%;
  z-index: 999;
  display: "none";
}
</style>
