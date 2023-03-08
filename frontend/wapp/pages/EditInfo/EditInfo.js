// pages/EditInfo/EditInfo.js
const utils = require("../../utils/util.js");

Page({

    /**
     * Page initial data
     */
    data: {
        show:false,

        server_imagename: utils.server_imagename,

        icon:"",
        nickname:"",
        index:0,
        gender:["帅气小哥哥","漂亮小姐姐"],
        date: '2021-01-01',
        location:{
          latitude:-1,
          longitude:-1,
          name:"",
          address:{
            city:"",
            district:"",
            nation:"",
            province:"",
            street:"",
            street_number:""
          }
        },
        signature:"",
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
      var app = getApp()
      var show = app.globalData.show
      this.setData({
        show:true
      })
      console.log('this is onshow')
      var that = this
      var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
      var id = (wx.getStorageSync('id') == '')? 'noid' : wx.getStorageSync('id')
      wx.request({
        url: utils.server_hostname + "/api/core/users/" + id + "/",
        data: {
        },
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        success: function(data) {
          // console.log(data);
          if (data.data.error_code == 404) {
            utils.loginExpired()
            return
          }

          data = data.data
          
          var location = (data.position == null)? that.data.location : utils.positionTransform(data.position)
          that.setData({
            nickname: data.nickname,
            index: data.gender,
            signature: (data.sign == null)? "" : data.sign,
            date: (data.birthday == null)? "2021-01-01" : data.birthday,
            location: location,
            icon: (data.icon == null)? utils.server_imagename + "/male.png" 
            : utils.server_hostname + "/api/core/images/" + data.icon + "/data/"
          })
        },
        fail: function(res) { console.log(res); }
      })
    },

    // 监听并更新用户输入信息
    input: function(event) {
      var key = event.currentTarget.id
      var value = event.detail.value
      this.setData({[key]:value})
    },

    bindPickerChange: function(e) {
      // console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        index: e.detail.value
      })
    },

    bindDateChange: function(e) {
       console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        date: e.detail.value
      })
    },

    editDone: function(e) {
      if (this.data.nickname == "") {
        wx.showToast({
          title: "昵称不能为空",
          icon: 'error',
          duration: 1000
        })
        return
      }
      else if (this.data.nickname.length > 9) {
        wx.showToast({
          title: "昵称过长",
          icon: 'error',
          duration: 1000
        })
        return
      }

      var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
      var id = (wx.getStorageSync('id') == '')? 'noid' : wx.getStorageSync('id')

      wx.showLoading({
        title: '加载中'
      })

      wx.request({
        url: utils.server_hostname + "/api/core/users/",
        data: {
          nickname: this.data.nickname,
          gender: this.data.index,
          birthday: this.data.date,
          position: this.data.location,
          sign: this.data.signature
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

          wx.navigateBack({
            delta: 1,
          })
  
          wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1000
          })
        },
        fail: function(res) { console.log(res); },


      })
    },

    changeProtrait:function (){
      var that=this;
      var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
      

      wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
              // console.log(res)
              var src = res.tempFilePaths[0]
              wx.navigateTo({
                url: '/pages/Cropper/Cropper?src=' + src
              })

              return

              wx.uploadFile({
                  url: utils.server_hostname + "/api/core/users/icon/",

                  filePath: res.tempFilePaths[0], // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
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
                      if (data.error_code == 604) utils.loginExpired()

                      var icon_id = data.data.id
                      that.setData({
                        icon: (icon_id == null)? utils.server_imagename + "/male.png" 
                        : utils.server_hostname + "/api/core/images/" + icon_id + "/data/"
                      })
                  },
                  fail: function(res) { console.log(res) }
              })
          }
      })
    },

    getLoc:function (){
      var that = this;
      utils.authorize()
      wx.chooseLocation({
        success: function (res) {
          // console.log(res)

          var name = res.name
          var latitude = res.latitude
          var longitude = res.longitude

          var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" 
          + latitude + "," + longitude + "&key=" + utils.subkey;
          wx.request({        
            url: getAddressUrl,
            success: function (address) {   
              address = address.data.result   
              // console.log(address)

              that.setData({
                location: {
                  latitude: latitude,
                  longitude: longitude,
                  name: name,
                  address: address.address_component
                }
              })
              // console.log(that.data)
            },
            fail: function(res) { console.log(res) }
          })
        },
        fail: function(res) { console.log(res); }
      })
    }
})

