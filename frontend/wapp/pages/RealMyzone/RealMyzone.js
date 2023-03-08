// pages/RealMyzone/RealMyzone.js

const utils = require("../../utils/util.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {

        id: 0,
        user_icon:'',
        username: '',
        images: {
            myzone: utils.server_imagename + '/RealMyzone/date.jpg',
            history: utils.server_imagename + '/RealMyzone/travel.jpg',
            likes: utils.server_imagename + '/RealMyzone/love.jpg',
            flight: utils.server_imagename + '/RealMyzone/plane1.jpg',
            collection: utils.server_imagename + '/RealMyzone/books.png',
            foot: utils.server_imagename + '/RealMyzone/list.jpg',
            settings: utils.server_imagename + '/RealMyzone/setting.jpg'
        },
        nickname: '',
        cities: 0,
        travels: 0


    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
        var that = this
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var id = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')

        wx.request({
          url: utils.server_hostname + "/api/core/users/" + id + "/",
          data:{
          },
          method: 'GET',
          header: {
            'content-type': 'application/json',
            'token-auth': token
          },

          success: function(res) {
              console.log(res)
              var data = res.data
              that.setData({
                  id: id,
                  username: data.name,
                  nickname:data.nickname,
                  cities:data.cities,
                  travels:data.travels,
                  user_icon: (data.icon == null)? utils.server_imagename + "/male.png" 
                  : utils.server_hostname + "/api/core/images/" + data.icon + "/data/"
              })
          },
          fail: function(res) { console.log(res); }
        })
    },

    // 我的消息
    navigate2Notification: function() {
        wx.navigateTo({
          url: '/pages/Notification/Notification',
        })
    },

    // 个人主页
    navigate2MyZone: function() {
        wx.redirectTo({
            url: '/pages/MyZone/MyZone',
        })
    },

    // 旅行记录
    navigate2History: function() {
        wx.navigateTo({
          url: '/pages/History/History',
        })
    },

    // 点赞喜欢
    navigate2Likes: function() {
        wx.navigateTo({
          url: '/pages/Likes/Likes',
        })
    },

    // 游记合集
    navigate2Collection: function(){
      wx.navigateTo({
        url: '/pages/Collection/Collection',
      })
    },

    // 关注航班
    navigate2Flight: function() {
        wx.navigateTo({
          url: '/pages/myFlight/myFlight',
        })
    },

    // 我的足迹
    navigate2footprint: function() {
        utils.navigate2footprint(this.data.id, this.data.nickname, 
            this.data.user_icon, this.data.cities, this.data.travels)
    },

    // 我的设置
    navigate2settings: function () {
        wx.navigateTo({
          url: '/pages/Settings/Settings',
        })
    },

    preview:function (event) {
        wx.previewImage({
            current: event.currentTarget.id,
            urls: [event.currentTarget.id]
        })
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

    }
})