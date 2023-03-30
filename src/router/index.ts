import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import KvmTest from '../views/KvmTest.vue'
import ModelFormat from '../views/ModelFormat.vue'
import ModelSetting from '../views/ModelSetting.vue'
import ModelReview from '../views/ModelReview.vue'
import CutTo from '../views/CutTo.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/glb',
    name: 'Glb',
    component: () => import(/* webpackChunkName: "about" */ '../views/Glb.vue')
  },
  {
    path: '/first',
    name: 'First',
    component: () => import(/* webpackChunkName: "about" */ '../views/First.vue')
  },
  {
    path: '/model',
    name: 'Model',
    component: () => import(/* webpackChunkName: "about" */ '../views/Model.vue')
  },
  {
    path: '/kvmTest',
    name: 'KvmTest',
    component: KvmTest
  },
  {
    path: '/modelFormat',
    name: 'ModelFormat',
    component: ModelFormat
  },
  {
    path: '/modelSetting',
    name: 'ModelSetting',
    component: ModelSetting,
    meta:{
      keepAlive:true
    }
  },
  {
    path:'/modelReview',
    name:'ModelReview',
    component:ModelReview
  }
  ,
  {
    path:'/cutTo',
    name:'CutTo',
    component:CutTo
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
