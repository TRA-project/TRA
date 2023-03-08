// pages/FeedBack/FeedBack.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_imagename,

    info:"",          // 反馈信息
    disabled:true     // 发送按钮的有效状态
  },

  // 监听并更新用户输入信息
  input: function(event) {
    var key = event.currentTarget.id
    var value = event.detail.value
    this.setData({[key]:value})

    // 信息填写完全后激活提交按钮
    var disabled = true
    if (this.data.info != "") disabled = false
    this.setData({disabled:disabled})
  },

  // 信息填写完毕后点击注册并登录按钮触发
  send: function(event) {
    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
    wx.showLoading({
      title: '请稍后',
    })

    wx.request({
      url: utils.server_hostname + "/api/core/adminmessages/",
      data: {
        content: this.data.info
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      success: function(data) {
        // console.log(data);
        wx.hideLoading({
          success: (res) => {},
        })
        
        if (data.statusCode == 403) {
          wx.showToast({
            title: '一天只能发送一次问题反馈',
            icon: 'none',
            duration: 1000
          })
          return
        }
        else {
          wx.showToast({
            title: '发送成功',
            icon: 'success',
            duration: 1000
          })
        }

        setTimeout(function () {
          wx.navigateBack({
            delta: 1,
          })
        }, 1000)
      },
      fail: function(res) { console.log(res); }
    })
  }
})