// pages/Advertisement/Advertisement
const utils = require("../../utils/util.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ad_text:"",
        server_imagename: utils.server_imagename,

        img:[],
        content:"",
        url:"",
        hidden:false,
        debug:false
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      var id = options.id
      var that = this
      wx.getSystemInfo({
        success: function(result) {
          that.setData({
            debug:result.enableDebug
          })
        },
      })
      this.loadAd(id)
      this.rotate_animation = wx.createAnimation({
        duration:500,
      })

      this.translate_animation = wx.createAnimation({
        duration:500,
      })
      var height;
      wx.getSystemInfo({
        success: function(res){
          var wid = res.screenWidth;
          that.setData({
            wid:wid
          })
        }
      })
    },

    loadAd:function(id){
      var id = id
      var that = this
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: utils.server_hostname + '/api/core/ads/'+id,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        success: function(res) {
            // console.log(res)
            var data = res.data
            var img = that.data.img
            var cover = utils.server_hostname + "/api/core/images/" + data.cover.id + "/data/"
            img.push(cover)
            that.setData({
              content:data.content,
              img:img,
              url:data.url,
            })
        },
        fail: function(res) { console.log(res) }
      })
      
    },

    navigate2Web:function(){
      var debug = this.data.debug
      if(debug){
        var url = this.data.url
        wx.navigateTo({
          url: "/pages/Outweb/Outweb?url="+url
        })
      }else{
        wx.showModal({
          cancelColor: 'cancelColor',
          title:"是否打开调试模式?",
          content:"由于微信域名检查的问题，访问广告链接需要打开调试模式，点击下方确定按钮会自动打开调试模式并退出小程序，此时再重新进入小程序即可;若想关闭调试模式，请前往->我的->关于我们界面 ",
          success (res) {
            if (res.confirm) {
              wx.setEnableDebug({
                enableDebug: true,
              })
            }
          }
        })
      }
    },

    hideOrShow:function(){
      var that = this;
      var hid = that.data.hidden
      var height = that.data.wid*0.4 - 10
      if (hid == false){
        this.rotate_animation.rotate3d(1,0,0,180).step()
        this.translate_animation.translateY(height).step()
        this.setData({
          rotate_animation:this.rotate_animation.export
          (),
          translate_animation:this.translate_animation.export
          ()
        })
      }else{
        this.rotate_animation.rotate3d(0).step()
        this.translate_animation.translateY(0).step()
        this.setData({
          rotate_animation:this.rotate_animation.export
          (),
          translate_animation:this.translate_animation.export
          ()
        })
      }
      that.setData({
          hidden:~hid
      })
    }
  })