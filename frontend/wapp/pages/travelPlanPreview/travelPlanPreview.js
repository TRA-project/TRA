// pages/travelPlanPreview/travelPlanPreview.js
const utils = require("../../utils/util.js");

const keyMap = {
  "area": "地区",
  "city": "地区",
  "tag" : "预期体验",
  "cost": "预期开销",
  "timeStart": "开始时间",
  "timeEnd": "结束时间"
}

let mapContext

Page({

  /**
   * 页面的初始数据
   */
  data: {
    customArg: {},
    planName: "",
    titleLength: 0,
    titleFontSize: 36,
    titleBlurred: true,

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
    mapPoints: [],

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

    afterReselect: false,
    formerSceneryIdx: -1,
    formerSceneryId : 0,
    reselectSceneries: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 配置参数显示
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on("travelPlan", data => {
      console.log("eventChannel:", data)

      // 处理配置信息
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

      // 处理生成travel plan
      if (options.status === "false") {
        console.log("return travel plan:failed")
        this.setData({
          travelPlansList: this.data.tmpTravelPlansList
        })
      } else {
        console.log("return travel plan:success")
        this.setData({
          travelPlansList: data.data
        })
      }
      console.log("travelPlan:", this.data.travelPlansList)
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

        mapContext = wx.createMapContext("preview-map", this)
        this.upgradeMarkers()
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
    mapContext = wx.createMapContext("preview-map", this)
    if (this.data.afterReselect) {
      console.log("reselect sceneries:", this.data.reselectSceneries)
      // 去重
      let tarList = this.data.travelPlansList[this.data.plansActive]
      tarList.splice(this.data.formerSceneryIdx, 1)
      var dedupReselect = this.data.reselectSceneries.filter(item => {
        for (var i in tarList) {
          if (item.id === tarList[i].id) {
            return false
          }
        }
        return true
      })
      console.log("after dedup:", dedupReselect)
      for (var i in dedupReselect) {
        tarList.splice(this.data.formerSceneryIdx + i, 0, dedupReselect[i])
      }
      console.log(tarList)
      this.setData({
        ["travelPlansList[" + this.data.plansActive + "]"]: tarList
      })

      this.data.afterReselect = false
    }
  },

  onTitleInput(event) {
    console.log("title input:", event.detail.value)
    this.setData({
      titleLength: event.detail.value.length
    })
  },

  onTitleFocus() {
    this.setData({
      titleBlurred: false
    })
  },

  onTitleBlur() {
    this.setData({
      titleBlurred: true
    })
  },

  onTabChange(event) {
    wx.showToast({
      title: `切换到方案 ${event.detail.name + 1 }`,
      icon: 'none',
    });
    console.log(event.detail)
    // 更新plansActive
    this.setData({
      plansActive: event.detail.name
    })
    this.upgradeMarkers()
  },

  onStepClick(event) {
    this.setData({
      stepsActive: event.detail
    })
  },

  onConfirmPlan(event) {
    // 过滤计划名为空的行为
    if (this.data.planName == "") {
      wx.showToast({
        title: "请命名该计划,计划名不能为空",
        icon: "none",
      })
      return
    }
    // 生成formData
    var spotList = []
    var selectPlan = this.data.travelPlansList[this.data.plansActive]
    console.log("select no:", this.data.plansActive)
    console.log("select plan:", selectPlan)
    selectPlan.forEach((item) => {
      spotList.push(item.id)
    });
    console.log("confirm spot ids:", spotList)
    var formData = {
      name: this.data.planName,
      sights: spotList,
    }
    console.log("confirm formData:", formData)

    // 发送请求
    var url = utils.server_hostname + "/api/core/" + "plan/"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "POST",
      data: formData,
      header: {
        // 发送formdata格式
        "content-type": "application/x-www-form-urlencoded",
        "token-auth": token,
      },
      success: (res) => {
        console.log("create plan success")
        wx.navigateTo({
          url: "/pages/travelHotelRestaurant/travelHotelRestaurant?planid="+ res.data.id,
        })
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },

  upgradeMarkers() {
    console.log("update markers and points")

    // 利用travel plan添加markers和points
    this.data.travelPlansList[this.data.plansActive].forEach((item, index) => {
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
      this.setData({
        ["mapMarkers[" + index + "]"]: markerItem,
        ["mapPoints[" + index + "]"]: pointItem,
      })
    })

    mapContext.includePoints({
      padding: [40,],
      points: this.data.mapPoints
    })
  },

  onSyncTarListChange(event) {
    console.log("father page: receive new tarList")
    console.log(event)
    var tarPlanNo = event.detail.listNo
    // 同步travelPlan
    this.setData({
      ["travelPlansList[" + tarPlanNo + "]"]: event.detail.newList
    })
    // 同步Points
    this.upgradeMarkers()
    console.log("after sync, travelPlansList:", this.data.travelPlansList)
  },

  onSyncReselect(event) {
    console.log("father page: receive command reselect")
    console.log(event)
    
    // 记录被点击的景点 formerScenery 信息
    this.setData({
      formerSceneryId : event.detail.sceneId,
      formerSceneryIdx: event.detail.sceneIdx,
    })
    
    // 跳转复用sceneList
    var args = "?keyword=" + event.detail.sceneName + "&usage=reselect"
      wx.navigateTo({
        url: "/pages/sceneList/sceneList" + args,
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