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
  globalData: {
    userInfo: null,
    sysInfo: null,
    windowW:null,
    windowH:null,
    show:false,
    historyList: [],
  },

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

    that.getUserInfo()
    that.getSysInfo()
  },

  // 获取用户信息
  getUserInfo(cb) {
    var that = this
    wx.login({
      success: () => {
        wx.getUserInfo({
          success: (res) => {
            that.globalData.userInfo = res.userInfo
            console.log(res.userInfo);
            typeof cb == "function" && cb(that.globalData.userInfo)
          }
        })
      }
    })
  },

  // 获取手机信息
  getSysInfo() {
    var that = this
    wx.getSystemInfo({
      success: (res) => {
        console.log("[model]", res.model)
        console.log("[pixelRatio]", res.pixelRatio)
        console.log("[windowWidth]", res.windowWidth)
        console.log("[windowHeight]", res.windowHeight)
        console.log("[language]", res.language)
        console.log("[version]", res.version)
        console.log("[platform]", res.platform)
        //设置变量值
        that.globalData.sysInfo = res;
        that.globalData.windowW = res.windowWidth;
        that.globalData.windowH = res.windowHeight;
      }
    })
  }

  // onShareAppMessage: function () {
  //   return {
  //     title: 'Tripal: Share Trip With Pal',
  //     path: '/pages/index/index',
  //     imageUrl: 'https://tra-fr-2.zhouyc.cc/media/logo.png'
  //   }
  // }
})
