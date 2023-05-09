// pages/sceneryMap/sceneryMap.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    location: {
      longitude: 116.46,
      latitude: 39.92
    },
    mapMarkers: [
      {
        iconPath: "/images/locate-marker.png",
        width: "40rpx",
        height: "60rpx",
        longitude: 116.46,
        latitude: 39.92,
      }
    ],
    modeIndex: 0,
    setting: { // 使用setting配置，方便统一还原
			rotate: 0,
			skew: 0,
			enableRotate: true,
    },
    modes: ["驾车", "公交", "步行"]
  },

  onSelectMode(e) {
    console.log(e)
    this.setData({
      modeIndex: e.currentTarget.dataset.index
    })
  },

  onNavigate() {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    let lat = options.lat, lng = options.lng
    this.setData({
      "location.latitude": lat,
      "location.longitude": lng,
      "mapMarkers[0].latitude": lat,
      "mapMarkers[0].longitude": lng,
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