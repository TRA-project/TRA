Page({
    onLoad() {
      this.setData({
        opacity: 1,
      })
    },
  
    onHide() {
      this.setData({
        opacity: 0,
      })
    },
  
    onShow() {
      this.setData({
        opacity: 1,
      })
    },
  
    // 跳转到新页面
    navigateToNewPage() {
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
})