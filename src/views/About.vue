<template>
  <div class="about">
    <!-- <h1>This is an about page</h1> -->
    <div id="box"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
// import Stats from 'stats-js';
// import OrbitControls from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader,  MTLLoader} from 'three-obj-mtl-loader';
import {DDSLoader} from "three/examples/jsm/loaders/DDSLoader";
const OrbitControls=require("three-orbit-controls")(THREE); //鼠标控制


let scene;// 场景
let mesh;//物体
export default {
  name:"about",
  data(){
    return{
      stats: null, // 用于显示帧速率
      camera: null, // 相机
      // scene: null, // 场景
      renderer: null, // 渲染器
      labelRenderer: null, //CSS2D加载器
      mouse: null, // 鼠标对象
      controls: null, // 鼠标旋转
      publicPath: "/model/male02/", // public地址 
      // mesh:null,
    }
  },
  methods:{
    // 初始化
    init(){
      // 获取实例
      const box=document.getElementById('box');

      // 创建相机
      this.camera=new THREE.PerspectiveCamera(80,box.clientWidth/box.clientHeight,0.1,1000)
      this.camera.position.z=5;

      // 创建场景
      this.scene=new THREE.Scene();

      // 创建渲染器
      this.renderer=new THREE.WebGLRenderer({antialias:true});
      this.renderer.setSize(box.clientWidth,box.clientHeight);
      this.renderer.setClearColor(0xb9d3ff, 0.4);
      box.appendChild(this.renderer.domElement);
      new OrbitControls(this.camera, this.renderer.domElement);
      
      // 创建光源
      const spotLight=new THREE.SpotLight(0xac6c20);
      spotLight.position.set(100,100,100);
      spotLight.angle=Math.PI/6;
      spotLight.penumbra=1;
      spotLight.name='聚光灯';
      this.scene.add(spotLight);

      // 环境光
      const ambient=new THREE.AmbientLight(0xFFFFFF);
      ambient.name='环境光';
      this.scene.add(ambient);

      this.getCube();
      // this.getOrbitControls();
    },

    // 鼠标控制器
    getOrbitControls(){
      this.controls=new OrbitControls(this.camera,this.renderer.domElement);
      this.controls.minDistance=300;
      this.controls.maxDistance=500;
    },

    // 渲染动画
    animate(){
      requestAnimationFrame(this.animate);
      // this.mesh.rotation.x+=0.01;
      // this.mesh.rotation.y+=0.01;
      this.renderer.render(this.scene,this.camera);
    },

    // 创建模型
    getCube(){
      const geometry=new THREE.BoxGeometry(1,1,1);
      const material=new THREE.MeshNormalMaterial({
        color:0x00ff00
      })
      // material.side=THREE.FrontSide;
      // const cubeMesh=new THREE.Mesh(cube,material);
     this.mesh=new THREE.Mesh(geometry,material);
      // cubeMesh.position.set(300,200,50);
      this.scene.add(this.mesh)
      this.camera.lookAt(this.scene.position)
    },

    // 加载外部文件
    getOther(){
      // 方法一
      let manager = new THREE.LoadingManager();
      manager.addHandler( /\.dds$/i, new DDSLoader());
      const OBJLoader=new THREE.OBJLoader(manager);
      const MTLLoader=new THREE.MTLLoader(manager).setPath("/model/male02/");
      MTLLoader.load("male02.mtl",(mtl)=>{
        //obj模型对应材质
        mtl.preload();
        OBJLoader.setMaterials(mtl);
        OBJLoader.load("/model/male02/male02.obj",(obj)=>{
          obj.scale.set(0.03,0.03,0.03);
          obj.position.set(0,-3,0);
          this.scene.add(obj);
        })
      })
      this.camera.lookAt(this.scene.position)


      // 方法二  光源会失效
      // const OBJLoader = new THREE.OBJLoader()// obj加载器
      //   const MTLLoader = new THREE.MTLLoader()// 材质文件加载器

      //   MTLLoader.load(`${this.publicPath}male02.mtl`, mtl => {
      //     // obj的模型会和MaterialCreator包含的材质对应起来
      //     OBJLoader.setMaterials(mtl)
      //     OBJLoader.load(`${this.publicPath}male02.obj`, obj => {
      //       // console.log(obj)
      //       obj.scale.set(0.03, 0.03, 0.03) // 放大obj组对象
      //       obj.position.set(0, -3, 0) //调整位置
      //       this.scene.add(obj)// 返回的组对象插入场景中
      //     })
      //   })


    }

  },
   mounted() {
      // console.log("3333")
      this.init();
      // this.getOther();
      
      this.animate();
    },

}
</script>

<style scoped>
    /* body { margin: 0; overflow: hidden;} */
    #box{width: 100vw;height: 100vh;}
</style>