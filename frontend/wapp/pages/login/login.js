// pages/login/login.js
const utils = require("../../utils/util.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_imagename,

    
    name:"",              // 当前输入的用户名
    password:"",          // 当前输入的密码
    focus:"",             // 当前聚焦的输入框
    unvisible:true,       // 密码可见状态
    visible_img:"",       // 密码可见状态对应的按钮图片
    disabled:true,        // 登录按钮的有效状态
    login_btt:"none",     // 登录按钮样式
    wechat_btt:"none",    // 微信登陆按钮样式
    regist_btt:"none"     // 用户注册按钮样式
  },

  // 输入框聚焦时显示输入功能按钮
  focus: function(event) {
    var id = event.currentTarget.id
    var visible_img = (id == "password")? utils.server_imagename + "/unvisible.png" : ""
    this.setData({focus:id, unvisible:true, visible_img:visible_img})
  },

  // 输入框失焦时隐藏输入功能按钮
  blur: function(event) {
    this.setData({focus:"",unvisible:true,visible_img:""})
  },

  // 点击密码可见按钮后切换密码可见状态
  visibleTap: function(event) {
    if (this.data.focus == "password") {
      if (this.data.unvisible) this.setData({unvisible:false,visible_img: utils.server_imagename + "/visible.png"})
      else this.setData({unvisible:true,visible_img: utils.server_imagename + "/unvisible.png"})
    }
  },

  // 监听并更新更新用户输入信息
  input: function(event) {
    var key = event.currentTarget.id
    var value = event.detail.value
    this.setData({[key]:value})

    // 信息填写完全后激活登录按钮
    var disabled = true
    if (this.data.name != "" && this.data.password != "") disabled = false
    this.setData({disabled:disabled})
  },

  // 按钮按下效果
  bttStart: function(event) {
    var key = event.currentTarget.id
    var value = "none"
    if (key == "login_btt") {
      if (this.data.disabled == false) value = "background-color:#236b8e"
    }
    else value = "opacity:0.5;text-decoration:underline"
    this.setData({[key]:value})
  },

  // 按钮释放效果
  bttEnd: function(event) {
    var id = event.currentTarget.id
    this.setData({[id]:"none"})
    
    // 释放用户注册按钮触发
    if (id == "regist_btt") {
      // 跳转到注册页
      wx.navigateTo({
        url: '/pages/regist/regist'
      })
    }

    // 点击微信登录按钮触发
    else if (id == "wechat_btt") {
      wx.showLoading({
        title: '请稍后',
      })

      wx.login({
        success: res => {
          // console.log(res.code)


          // 获取临时登录凭证code发送至服务器
          wx.request({
            url: utils.server_hostname + "/api/core/users/login/",
            data: {
            'js_code': res.code
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

              // 微信账号尚未注册
              if (data.data.error_code == 603) {
                wx.showToast({
                  title: "微信账号未注册",
                  icon: 'error',
                  duration: 2000
                })
                return
              }

              // 登录成功，跳转到个人页面（将用户登陆token存储在缓存中）
              wx.setStorageSync('token', data.data.data.token)
              wx.setStorageSync('id', data.data.data.id)
              wx.navigateBack({
                delta: 1
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
  },

  // 输入用户名和密码后，点击登录按钮触发
  accountLogin: function() {
    if (this.data.disabled == "") {
      wx.showLoading({
        title: '请稍后',
      })

      wx.request({
        url: utils.server_hostname + "/api/core/users/login/",
        data: {
        'name': this.data.name,
        'password': this.data.password,
        },
        method: 'POST',
        header: {
        'content-type': 'application/json',
        },

        success: function(data) {
          // console.log(data);
          wx.hideLoading({
            success: (res) => {},
          })
          
          // 用户名或密码错误
          if (data.data.error_code == 600) {
            wx.showToast({
              title: "用户名或密码错误",
              icon: 'none',
              duration: 2000
            })
            return
          }

          // 登录成功，跳转到个人页面（将用户登陆token存储在缓存中）
          wx.setStorageSync('token', data.data.data.token)
          wx.setStorageSync('id', data.data.data.id)
          /*wx.navigateBack({
            delta: 1
          })*/
          wx.redirectTo({
            url: '/pages/index/index',
          })
        },
        fail: function(err) {
          console.log(err);
          wx.showToast({
            title: '登录超时',
            icon:'none'
          })
        }
      })
    }
  }
})