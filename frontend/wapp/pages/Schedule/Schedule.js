// pages/Schedule/Schedule.js
const { server_imagename } = require("../../utils/util.js");
const utils = require("../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show:false,

        server_hastname:utils.server_hostname,
        server_imagename:server_imagename,

        author: {
            id:"",
            nickname:"",
            icon:'',
            cities:"",
            travels:""
        },
        subscribed:false,

        schedule:{
            id:"",
            position:{
                city:"",
                name:""
            },
            title:"",
            content:"",
            start_time:"",
            end_time:"",
            budget:0,
            real_consumption:0,
            forbidden:0,
            if_alarm:0
        },
        isMine:false,
        real_consumption:-1,
        if_alarm:0
    },

    onSubmit:function() {
        var app = getApp()

        var show = app.globalData.show
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var id = (wx.getStorageSync('id') == '')?"noid" : wx.getStorageSync('id')

        var that = this
        var formatCheck = ""
        if (this.data.real_consumption == -1) formatCheck = "请输入实际支出"
        if (formatCheck != "") {
            wx.showToast({
              title: formatCheck,
              icon: 'error',
              duration:1000
            })
            return
        }

        wx.showLoading({
            title: '上传中',
        })

        wx.request({
          url: utils.server_hostname + '/api/core/schedule/' + that.data.schedule.id + '/',
          method:'PUT',
          header:{
            'content-type': 'application/json',
            'token-auth':token
          },
          data:{
            real_consumption:that.data.real_consumption,
          },

          success: function(data) {
            wx.hideLoading({
              success: (res) => {},
            })

            if (data.data.error_code == 605 || data.data.error_code == 400) {
              utils.loginExpired()
              return
            }

            wx.showToast({
              title: '发布成功',
              icon: 'success',
              duration:500
            })

            setTimeout(function () {
                var pages = getCurrentPages();
                var url = '/' + pages[pages.length - 2].route

                wx.navigateBack({
                  delta: 1,
                })
      
                if (url == "/pages/MyZone/MyZone") {
                  wx.redirectTo({
                    url: url,
                  })
                }
            },500)
        },
        fail:function(res) {console.log(res);}
        })
    },

    real_comsumptionInput:function(e) {
        this.setData({
            real_consumption:e.detail.value
        })
    },

    enableAlarm:function() {
        this.setData({
            if_alarm:1
        })
        var app = getApp()
        var show = app.globalData.show
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var that = this

        wx.showLoading({
            title: '上传中',
        })

        wx.request({
          url: utils.server_hostname + '/api/core/schedule/' + that.data.schedule.id + '/',
          method:'PUT',
          header:{
            'content-type': 'application/json',
            'token-auth':token
          },
          data:{
            if_alarm:that.data.if_alarm,
          },

          success: function(data) {
            wx.hideLoading({
              success: (res) => {},
            })

            if (data.data.error_code == 605 || data.data.error_code == 400) {
              utils.loginExpired()
              return
            }

            wx.showToast({
              title: '已开启通知',
              icon: 'success',
              duration:500
            })

            setTimeout(function () {
                var pages = getCurrentPages();
                var url = '/' + pages[pages.length - 2].route

                wx.navigateBack({
                  delta: 1,
                })
      
                if (url == "/pages/MyZone/MyZone") {
                  wx.redirectTo({
                    url: url,
                  })
                }
            },500)
        },
        fail:function(res) {console.log(res);}
        })
    },

    disableAlarm:function() {
        this.setData({
            if_alarm:0
        })

        var app = getApp()
        var show = app.globalData.show
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var that = this

        wx.showLoading({
            title: '上传中',
        })

        wx.request({
          url: utils.server_hostname + '/api/core/schedule/' + that.data.schedule.id + '/',
          method:'PUT',
          header:{
            'content-type': 'application/json',
            'token-auth':token
          },
          data:{
            if_alarm:that.data.if_alarm,
          },

          success: function(data) {
            wx.hideLoading({
              success: (res) => {},
            })

            if (data.data.error_code == 605 || data.data.error_code == 400) {
              utils.loginExpired()
              return
            }

            wx.showToast({
              title: '已取消通知',
              icon: 'success',
              duration:500
            })

            setTimeout(function () {
                var pages = getCurrentPages();
                var url = '/' + pages[pages.length - 2].route

                wx.navigateBack({
                  delta: 1,
                })
      
                if (url == "/pages/MyZone/MyZone") {
                  wx.redirectTo({
                    url: url,
                  })
                }
            },500)
        },
        fail:function(res) {console.log(res);}
        })
    },

    copy:function(options) {
        var app = getApp()

        var show = app.globalData.show
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var id = (wx.getStorageSync('id') == '')?"noid" : wx.getStorageSync('id')
        var that = this
        wx.request({
          url: utils.server_hostname + "/api/core/schedule/" + this.data.schedule.id + "/copy/",
          data:{

          },
          method:'GET',
          header:{
            'content-type':'application/json',
            'token-auth':token
          },
          success:function(res) {
            // console.log(res)
            var data = res.data
            that.setData({
              
            })
            wx.showToast({
                title: '复制成功',
                icon: 'success',
                duration:500
            })
          },
          fail: function(res) { console.log(err); }
        })


    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var app = getApp()
        var show = app.globalData.show
        this.setData({
            show:show
        })
        var that = this

        that.setData({
            author:{
                id:options.author_id,
                nickname:options.author_nickname,
                icon:options.author_icon,
                cities:options.author_cities,
                travels:options.author_travels
            }
        })

        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var id = (wx.getStorageSync('id') == '')?"noid" : wx.getStorageSync('id')

        wx.request({
          url:  utils.server_hostname + "/api/core/users/" + this.data.author.id + "/",
          data:{

          },
          method:'GET',
          header:{
              'content-type':'application/json',
              'token-auth':token
          },
          success:function(res) {
            // console.log(res)
            var data = res.data
            that.setData({
              
            })
          },
          fail: function(res) { console.log(err); }
        })

        wx.request({
          url: utils.server_hostname + '/api/core/schedule/' + options.schedule_id + '/',
          method:'GET',
          header:{
            'content-type': 'application/json',
            'token-auth': token
          },
          success:function(res) {


            var schedule = res.data

            that.setData({
                schedule:{
                    id:schedule.id,
                    position:(schedule.position == null)?that.data.position : schedule.position,
                    title: schedule.title,
                    content:schedule.content,
                    start_time:schedule.start_time.substring(0,10) + ' ' + schedule.start_time.substring(11,16),
                    end_time: schedule.end_time.substring(0,10) + ' ' + schedule.end_time.substring(11,16),
                    budget: schedule.budget,
                    real_consumption:schedule.real_consumption,
                    forbidden:schedule.forbidden,
                    if_alarm:schedule.if_alarm
                },
                isMine:(schedule.owner.id == id) ? true : false,
                if_alarm:schedule.if_alarm,
            })

            if (schedule.forbidden == 1) {
                that.setData({
                   
                })
                return
            }

            //
          },
          fail:function(res) {console.log(res) }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this
        that.setData({
            isMine:(that.data.author.id == parseInt(wx.getStorage('id')))
        })

        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        wx.request({
          url: utils.server_hostname + "/api/core/users/" + this.data.author.id + "/",
          data:{
          },
          method: 'GET',
          header: {
              'content-type':'application/json',
              'token-auth':token
          },
          success:function(res) {
              var data = res.data
              that.setData({

              })
          },
          fail:function(res) {console.log(err)}
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})