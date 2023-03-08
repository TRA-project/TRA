import weCropper from '../../we-cropper/dist/weCropper.js'

const utils = require("../../utils/util.js");
const device = wx.getSystemInfoSync()
const width = device.windowWidth + 2
const height = device.windowHeight + 50
 
Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300 - 48 - 50) / 2,
        width: 300,
        height: 300
      }
    }
  },
 
  touchStart(e) {
    this.wecropper.touchStart(e)
  },
 
  touchMove(e) {
    this.wecropper.touchMove(e)
  },
 
  touchEnd(e) {
    this.wecropper.touchEnd(e)
  },
 
  getCropperImage() {
    this.wecropper.getCropperImage((avatar) => {
      if (avatar) {
        // 获取到裁剪后的图片
        var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
        wx.showLoading({
          title: '加载中'
        })

        wx.uploadFile({
          url: utils.server_hostname + "/api/core/users/icon/",

          filePath: avatar, // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          name: 'image',

          formData: { }, // HTTP 请求中其他额外的 form data
          header: {
              'token-auth': token
          },

          // statusCode != 200 会 fail
          success: function (res) {
              // console.log(res)
              wx.hideLoading({
                success: (res) => {},
              })

              if (res.statusCode == 413 || res.statusCode == 500) {
                wx.showToast({
                  title: "图片太大",
                  icon: 'none',
                  duration: 1000
                })
                return
              }

              var data = JSON.parse(res.data)
              if (data.error_code == 604) {
                utils.loginExpired()
                return
              }

              wx.navigateBack({
                delta: 1,
              })

              wx.showToast({
                title: "修改成功",
                icon: 'none',
                duration: 1000
              })
          },
          fail: function(res) { console.log(res) }
        })
      } else {
        wx.showToast({
          title: "获取图片失败，请稍后重试",
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
 
  uploadTap() {
    const self = this
 
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        let src = res.tempFilePaths[0]
        // 获取裁剪图片资源后，给data添加src属性及其值
        self.wecropper.pushOrign(src)
      }
    })
  },
 
  onLoad(option) {
    // do something
    const {
      cropperOpt
    } = this.data
    const {
      src
    } = option
 
    if (src) {
      Object.assign(cropperOpt, {
        src
      })
 
      new weCropper(cropperOpt)
        .on('ready', function(ctx) {})
        .on('beforeImageLoad', (ctx) => {
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 3000
          })
        })
        .on('imageLoad', (ctx) => {
          wx.hideToast()
        })
    }
  }
})