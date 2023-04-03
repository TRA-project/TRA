// pages/sceneSearch/sceneSearch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyList: ["ad", "南山", "北京"],
    myInput: "",
    preferenceList: [
      {"name": "量子之海", "position": "？？？"},
      {"name": "托尔巴纳", "position": "艾恩格朗特"},
      {"name": "来生","position": "沃森-歌舞伎区"},
    ]
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

  // 同步子组件input内容
  onSyncInput(event) {
    console.log("syncInput from father page")
    this.setData({
      myInput: event.detail.value
    })
  }
})