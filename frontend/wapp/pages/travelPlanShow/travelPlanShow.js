// pages/travelPlanShow/travelPlanShow.js

const utils = require("../../utils/util")

const activeIcon = {
  iconPath: "/images/locate-marker-focus-double.png",
  width: "49.5rpx",
  height: "144rpx",
}

const normalIcon = {
  iconPath: "/images/locate-marker-double.png",
  width: "42rpx",
  height: "120rpx",
}

let mapContext

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mapLongitude: 116.46,
    mapLatitude: 39.92,
    mapMarkers: [
      {
        iconPath: "/images/locate-marker-double.png",
        width: "42rpx",
        height: "120rpx",
        longitude: 116.46,
        latitude: 39.92,
      },
    ],
    mapPoints: [],
    markerTap: false,  // 用来过滤markertap时连带触发的maptap

    travelPlanId: 0,
    travelPlanName: "旅行计划x",
    travelPlan: [],
    tmpTravelPlan: [
      {
        id: "1",
        name: "景点1",
        desc: "景点介绍1",
        address: {
          positon: '景点位置信息1',
          longitude: 116.46,
          latitude: 39.90,
        },
        time: new Date().getTime(),
      },
      {
        id: "2",
        name: "景点2",
        desc: "景点介绍2",
        address: {
          positon: '景点位置信息2',
          longitude: 116.36,
          latitude: 39.92,
        },
        time: new Date().getTime(),
      },
      {
        id: "3",
        name: "景点3",
        desc: "景点介绍3",
        address: {
          positon: '景点位置信息3',
          longitude: 116.50,
          latitude: 39.91,
        },
        time: new Date().getTime(),
      },
    ],

    stepActive: 0,
    steps: [
      {
        text: '步骤一',
        desc: '描述信息',
      },
      {
        text: '步骤二',
        desc: '描述信息',
      },
      {
        text: '步骤三',
        desc: '描述信息',
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const planId = options.planid // 获取出行计划id
    this.setData({
      travelPlanId: planId
    })

    mapContext = wx.createMapContext("map", this)

    // 请求该出行计划
    var url = utils.server_hostname + "/api/core/" + "plan/" + planId + "/"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "GET",
      data: {

      },
      header: {
        "token-auth": token
      },
      success: (res) => {
        console.log("get response plan:", res.data)
        if (res.statusCode !== 200) { // 获取失败
          this.setData({
            travelPlan: this.data.tmpTravelPlan
          })
        } else { // 获取成功
          this.setData({
            travelPlan: res.data.sights_detail,
            travelPlanName: res.data.name
          })
        }
        console.log("plan info:", this.data.travelPlan)
        // 处理获取到的出行计划信息
        this.data.travelPlan.forEach((item, index) => {
          // 添加steps
          var stepItem = {
            text: item.name,
            desc: utils.formatTime(new Date())
          }
          // 添加markers
          var markerItem = {
            id: index,
            iconPath: normalIcon.iconPath,
            width: normalIcon.width,
            height: normalIcon.height,
            longitude: item.address.longitude,
            latitude: item.address.latitude,
            customCallout: {
              anchorX: "50rpx",  // 单位是px
              anchorY: "300rpx",
              display: "BYCLICK",
              content: "test",
            },
            /* 自定义自用字段 */
            name: item.name,
            desc: item.desc,
            active: false,  // 记录是否被点击激活
          }
          // 添加points
          var pointItem = {
            longitude: item.address.longitude,
            latitude: item.address.latitude,
          }
          console.log(stepItem)
          console.log(markerItem)
          this.setData({
            ["steps[" + index + "]"]: stepItem,
            ["mapMarkers[" + index + "]"]: markerItem,
            ["mapPoints[" + index + "]"]: pointItem,
          })
        })
        
        console.log(this.data.mapPoints)
        mapContext.includePoints({
          padding: [40, 40, 40, 40],
          points: this.data.mapPoints
        })
      },
      fail: (err) => {
        console.log(err)
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

  onClickStep(event) {
    this.setData({
      stepActive: event.detail
    })
    console.log("stepActive:", this.data.stepActive)

    // 激活相应marker
    this.handleMarkerActivate(this.data.stepActive)
  },

  onTapDelete() {
    var url = utils.server_hostname + "/api/core/" + "plan/" + this.data.travelPlanId + "/"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "DELETE",
      data: {
        
      },
      header: {
        "token-auth": token
      },
      success: (res) => {
        // wx.redirectTo({
        //   url: "/pages/travelPlanList/travelPlanList",
        // })
        wx.navigateBack({
          success: () => {
            let currPages = getCurrentPages();
            wx.redirectTo({
              url: "/" + currPages[currPages.length - 1].route,
            })
          }
        })
      },
      fail: (err) => {
        console.log("delete send error:", err)
      }
    })
  },

  onMapTap(event) {
    if (this.data.markerTap == true) {
      // 过滤markertap事件
      this.setData({
        markerTap: false
      })
      return
    }
    console.log("map tapped", event)
    this.deactivateAllMarkers()
  },

  onMarkerTap(event) {
    console.log("marker tapped", event)
    var markerIdx = event.detail.markerId

    // 先deactivate的marker
    this.deactivateAllMarkers() 
    
    // 再activate被点击的marker 
    this.activateMarker(markerIdx)

    // 定位到该marker
    mapContext.moveToLocation({
      longitude: this.data.mapMarkers[markerIdx].longitude,
      latitude: this.data.mapMarkers[markerIdx].latitude,
      success: (res) => {
        console.log("mapContext.moveToLocation success")
      }
    })
  },

  handleMarkerActivate(markerIdx) {
    // 先deactivate的marker
    this.deactivateAllMarkers() 
    
    // 再activate被点击的marker 
    this.activateMarker(markerIdx)

    // 定位到该marker
    mapContext.moveToLocation({
      longitude: this.data.mapMarkers[markerIdx].longitude,
      latitude: this.data.mapMarkers[markerIdx].latitude,
      success: (res) => {
        console.log("mapContext.moveToLocation success")
      }
    })
  },

  onCalloutTap(event) {
    console.log("callout tapped")
  },

  activateMarker(markerIdx) {
    var tarMarker = "mapMarkers[" + markerIdx + "]"
    this.setData({
      [tarMarker + ".iconPath"]: activeIcon.iconPath,
      [tarMarker + ".width"]: activeIcon.width,
      [tarMarker + ".height"]: activeIcon.height,
      [tarMarker + ".customCallout.display"]: "ALWAYS",
      [tarMarker + ".active"]: true,
      // 设置状态：以触发markertap
      markerTap: true,
    })
  },

  deactivateAllMarkers() {
    this.data.mapMarkers.forEach((item, index) => {
      if (item.active == true) {
        var tarMarker = "mapMarkers[" + index + "]"
        console.log("deactivate:", tarMarker)
        this.setData({
          [tarMarker + ".iconPath"]: normalIcon.iconPath,
          [tarMarker + ".width"]: normalIcon.width,
          [tarMarker + ".height"]: normalIcon.height,
          [tarMarker + ".customCallout.display"]: "BYCLICK",
          [tarMarker + ".active"]: false,
        })
      }
    })
  },

  onRelocateTap() {
    console.log("tap relocate")
    mapContext.includePoints({
      padding: [40, 40, 40, 40],
      points: this.data.mapPoints
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