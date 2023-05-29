// pages/Settings/Settings.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

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

    navigate2editpass() {
        wx.navigateTo({
          url: '/pages/EditPassword/EditPassword',
        })
    },

    navigate2feedback() {
        wx.navigateTo({
          url: '/pages/FeedBack/FeedBack',
        })
    },

    navigate2Edit () {
        wx.navigateTo({
            url: '/pages/EditInfo/EditInfo',//要跳转到的页面路径
        }); 
    },

    navigate2about() {
        wx.navigateTo({
          url: '/pages/AboutUs/AboutUs',
        })
    },

    navigate2logout() {
        wx.clearStorageSync()
        wx.reLaunch({
          url: '/pages/login/login',
        })
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