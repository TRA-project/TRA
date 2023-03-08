
const utils = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    locName: "地点(默认无地点)",
    startTime: "开始",
    endTime: "结束",
    id: -1,
    date: undefined,
    title: "标题",
    if_alarm: 1,
    budget: "",
    consumption: "",
    location: {
      latitude: -1,
      longitude: -1,
      name: "",
      address: {
        city: "",
        district: "",
        nation: "",
        province: "",
        street: "",
        street_number: ""
      }
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      date: options.date
    })
    if (options.id != -1) {
      var url = utils.server_hostname + "/api/core/scheduleitem/" + options.id
      var that = this
      var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: url,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        success: function (res) {
          console.log(res)
          that.setData({
            startTime: utils.noSecond(res.data.start_time),
            endTime: utils.noSecond(res.data.end_time),
            budget: res.data.budget,
            consumption: res.data.real_consumption,
            if_alarm: res.data.if_alarm,
            title: res.data.content,
            location: res.data.position,
          })
          console.log(res.data.position!=null)
          if(res.data.position!=null){
            console.log(that.data.location)
            that.setData({
                locName:that.data.location.name
            })
          }
        },
      })
    }
    console.log(location)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  edit:function(e){
      
      wx.redirectTo({
        url:'../newScheduleEdit/newScheduleEdit?date='+this.data.date+'&id='+this.data.id,
    })
  },
  tip:function(e){
      wx.showToast({
        title: '此处非编辑界面',
        icon:'none'
      })
  }
})