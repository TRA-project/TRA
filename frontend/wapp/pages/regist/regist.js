// pages/regist/regist.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_imagename,

    name:"",                // 当前输入的用户名
    nickname:"",            // 当前输入的昵称
    password_1:"",          // 当前输入的密码1
    password_2:"",          // 当前输入的密码2
    checked:false,          // 当前《服务协议》及《隐私政策》的同意选项
    disabled:true           // 注册并登录按钮的有效状态
  },

  // 监听并更新用户输入信息
  input: function(event) {
    var key = event.currentTarget.id
    var value = event.detail.value
    this.setData({[key]:value})

    // 信息填写完全后激活提交按钮
    var disabled = true
    if (this.data.name != "" && this.data.nickname != "" 
    && this.data.password_1 != "" && this.data.password_2 != "" && this.data.checked) disabled = false
    this.setData({disabled:disabled})
  },

  // 监听并更新《服务协议》及《隐私政策》同意选项
  check: function(event) {
    this.setData({checked:!this.data.checked})

    // 信息填写完全后激活提交按钮
    var disabled = true
    if (this.data.name != "" && this.data.nickname != "" 
    && this.data.password_1 != "" && this.data.password_2 != "" && this.data.checked) disabled = false
    this.setData({disabled:disabled})
  },

  // 链接至《服务协议》及《隐私政策》页面
  navigate2Contract: function(event) {
    wx.navigateTo({
      url: '/pages/contract/contract',
    })
  },

  // 信息填写完毕后点击注册并登录按钮触发
  regist: function(event) {
    // 用户名、密码格式检查
    var formatCheck = ""
    if (!(/(^[0-9a-zA-Z_]{1,16}$)/.test(this.data.name))) formatCheck = "用户名非法"
    else if (this.data.nickname.length == 0) formatCheck = "昵称不能为空"
    else if (this.data.nickname.length > 9) formatCheck = "昵称过长"
    else if (this.data.password_1 != this.data.password_2) formatCheck = "重输密码不一致"
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

    wx.showLoading({
      title: '请稍后',
    })
    
    // 向服务器发送注册信息
    wx.login({
      success: res => {
        // console.log(res.code)
        wx.request({
          url: utils.server_hostname + "/api/core/users/",
          data: {
          'js_code': res.code,
          'name': this.data.name,
          'password': this.data.password_1,
          'nickname': this.data.nickname
          },
          method: 'POST',
          header: {
          'content-type': 'application/json'
          },
          success: function(data) {
            // console.log(data);
            wx.hideLoading({
              success: (res) => {},
            })

            // 用户名已存在导致注册失败
            if (data.data.error_code == 601) {
              wx.showToast({
                title: "用户名已存在",
                icon: 'error',
                duration: 2000
              })
              return
            }
            // openid已存在导致注册失败
            else if (data.data.error_code == 603){
              wx.showToast({
                title: "微信账号已注册",
                icon: 'error',
                duration: 2000
              })
              return
            }

            // 注册成功，自动登录并跳转到个人页面（需携带渲染数据）
            wx.setStorageSync('token', data.data.token)
            wx.setStorageSync('id', data.data.id)
            wx.redirectTo({
              url: '/pages/MyZone/MyZone',
            })
          },
          fail: function(err) {
            console.log(err);
          }
        })
      },
      fail: function(err) {
        console.log(err);
      }
    })
  }
})