// pages/travelPlanShow/travelPlanShow.js

const utils = require("../../utils/util")
const defaultData = require("./defaultData") 
const privacy = require("../../utils/privacy")
const QQMapWX = require("../../miniprogram_npm/qqmap-wx-jssdk1.2/qqmap-wx-jssdk")

var qqmapsdk = new QQMapWX({
  key: privacy.tencentMapAk
})

const activeIcon = defaultData.activeIcon
const normalIcon = defaultData.normalIcon

let mapContext

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mapLongitude: 116.46,
    mapLatitude: 39.92,
    mapMarkers: [],
    mapPoints: [],
    mapPolylines: defaultData.mapPolylines,
    markerTapped: false,  // 用来过滤markertap时连带触发的maptap

    travelPlanId: 0,
    travelPlanName: "旅行计划x",
    travelPlan: [],

    stepActive: 0,
    steps: defaultData.steps,
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
      header: {
        "token-auth": token
      },
      success: (res) => {
        console.log("GET /plan/" + planId + "/", res.data)
        if (res.statusCode !== 200) { // 获取失败
          this.setData({
            travelPlan: defaultData.travelPlan,
            mapMarkers: defaultData.mapMarkers,
          })
        } else { // 获取成功
          this.setData({
            travelPlan: res.data.plan_items,
            travelPlanName: res.data.name,
          })
        }
        console.log("plan_items:", this.data.travelPlan)

        // 处理获取到的出行计划信息
        var markerIdx = 0
        this.data.travelPlan.forEach((item, index) => {
          /* 添加steps */
          var stepItem = {
            idx: markerIdx,
            type: item.type,
            start_time: utils.formatTime(new Date(item.start_time)).slice(0, -3),
            end_time  : utils.formatTime(new Date(item.end_time)).slice(0, -3),

            sight_id: item.sight.id,
            title: item.sight.name,
            desc: item.sight.desc,
            address: item.sight.address.name,
          }
          this.data.steps[index] = stepItem
          
          if (item.type == 1) {
            /* 添加markers */
            var markerItem = {
              id: markerIdx++,  // id和mapMarkers的index一致
              iconPath: normalIcon.iconPath,
              width: normalIcon.width,
              height: normalIcon.height,
              // 坐标相关
              longitude: item.sight.address.longitude,
              latitude: item.sight.address.latitude,
              customCallout: {
                anchorX: 25,  // 单位是px
                anchorY: 150,
                display: "BYCLICK",
                content: "test",
              },
              // 自定义自用字段
              name: item.sight.name,
              desc: item.sight.desc.length > 24 ? item.sight.desc.slice(0, 23) + "..." : item.sight.desc,
              active: false,  // 记录是否被点击激活
              scene_id: item.sight.id,
              step_idx: index,
            }
            this.data.mapMarkers.push(markerItem)

            /* 添加points */
            var pointItem = {
              longitude: item.sight.address.longitude,
              latitude: item.sight.address.latitude,
            }
            this.data.mapPoints.push(pointItem)
          }
        })

        this.setData({
          mapMarkers: this.data.mapMarkers,
          mapPoints : this.data.mapPoints,
          steps: this.data.steps,
        })
        console.log("onload mapMarkers:", this.data.mapMarkers)

        // 添加polyline
        this.drawAllPolylines()
        console.log("onload mapPolyline:", this.data.mapPolylines)
        
        console.log("onload mapPoints", this.data.mapPoints)
        mapContext.includePoints({
          padding: [30,],
          points: this.data.mapPoints
        })
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },

  getPolyline(from, to) {
    var promise = new Promise((resolve, reject) => {
      console.log("GET: /ws/direction/v1/driving/ API one polyline")
      qqmapsdk.direction({
        mode: "driving",
        from: from,
        to: to,
        success: (res) => {
          console.log(res)
          var ret = res
          var coors = ret.result.routes[0].polyline
          var pl = []
          //坐标解压（返回的点串坐标，通过前向差分进行压缩）
          var kr = 1000000  
          for (var i = 2; i < coors.length; ++i) {
            coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
          }
          //将解压后的坐标放入点串数组pl中
          for (var i = 0; i < coors.length; i += 2) {
            pl.push({ latitude: coors[i], longitude: coors[i + 1] })
          }
          console.log(pl)
          resolve(pl)
        },
        fail: (err) => {
          console.log(err)
          reject("request route failed")
        }
      })
    })
    return promise
  },

  drawAllPolylines() {
    var promiseArr = []
    var lineNumbers = this.data.mapPoints.length - 1
    var points = this.data.mapPoints
    for (var i = 0; i < lineNumbers; ++i) {
      promiseArr.push(this.getPolyline(points[i], points[i+1]))
    }
    Promise.all(promiseArr).then(items => {
      console.log("Promise all:", items)
      var initPolylines = []
      items.forEach(item => {
        initPolylines.push({
          points: item,
          color: "#00FF00",
          width: 3,
          borderColor: "#228B22",
          borderWidth: 2,
        })
      })
      this.setData({
        mapPolylines: initPolylines
      })
    }).catch(err => {
      console.log("Promise error:", err)
      var initPolylines = [{
        points: this.data.mapPoints,
        color: "#00FF00", // green
        width: 3,
        borderColor: "#228B22",
        borderWidth: 2,
      }]
      this.setData({
        mapPolylines: initPolylines
      })
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
    var step = this.data.steps[event.detail]
    if (step.type === 1) {
      this.handleMarkerActivate(step.idx)
    } else {
      this.deactivateAllMarkers()
    }
    
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
        console.log("delete success")
        wx.navigateBack()
      },
      fail: (err) => {
        console.log("delete send error:", err)
      }
    })
  },

  onMapTap(event) {
    if (this.data.markerTapped == true) {
      // 过滤markertap事件
      this.setData({
        markerTapped: false
      })
      return
    }
    console.log("map tapped", event)
    this.deactivateAllMarkers()
  },

  onMarkerTap(event) {
    console.log("marker tapped", event)
    this.handleMarkerActivate(event.detail.markerId)
  },

  onCalloutTap(event) {
    console.log("callout tapped", event)
    var tarMarkerIdx = event.detail.markerId
    var tarSceneId = this.data.mapMarkers[tarMarkerIdx].scene_id
    wx.navigateTo({
      url: "/pages/sceneryShow/sceneryShow?scenery_id=" + tarSceneId,
    })
  },

  activateMarker(markerIdx) {
    console.log("activate: mapMarkers[" + markerIdx + "]")
    var tarMarker = "mapMarkers[" + markerIdx + "]" 
    this.setData({
      [tarMarker + ".iconPath"]: activeIcon.iconPath,
      [tarMarker + ".width"]: activeIcon.width,
      [tarMarker + ".height"]: activeIcon.height,
      [tarMarker + ".customCallout.display"]: "ALWAYS",
      [tarMarker + ".active"]: true,
      // 设置状态：以触发markertap
      markerTapped: true,
      // steps激活
      stepActive: this.data.mapMarkers[markerIdx].step_idx,
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
    this.deactivateAllMarkers()
    mapContext.includePoints({
      padding: [40, 40, 40, 40],
      points: this.data.mapPoints
    })
  },

  onTapNearbyHotel(event) {
    var sight_id = event.currentTarget.dataset.sightid
    console.log("tap nearby hotel:", sight_id)
    wx.navigateTo({
      url: "/pages/travelHotelRestaurant/travelHotelRestaurant?scenery_id=" + sight_id,
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