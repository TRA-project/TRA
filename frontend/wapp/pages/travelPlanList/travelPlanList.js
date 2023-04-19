// pages/travelPlanList/travelPlanList.js
const utils = require("../../utils/util.js");

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
        preview: "this is the plan1 preview",
      },
      {
        id: 2,
        name: "travel plan 2", 
        preview: "this is the plan2 preview",
      },
      {
        id: 3,
        name: "travel plan 3", 
        preview: "this is the plan3 preview",
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var url = utils.server_hostname + "/api/core/" + "travelplans/"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "GET",
      data: {
        "token-auth": token
      },
      header: {

      },
      success: (res) => {
        if (res.statusCode !== 200) {
          this.setData({
            travelPlanList: this.data.tmpTravelPlanList
          })
        }
        console.log(this.data.travelPlanList)
      },
      fail: (res) => {
        console.log(res)
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