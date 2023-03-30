
module.exports = {
     // 基本路径
  publicPath: "./",
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: true,
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://192.168.11.247:8099",
        pathRewrite: { "^/api": "" },
        ws: true,
        changeOrigin: true,
}
    }
}
}