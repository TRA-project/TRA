// pages/sceneSearch/sceneSearch.js

const utils = require("../../utils/util")

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyList: [],
    myInput: "",
    preferenceList: [
      {"name": "量子之海", "desc": "？？？"},
      {"name": "托尔巴纳", "desc": "艾恩格朗特"},
      {"name": "来生","desc": "沃森-歌舞伎区"},
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从全局load历史记录 （权宜之计，应该向后端请求）
    this.setData({
      historyList: app.globalData.historyList
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
    var url = utils.server_hostname + "/api/core/sights/recommend/"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "GET",
      header: {
        "token-auth": token
      },
      success:(res) => {
        console.log("GET /sights/recommend:", res.data)
        var list = res.data.splice(0, 5)
        this.setData({
          preferenceList: list
        })
      },
      fail: err => {
        console.log("fail to request", err)
      }
    })
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

    /* 处理历史记录 */
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
    // 同步到全局
    app.globalData.historyList = this.data.historyList

    /* 处理confirm操作（应由父组件完成） */
    var myArgs = "?keyword=" + this.data.myInput + "&usage=search"
    wx.navigateTo({
      url: "/pages/sceneList/sceneList" + myArgs, 
    })
  },
  
  /* 填入向子组件的keyword填入history值，不触发confirm */
  confirmHistory(event) {  
    console.log(event)
    this.setData({
      myInput: event.currentTarget.dataset.name
    })
    var mySearchBar = this.selectComponent(".scene-search-bar")
    mySearchBar.getSuggestList()
  },

  deleteHistory() {
    console.log("delete history")
    this.setData({
      historyList: []
    })
    // 同步到全局
    app.globalData.historyList = this.data.historyList
  },

  /* 填入向子组件的keyword填入preference值，并触发confirm */
  confirmPreference(event) {
    this.setData({
      myInput: event.currentTarget.dataset.name
    })
    var mySearchBar = this.selectComponent(".scene-search-bar")
    mySearchBar.getSuggestList()
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