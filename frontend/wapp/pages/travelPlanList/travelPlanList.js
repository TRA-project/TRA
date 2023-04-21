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
        preview: "this is the plan1 preview",
      },
      {
        id: 2,
        name: "travel plan 2", 
        preview: "this is the plan2 preview",
      },
      {
        id: 3,
        name: "travel plan 3", 
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
    tagValue: "",

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    console.log(event)
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