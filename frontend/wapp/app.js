// app.js
const utils = require("utils/util.js");
const monitor = require('./agent/tingyun-mp-agent.js');
  monitor.config({
    beacon: 'https://beacon-mp.tingyun.com',
    key: '2lxnd2Hj5ng',
    id: 'pZvINGj4-uI',
    sampleRate: 1
  })
  
App({
  onLaunch() {
    //获取show
    var that = this
    wx.request({
      url: utils.server_hostname + '/api/status/',
      method:"GET",
      success: function(res) {
        var code = res.statusCode
        // console.log(code)
        if (code != 404){
          that.globalData.show = false
        }else{
          that.globalData.show = true
        }
      }
    })
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    show:false
  },

  // onShareAppMessage: function () {
  //   return {
  //     title: 'Tripal: Share Trip With Pal',
  //     path: '/pages/index/index',
  //     imageUrl: 'https://tra-fr-2.zhouyc.cc/media/logo.png'
  //   }
  // }
})
