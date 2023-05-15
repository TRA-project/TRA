// pages/travelHotelRestaurant/travelHotelRestaurant.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: "",
    longitude: "",
    hotels: [],
    restaurants: [],
    selected: [],
    numSelected: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },

  onSave() {
    wx.requestSubscribeMessage({
      tmplIds: [utils.plan_notification_id], // 向用户推送行程提醒消息
      success: () => {
        console.log("success")
      }, 
      fail: (res) => {
        console.log(`failed: ${res.errCode}, ${res.errMsg}`)
        console.log("template id:", utils.plan_notification_id)
      }
    })
    wx.reLaunch({
      url: "/pages/travelPlanList/travelPlanList",
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