// app.js
App({
  onLaunch: function () {
    wx.cloud.init({
      // env: '云开发环境ID',
      traceUser: true
    })
  }
})
