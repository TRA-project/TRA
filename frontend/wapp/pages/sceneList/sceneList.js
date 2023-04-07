// pages/sceneList/sceneList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: "all",
    optionType: [
      { text: '全部类型', value: 0 },
      { text: '亲自出行', value: 1 },
      { text: '休闲部分', value: 2 },
    ],
    optionTime: [
      { text: '全部时长', value: 'a' },
      { text: '好评排序', value: 'b' },
      { text: '销量排序', value: 'c' },
    ],
    value1: 0,
    value2: 'a',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("get:", options.keyword)
    this.setData({
      keyword: options.keyword
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

  returnBackToSearch() {
    wx.navigateBack()
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