// pages/sceneSearch/sceneSearch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyList: [],
    myInput: "",
    preferenceList: [
      {"name": "量子之海", "position": "？？？"},
      {"name": "托尔巴纳", "position": "艾恩格朗特"},
      {"name": "来生","position": "沃森-歌舞伎区"},
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

  // 同步子组件input内容
  onSyncInput(event) {
    console.log("father page: syncInput")
    this.setData({
      myInput: event.detail.value
    })
  },

  // 同步子组件触发bindConfirm，将keyword加入历史记录
  onSyncConfirm(event) {
    console.log("father page: receive Confirm from")
    var refreshHistoryList = this.data.historyList
    var lastKeyword = event.detail.value
    for (var i = 0; i < refreshHistoryList.length; ++i) {
      if (refreshHistoryList[i] === lastKeyword) {
        refreshHistoryList.splice(i, 1)
        break
      }
    }
    refreshHistoryList.unshift(lastKeyword)
    this.setData({
      historyList: refreshHistoryList
    })
    console.log(refreshHistoryList)
  },
  
  /* 填入向子组件的keyword填入history值，并触发子组件的confirm事件 */
  confirmHistory(event) {  
    console.log(event)
    this.setData({
      myInput: event.currentTarget.dataset.name
    })
    var mySearchBar = this.selectComponent(".scene-search-bar")
    mySearchBar.getSearchList()
  },

  deleteHistory() {
    console.log("delete history")
    this.setData({
      historyList: []
    })
  },

  confirmPreference(event) {
    this.setData({
      myInput: event.currentTarget.dataset.name
    })
    var mySearchBar = this.selectComponent(".scene-search-bar")
    mySearchBar.getSearchList()
    mySearchBar.onConfirm()
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

})