<template>
  <div id="nav">
    <!-- <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/glb">Glb</router-link> |
    <router-link to="/first">First</router-link> |
    <router-link to="/model">Model</router-link> |
    <router-link to="/kvmTest">KvmTest</router-link> |
    <router-link to="/modelFormat">导入模型</router-link> -->
  </div>
  <router-view />
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  position: absolute;
  z-index: 999;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
