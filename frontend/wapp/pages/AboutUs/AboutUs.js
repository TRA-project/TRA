// pages/AboutUs/AboutUs.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageSize:0,
        show:false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var app = getApp()
        var show = app.globalData.show
        this.setData({
            show:show
        })
        var that = this
        wx.getSystemInfo({
          success: (res) => {
              console.log(res)
              that.setData({
                  pageSize:res.screenHeight
              })
          },
        })      
    },

    openDebug:function(){
        wx.setEnableDebug({
            enableDebug: true
          })
    },

    closeDebug:function(){
        wx.setEnableDebug({
            enableDebug: false
          })
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
    onShareAppMessage: function (res) {
        return {
          title: 'Tripal: About Us',
          path: "pages/AboutUs/AboutUs",
          imageUrl: 'https://tra-fr-2.zhouyc.cc/media/logo.png'
        }
      }
    
})