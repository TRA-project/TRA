// pages/travelButler/travelButler.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showChatPopup: false,
    showMask: false,
    movableX: 500,
    movableY: 1000,
    msgList: [
      {
        nickname: '朝阳',
        avatarUrl: 'https://profile.csdnimg.cn/9/5/6/0_weixin_41192489',
        content: ' 你好！请问有什么可以帮助你的？',
      imgList: ['https://profile.csdnimg.cn/9/5/6/0_weixin_41192489']
      }
    ],

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      movableX: 500,
      movableY: 470
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

  },

  openChat: function() {
    this.setData({
      showChatPopup: true,
      showMask: true,
    })
    // wx.showModal({
    //   title: '提示',
    //   content: '这是一个弹窗',
    //   success: function(res) {
    //     if (res.confirm) {
    //       console.log('用户点击确定')
    //     } else if (res.cancel) {
    //       console.log('用户点击取消')
    //     }
    //   }
    // })
  },

  closeChat: function() {
    this.setData({
      showChatPopup: false,
      showMask: false,
    })
  },

  startRecord: function() {
    wx.getRecorderManager({
      success: function(res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        // 将录音文件上传到服务器等其他操作
      },
      fail: function(res) {
        console.log(res);
      }
    });
  }
})