module.exports = {
    devServer: {
      proxy: {
        '/ws': {
          target: 'ws://192.168.1.81:7001',
          ws: true,
          changeOrigin: true
        }
      }
    }
  }