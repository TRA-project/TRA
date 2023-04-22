// pages/travelPlanList/travelPlanList.js
const utils = require("../../utils/util.js");

const areaOptions = [
  {
    text: '浙江省',
    value: '330000',
    children: [{ text: '杭州市', value: '330100' }],
  },
  {
    text: '江苏省',
    value: '320000',
    children: [{ text: '南京市', value: '320100' }],
  },
];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    travelPlanList: [],
    tmpTravelPlanList: [
      {
        id: 1,
        name: "travel plan 1",  // 需要增加总体name以标识具体计划
        sights: ["西山", "东山", "南山", "北山"],
        preview: "this is the plan1 preview",
      },
      {
        id: 2,
        name: "travel plan 2", 
        sights: ["f1", "f2", "f3", "is", "ex", "m1", "m2", "wb"],
        preview: "this is the plan2 preview",
      },
      {
        id: 3,
        name: "travel plan 3", 
        sights: ["提亚卡乌", " 姜齐城", "阿卡胡拉", "卡瓦莱利亚基", "小丘郡"],
        preview: "this is the plan3 preview",
      },
    ],

    // 整个Popup栏
    showPopup: false,

    // 地区选择
    areaOptions,
    areaFieldValue: "",
    showCascader: false,
    areaCascaderValue: "",

    // 标签类型
    tagsValue: "",

    // 预期开销
    costValue: 0,

    // 预期时间
    minHour: 0,
    maxHour: 24,
    minDate: new Date().getTime(),
    maxDate: new Date(2030, 10, 1).getTime(),

    dateBeginFieldValue: "",
    dateEndFieldValue: "",
    showDateBeginPicker: false,
    showDateEndPicker: false,
    dateBeginPickerValue: new Date().getTime(),
    dateEndPickerValue: new Date().getTime(),
    timeFormatter(type, value) {
      switch (type) {
        case "year":
          return `${value}年`
        case "month":
          return `${value}月`
        case "day":
          return `${value}日`
        case "hour":
          return `${value}时`
        case "minute":
          return `${value}分`
        default:
          return value
      }
    },

    showOverlay: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 请求travel plan 列表
    var url = utils.server_hostname + "/api/core/" + "plan/"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "GET",
      data: {},
      header: {
        "token-auth": token
      },
      success: (res) => {
        console.log("plan receive: ", res)
        // 获取内容填入travelPlanList(成功/失败)
        if (res.statusCode !== 200) {
          this.setData({
            travelPlanList: this.data.tmpTravelPlanList
          })
        } else {
          this.setData({
            travelPlanList: res.data
          })
        }
        console.log(this.data.travelPlanList)
        // 调整preview内容
        this.data.travelPlanList.forEach((item, index) => {
          this.setData({
            ["travelPlanList[" + index + "].preview"]: item.sights.join("->")
          })
        })
        console.log(this.data.travelPlanList)
      },
      fail: (res) => {
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

  // 添加新计划 Popup
  onPopupShow() {
    this.setData({
      showPopup: true
    })
  },

  onPopupClose() {
    this.setData({
      showPopup: false
    })
  },

  // 目标地区选择 Cascader
  onAreaFieldClick() {
    this.setData({
      showCascader: true
    })
  },

  onCascaderFinish(event) {
    const { selectedOptions, value } = event.detail;
    console.log(selectedOptions)
    const areaFieldValue = selectedOptions.map((option) => {
      return option.text || option.name
    }).join('/')
    this.setData({
      areaFieldValue,
      areaCascaderValue: value,
      showCascader: false
    })
  },

  // 时间区间选择 DatePicker
  onDateBeginPickerShow() {
    this.setData({
      showDateBeginPicker: true
    })
  },

  onDateBeginPickerConfirm(event) {
    var date = new Date(event.detail)
    console.log(utils.formatTime(date))
    
    this.setData({
      showDateBeginPicker: false,
      dateBeginPickerValue: event.detail,
      dateBeginFieldValue: utils.formatTime(date)
    })
  },

  onDateEndPickerShow() {
    this.setData({
      showDateEndPicker: true
    })
  },

  onDateEndPickerConfirm(event) {
    var date = new Date(event.detail)
    console.log(utils.formatTime(date))
    
    this.setData({
      showDateEndPicker: false,
      dateEndPickerValue: event.detail,
      dateEndFieldValue: utils.formatTime(date)
    })
  },

  formSubmit(event) {
    console.log(this.data.areaFieldValue)
    console.log(this.data.tagsValue)
    console.log(this.data.costValue)
    console.log(this.data.dateBeginPickerValue)
    console.log(this.data.dateEndPickerValue)
    var formData = {
      area: this.data.areaFieldValue,
      tag: this.data.tagsValue,
      cost: this.data.costValue,
      timeStart: this.data.dateBeginPickerValue,
      timeEnd: this.data.dateEndPickerValue,
    }

    // 过滤空输入
    if (this.data.areaFieldValue === "") {
      wx.showToast({
        title: "目标地区不能为空",
        icon: "none",
      })
      return
    }

    // 进入加载状态
    wx.showLoading({
      title: "加载中",
    })

    // 发送请求
    var url = utils.server_hostname + "/api/core/" + "plan/new/"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "GET",
      data: formData,
      header: {
        "token-auth": token
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode !== 200) {
          wx.showToast({
            title: "生成失败",
            icon: "error"
          })
          // 姑且先跳转过去
          wx.navigateTo({
            url: "/pages/travelPlanPreview/travelPlanPreview?status=false",
            success: (navRes) => {
              navRes.eventChannel.emit("travelPlan", {
                arg: formData,
              })
            }
          })
        } else {
          wx.navigateTo({
            url: "/pages/travelPlanPreview/travelPlanPreview?status=true",
            success: (navRes) => {
              // 传递配置参数arg、请求回来的travelPlan数据
              navRes.eventChannel.emit("travelPlan", {
                arg: formData,
                data: res.data
              })
            }
          })
        }
      },
      fail: (err) => {
        console.log("post new plan argument failed:", err)
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