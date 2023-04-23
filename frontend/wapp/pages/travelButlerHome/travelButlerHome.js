// pages/travelButlerHome/travelButlerHome.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    titleOne: "个性联动 | 猜你想去",
    titleTwo: "智慧功能 | 便捷旅行",
    titleThree: "热点广场 | 高人气景点",
    description : [
      "景点搜索",
      "景点列表",
      "个性化路线定制"
    ],
    imageOneUrls: [
      '../../images/ai-function-icon.png',
      '../../images/ai-function-icon.png',
      '../../images/ai-function-icon.png'
    ],
    imageTwoUrls: [
      '../../images/ai-function-icon.png',
      '../../images/ai-function-icon.png',
      '../../images/ai-function-icon.png'
    ]
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
    wx.request({
      url: '',
      data: {

      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        console.log(res.data)
      }
    })
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

  navigateToNewPage: function() {
    wx.navigateTo({
      url: '/pages/travelButlerChat/travelButlerChat',
    })
  },

  navigateToSearch: function() {
    wx.navigateTo({
      url: '/pages/SearchResult/SearchResult',
    })
  }
})