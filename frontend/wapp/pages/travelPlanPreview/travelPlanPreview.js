// pages/travelPlanPreview/travelPlanPreview.js
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
      }
    ],

    tabsActive: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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