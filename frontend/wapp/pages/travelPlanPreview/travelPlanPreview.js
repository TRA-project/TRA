// pages/travelPlanPreview/travelPlanPreview.js
const utils = require("../../utils/util.js");

const keyMap = {
  "area": "地区",
  "tag" : "关键词",
  "cost": "预期开销",
  "timeStart": "开始时间",
  "timeEnd": "结束时间"
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    customArg: {},

    mapLongitude: 116.46,
    mapLatitude: 39.92,
    mapMarkers: [
      {
        iconPath: "/images/locate-marker.png",
        width: "40rpx",
        height: "60rpx",
        longitude: 116.46,
        latitude: 39.92,
      }
    ],

    plansActive: 0,
    travelPlansList: [],
    tmpTravelPlansList: [
      [
        {
          id: 1,
          name: "北京航空航天大学",
          position: "北京市海淀区学院路37号",
          image: "scenery-preview.png"
        },
        {
          id: 2,
          name: "肯德基（长城电脑大厦店）",
          position: "北京市海淀区学院路38号长城电脑大厦",
          image: "scenery-preview.png"
        },
        {
          id: 3,
          name: "麦当劳（花园北路餐厅）",
          position: "北京市海淀区学院路甲38号",
          image: "scenery-preview.png"
        },
      ],
      [
        {
          id: 4,
          name: "层岩巨渊",
          position: "提瓦特北陆璃月南侧",
          image: "scenery-preview.png"
        },
        {
          id: 5,
          name: "道成林",
          position: "提瓦特央陆须弥东侧",
          image: "scenery-preview.png"
        },
        {
          id: 6,
          name: "恒纳兰那",
          position: "提瓦特央陆须弥北侧",
          image: "scenery-preview.png"
        },
      ],
    ],

    stepsActive: 0,
    steps: [
      {
        text: '行程1',
        desc: '描述信息',
      },
      {
        text: '行程2',
        desc: '描述信息',
      },
      {
        text: '行程3',
        desc: '描述信息',
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 配置参数显示
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on("travelPlan", data => {
      console.log("eventChannel:", data)
      var transData = Object.keys(data.arg).reduce((newData, key) => {
        let newKey = keyMap[key] || key
        if (key === "timeStart" || key === "timeEnd") {
          newData[newKey] = utils.formatTime(new Date(data.arg[key]))
        } else {
          newData[newKey] = data.arg[key]
        }
        return newData
      }, {})
      this.setData({
        customArg: transData
      })
    })
    console.log(this.data.customArg)

    // 地图相关
    console.log("preview on load")
    var markerLo = "mapMarkers[0].longitude"
    var markerLa = "mapMarkers[0].latitude"
    wx.getLocation({
      success: (res) => {
        this.setData({
          mapLongitude: res.longitude,
          mapLatitude: res.latitude,
          [markerLo]: res.longitude,
          [markerLa]: res.latitude
        })
        console.log("longitude:", this.data.mapLongitude)
        console.log("latitude:" , this.data.mapLatitude)
        console.log("marker longitude:" , this.data.mapMarkers[0].longitude)
        console.log("marker latitude:" , this.data.mapMarkers[0].latitude)
      }
    })

    var url = utils.server_hostname + "/api/core/" + "plan/new/"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "GET",
      data: {
        "city": "北京市",
        "token-auth": token
      },
      header: {

      },
      success: (res) => { // 发送请求成功
        console.log("receive plan:", res)
        if (res.statusCode !== 200) {
          this.setData({
            travelPlansList: this.data.tmpTravelPlansList
          })
        } else {
          this.setData({
            travelPlansList: res.data
          })
        }
      },
      fail: (res) => {  // 发送请求失败
        console.log(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  onTabChange(event) {
    wx.showToast({
      title: `切换到方案 ${event.detail.name + 1 }`,
      icon: 'none',
    });
  },

  onStepClick(event) {
    this.setData({
      stepsActive: event.detail
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})