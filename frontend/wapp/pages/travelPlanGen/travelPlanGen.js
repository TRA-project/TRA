// pages/travelPlanGen/travelPlanGen.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    testList: [
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

  },

  navigateToPreview() {
    wx.navigateTo({
      url: "/pages/travelPlanPreview/travelPlanPreview",
    })
  }
})