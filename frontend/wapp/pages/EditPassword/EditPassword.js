// pages/EditPassword/EditPassword.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_imagename,

    password_1:"",          // 当前输入的密码1
    password_2:"",          // 当前输入的密码2
    disabled:true           // 注册并登录按钮的有效状态
  },

  // 监听并更新用户输入信息
  input: function(event) {
    var key = event.currentTarget.id
    var value = event.detail.value
    this.setData({[key]:value})

    // 信息填写完全后激活提交按钮
    var disabled = true
    if (this.data.password_1 != "" && this.data.password_2 != "") disabled = false
    this.setData({disabled:disabled})
  },

  // 信息填写完毕后点击注册并登录按钮触发
  confirm: function(event) {

    // 用户名、密码格式检查
    var formatCheck = ""
    if (this.data.password_1 != this.data.password_2) formatCheck = "重输密码不一致"
    else if (this.data.password_1.length < 8) formatCheck = "密码长度太短"
    else if (!(/(^[0-9a-zA-Z!@#$%^&*_+-/]{8,16}$)/.test(this.data.password_1))) formatCheck = "密码非法"
    if (formatCheck != "") {
      wx.showToast({
        title: formatCheck,
        icon: 'error',
        duration: 2000
      })
      return
    }

    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')

    wx.showLoading({
      title: '请稍后',
    })
    wx.request({
      url: utils.server_hostname + "/api/core/users/",
      data: {
        password: this.data.password_1
      },
      method: 'PUT',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      success: function(data) {
        // console.log(data);
        wx.hideLoading({
          success: (res) => {},
        })

        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 1000
        })

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