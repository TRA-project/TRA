// pages/home/home.js
const utils = require("../../utils/util.js");

Page({
    data: {
      server_imagename: utils.server_imagename,
      isNavigate: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
      this.setData({
        opacity: 1,
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
      this.setData({
        opacity: 1,
      })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
      this.setData({
        opacity: 0,
      })
    },
  
    // 跳转到新页面
    navigateToFormerPage() {
      this.setData({
        isNavigate: true
      })
    },

    onTouchEnd(e) {
      if (this.data.isNavigate === false) return
      wx.navigateTo({
        url: '/pages/index/index',
      })
  
      // 原页面淡出
      this.setData({
        opacity: 0,
      })
  
      // 等待0.5秒，将原页面隐藏
      setTimeout(() => {
        this.setData({
          opacity: 0,
          hidden: true,
        })
      }, 500)
    },

    onSearchBarTap() {
      wx.navigateTo({
        url: '/pages/sceneSearch/sceneSearch',
      })
    },
    
    navigateToTravelPlan() {
      wx.navigateTo({
        url: '/pages/travelPlanList/travelPlanList'
      })
    },

    navigateToNewPage: function() {
      wx.navigateTo({
        url: '/pages/travelButlerChat/travelButlerChat',
      })
    }

})