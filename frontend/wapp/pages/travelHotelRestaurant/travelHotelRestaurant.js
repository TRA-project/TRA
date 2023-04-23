// pages/travelHotelRestaurant/travelHotelRestaurant.js
const util = require("../../utils/util.js");
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取到两地距离
    function GetDistance( lat1,  lng1,  lat2,  lng2){
      var radLat1 = lat1*Math.PI / 180.0;
      var radLat2 = lat2*Math.PI / 180.0;
      var a = radLat1 - radLat2;
      var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
      var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
      Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
      s = s *6378.137 ;// EARTH_RADIUS;
      s = Math.round(s * 10000) / 10000;
      return s;
    }
    
    // 使用示例
    const distance = GetDistance(39.923423, 116.368904, 39.922501, 116.387271);
    console.log(distance);
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
      url: "/pages/home/home",
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