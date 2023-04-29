// pages/travelPlanShow/travelPlanShow.js

const utils = require("../../utils/util")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mapLongitude: 116.46,
    mapLatitude: 39.92,
    mapMarkers: [
      {
        iconPath: "/images/locate-marker.png",
        width: "40rpx",
        height: "60rpx",
        longitude: 116.46,
        latitude: 39.92,
      },
    ],
    mapPoints: [],

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
      {
        id: "4",
        name: "景点4",
        desc: "景点介绍4",
        address: {
          positon: '景点位置信息4',
          longitude: 116.46,
          latitude: 39.99,
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

    let mapContext = wx.createMapContext("map", this)

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
        // 处理获取到的出行计划信息
        this.data.travelPlan.forEach((item, index) => {
          // 添加steps
          var stepItem = {
            text: item.name,
            desc: utils.formatTime(new Date())
          }
          // 添加markers
          var markerItem = {
            iconPath: "/images/locate-marker.png",
            width: "40rpx",
            height: "60rpx",
            longitude: item.address.longitude,
            latitude: item.address.latitude,
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