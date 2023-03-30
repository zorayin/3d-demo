<template>
  <div id="container">
    <br />
    <button @mousedown="change1">气象台</button> |
    <button @mousedown="change2">灯塔</button> |
    <button @mousedown="change3">原点</button> |
    <!-- <button @click="action">开始运动</button> -->

    <div class="vector">
      <div class="slider-demo-block">
        <span class="demonstration">vectorX</span>
        <el-slider v-model="vectorX" />
      </div>
      <div class="slider-demo-block">
        <span class="demonstration">vectorY</span>
        <el-slider v-model="vectorY" />
      </div>
      <div class="slider-demo-block">
        <span class="demonstration">vectorZ</span>
        <el-slider v-model="vectorZ" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import * as THREE from "three";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
// import { OrbitControls } from "@three-ts/orbit-controls";
const OrbitControls = require("three-orbit-controls")(THREE);
// import Stats from 'three/examples/jsm/libs/stats.module';
// import {TWEEN} from 'three/examples/jsm/libs/tween.module.min';
const TWEEN = require("@tweenjs/tween.js");

export default {
  data() {
    // var mesh;
    // var scene;
    // var scene1;
    // var scene2;
    return {
      // publicPath: process.env.BASE_URL,
      camera: null,
      renderer: null,
      controls: null,
      vectorX: ref(0),
      vectorY: ref(0),
      vectorZ: ref(0),
    };
  },

  mounted() {
    this.init();
  },
  watch: {
    vectorX() {
      this.controls.target = new THREE.Vector3(this.vectorX, this.vectorY, this.vectorZ);
    },
    vectorY() {
      this.controls.target = new THREE.Vector3(this.vectorX, this.vectorY, this.vectorZ);
    },
    vectorZ() {
      this.controls.target = new THREE.Vector3(this.vectorX, this.vectorY, this.vectorZ);
    },
  },
  methods: {
    //  初始化
    init() {
      this.createScene();
      this.createLight();
      this.createCamera();
      this.createRender();
      this.loadObj();
      this.createOrbitControls();
      this.render();
    },

    // 创建场景
    createScene() {
      this.scene = new THREE.Scene();
      this.scene.add(new THREE.AxesHelper(5));
    },

    // 加载模型
    loadObj() {
      let manager = new THREE.LoadingManager();
      manager.addHandler(/\.dds$/i, new DDSLoader());
      const OBJLoader = new THREE.OBJLoader(manager);
      const MTLLoader = new THREE.MTLLoader(manager).setPath("/model/dzzd1123/");
      MTLLoader.load("dzzd.mtl", (mtl) => {
        //obj模型对应材质
        mtl.preload();
        OBJLoader.setMaterials(mtl);
        OBJLoader.load("/model/dzzd1123/dzzd.obj", (obj) => {
          obj.scale.set(1, 1, 1);
          obj.position.set(0, 0, 0);
          this.scene.add(obj);
        });
      });
    },

    // 创建光源
    createLight() {
      // 环境光
      const ambientLight = new THREE.AmbientLight(0x383838);
      this.scene.add(ambientLight);

      // 聚光灯
      const spotLight = new THREE.SpotLight(0xffffff);
      spotLight.intensity = 1.5;
      spotLight.angle = Math.PI / 6;
      spotLight.penumbra = 2;
      spotLight.position.set(200, 200, 200);
      spotLight.castShadow = true;
      this.scene.add(spotLight);
    },

    // 创建相机
    createCamera() {
      const element = document.getElementById("container");
      const width = element.clientWidth;
      const height = element.clientHeight;
      const k = width / height;
      let FOV;
      let FAR;
      let NEAR = 0.1;

      // Mobile camera
      if (window.innerWidth <= 768) {
        FOV = 50;
        FAR = 1200;
        // 769px - 1080px screen width camera
      } else if (window.innerWidth >= 769 && window.innerWidth <= 1080) {
        FOV = 50;
        FAR = 1475;
        // > 1080px screen width res camera
      } else {
        FOV = 40;
        FAR = 1800;
      }

      this.camera = new THREE.PerspectiveCamera(FOV, k, NEAR, FAR);
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.scene.add(this.camera);
      const helper = new THREE.CameraHelper(this.camera);
      this.scene.add(helper);
    },

    // 创建渲染器
    createRender() {
      const element = document.getElementById("container");
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(element.clientWidth, element.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.renderer.setClearColor(0xffffff, 1);
      element.appendChild(this.renderer.domElement);
    },

    // 创建轨道控制器
    createOrbitControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enabled = true;
      this.controls.target = new THREE.Vector3(this.vectorX, this.vectorY, this.vectorZ);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.1; //惯性大小
      this.minDistance = 0;
      this.maxDistance = Infinity;
      this.controls.minPolarAngle = 0;
      this.controls.maxPolarAngle = 1.5;
      this.controls.enableKeys = true;
      this.controls.minAzimuthAngle = 0;
      this.controls.maxAzimuthAngle = Math.PI / 2;
      this.controls.screenSpacePanning = false;
      this.controls.rotateSpeed = 0.5;

      //解决键盘控制失效问题
      window.addEventListener("keydown", (event) => {
        this.controls.onKeyDown(event);
      });
    },

    // 渲染
    render() {
      this.controls.update();
      TWEEN.update();
      requestAnimationFrame(this.render);
      this.renderer.render(this.scene, this.camera);
      // console.log(this.camera.position);
    },

    change1() {
      console.log("切换1");
      this.controls.target = new THREE.Vector3(12.5, 1.58, -14.26);
      this.camera.zoom = 3;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    },

    change2() {
      console.log("切换2");
      // let position = this.scene.position;
      // let tween = new TWEEN.Tween(position);
      // tween.to({ x: 100 }, 1000);
      // tween.start();
      this.controls.target = new THREE.Vector3(-24.73, 5.17, 10.25);
      // this.camera.zoom = 3;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    },

    change3() {
      this.controls.target = new THREE.Vector3(0, 0, 0);
      this.camera.zoom = 1;
      this.camera.position.set(0, 0, 5);
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
      // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    },

    // clearModel() {
    //   if (this.scene !== null && this.scene.children.length > 3) {
    //     this.scene.children.pop();
    //     const domDiv = document.getElementsByTagName("canvas");
    //     const container = document.getElementById("container");
    //     // console.log(domDiv);
    //     if (container !== null) {
    //       container.removeChild(domDiv[0]);
    //     }
    //   }
    // },
    // refresh() {
    //   this.clearModel();
    //   this.init();
    // },
  },
};
</script>

<style lang="less" scoped>
#container {
  width: 100vw;
  height: 100vh;
}
.slider-demo-block {
  display: flex;
  align-items: center;
}
.slider-demo-block .el-slider {
  margin-top: 0;
  margin-left: 12px;
}
.slider-demo-block .demonstration {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 44px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0;
}
.slider-demo-block .demonstration + .el-slider {
  flex: 0 0 70%;
}
.vector {
  width: 50%;
  position: absolute;
  right: 0;
}
</style>
