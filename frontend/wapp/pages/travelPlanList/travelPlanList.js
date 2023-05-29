// pages/travelPlanList/travelPlanList.js
const utils = require("../../utils/util.js");
const addressInfo = require("./addr_for_cascader")

const areaOptions = addressInfo.areaOptions

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

    // 预期体验
    expectValue: "",

    // 预期时间
    minHour: 0,
    maxHour: 24,
    minDate: new Date(new Date().setHours(0, 0, 0, 0)).getTime(), // 当天0点的时间戳
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
        console.log("plan receive: ", res.data)
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
        console.log(JSON.stringify(this.data.travelPlanList))

        // 调整preview内容
        this.data.travelPlanList.forEach((item, index) => {
          this.setData({
            ["travelPlanList[" + index + "].preview"]: item.sights_name.join("->")
          })
        })
        console.log(this.data.travelPlanList)
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  onTapListItem(event) {
    var planId = event.currentTarget.dataset.planid
    console.log("tap plan id:", planId)
    wx.navigateTo({
      url: "/pages/travelPlanShow/travelPlanShow?planid=" + planId,
    })
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

  onDateBeginPickerCancel() {
    this.setData({
      showDateBeginPicker: false
    })
  },

  onDateBeginPickerConfirm(event) {
    // 规整到0点
    var timeStamp = Math.round(event.detail / 8640000) * 8640000 
    var date = new Date(timeStamp)
    console.log("change start date begin:", timeStamp)
    console.log(utils.getNowDateLine(date))
    
    this.setData({
      showDateBeginPicker: false,
      dateBeginPickerValue: timeStamp,
      dateBeginFieldValue: utils.getNowDateLine(date)
    })
  },

  onDateEndPickerShow() {
    this.setData({
      showDateEndPicker: true
    })
  },

  onDateEndPickerCancel() {
    this.setData({
      showDateEndPicker: false
    })
  },

  onDateEndPickerConfirm(event) {
    var timeStamp = Math.round(event.detail / 8640000) * 8640000 
    var date = new Date(timeStamp)
    console.log("change end date begin:", event.detail)
    console.log(utils.getNowDateLine(date))
    
    this.setData({
      showDateEndPicker: false,
      dateEndPickerValue: timeStamp,
      dateEndFieldValue: utils.getNowDateLine(date)
    })
  },

  formSubmit(event) {
    var formData = {
      city: this.data.areaFieldValue.split('/')[1],
      tag: this.data.expectValue,
      start_time: this.data.dateBeginPickerValue,
      end_time: this.data.dateEndPickerValue,
    }
    console.log("")

    // 过滤空输入
    if (this.data.areaFieldValue === "") {
      wx.showToast({
        title: "目标地区不能为空",
        icon: "none",
      })
      return
    }

    // 过滤非法时间
    if (formData.start_time > formData.end_time) {
      wx.showToast({
        title: "结束时间不应早于开始",
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
          let errdata = res.data
          let msg = "发生错误，无法提交"
          if (errdata.error_code === 664) {
            msg = "设定时间已存在计划"
          }
          wx.showToast({
            title: msg,
            icon: "none"
          })

        } else {
          wx.navigateTo({
            url: "/pages/travelPlanPreview/travelPlanPreview?status=true",
            success: (navRes) => {
              console.log(navRes)
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
        wx.hideLoading()
        wx.showToast({
          title: "wx.request fail",
          icon: "error"
        })
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