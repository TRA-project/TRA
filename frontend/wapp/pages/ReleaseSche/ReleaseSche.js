// pages/ReleaseSche/ReleaseSche.js
const utils = require("../../utils/util.js");

function Loc(name) {
    this.name = name;
}

var currentDateTime = new Date()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        show:true,

        title:"",
        startDate:"请选择开始日期",
        startTime:"请选择开始时间",
        endDate:"请选择结束日期",
        endTime:"请选择结束时间",
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
          locName:"请选择日程地点",
          content:"",
          budget:0,
          real_consumption:0,
          if_alarm:1,
          if_alarm_list:["不通知","通知"],
          access:1,
          access_list: ["公开","仅自己可见"]
    },

    onSubmit: function() {
        var that = this
        var formatCheck = ""
        if (this.data.title == "") formatCheck = "请输入标题"
        else if (this.data.startDate == "请选择开始日期") formatCheck = "请选择开始日期"
        else if (this.data.startTime == "请选择开始时间") formatCheck = "请选择开始时间"
        else if (this.data.endDate == "请选择结束日期") formatCheck = "请选择结束日期"
        else if (this.data.endTime == "请选择结束时间") formatCheck = "请选择结束时间"
        else if (this.data.location.latitude == -1) formatCheck = "请选择活动地点"
        else if (this.data.content == '') formatCheck = "请输入日程详情描述"
        else {
            var year = parseInt(currentDateTime.getFullYear())
            var month = parseInt(currentDateTime.getMonth())
            var day = parseInt(currentDateTime.getDate())
            var hour = parseInt(currentDateTime.getHours())
            var minute = parseInt(currentDateTime.getMinutes())

            var start_time = that.data.startDate + 'T' + that.data.startTime
            var end_time = that.data.endDate + 'T' + that.data.endTime

            if (end_time <= start_time) formatCheck = "结束早于开始"
        }
        
        if (formatCheck != "") {
            wx.showToast({
              title: formatCheck,
              icon: 'error',
              duration:1000
            })
            return
        }

        var that = this;
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        wx.showLoading({
            title: '上传中',
        })

        wx.request({
          url: utils.server_hostname + "/api/core/schedule/",
          method: 'POST',
          header: {
              'content-type': 'application/json',
              'token-auth':token
          },
          data: {
              start_time: that.data.startDate + 'T' + that.data.startTime,
              end_time: that.data.endDate + 'T' + that.data.endTime,
              title: that.data.title,
              content:that.data.content,
              budget: that.data.budget,
              position: that.data.location,
              real_consumption:that.data.real_consumption,
              visibility:that.data.access,
              if_alarm:that.data.if_alarm
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

    inputTitle: function(e) {
        // console.log("标题为" + e.detail.value)
        this.setData({
            title: e.detail.value
        })
    },

    startDateChange: function(e) {
        // console.log("开始日期修改为" + e.detail.value)
        this.setData({
            startDate: e.detail.value
        })
    },
    startTimeChange: function(e) {
        // console.log("开始时间修改为" + e.detail.value)
        this.setData({
            startTime:e.detail.value
        })
    },
    endDateChange: function(e) {
       // console.log("结束日期修改为" + e.detail.value)
        this.setData({
          endDate: e.detail.value
        })
    },
    endTimeChange: function(e) {
       // console.log("结束时间修改为" + e.detail.value)
      this.setData({
        endTime:e.detail.value
      })
    },

    setLoc: function() {
      var that = this;
      utils.authorize()
      wx.chooseLocation({
        success:function(res) {

          var name = res.name
          var latitude = res.latitude
          var longitude = res.longitude
          var locAddress = res.address

          var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" 
          + latitude + "," + longitude + "&key=" + utils.subkey;
          wx.request({
            url: getAddressUrl,
            success: function(address) {
              address = address.data.result
              //console.log(address)

              that.setData({
                location:{
                  latitude:latitude,
                  longitude:longitude,
                  name:name,
                  address:address.address_component
                },
                locName:locAddress + ' · ' + name
              })
              // console.log(that.data)
            },
            fail:function(res) {console.log(res)}
          })
        },
        fail:function(res) {console.log(res);}
      })
    },

    chooseVis:function(options) {
        var that = this
        wx.showActionSheet({
          itemList: ["公开","仅自己可见"],
          success(res) {
            // console.log(res.tapIndex)
            that.setData({
                access:res.tapIndex
            })
          }
        })
    },
    chooseAlarm:function(options) {
        var that = this
        wx.showActionSheet({
          itemList: ["不通知","通知"],
          success(res) {
              that.setData({
                  if_alarm:res.tapIndex
              })
          }
        })
    },

    budgetInput:function(e) {
        // console.log("预算为" + e.detail.value)
        this.setData({
            budget:e.detail.value
        })
    },
    real_comsumptionInput:function(e) {
        // console.log("实际消费为" + e.detail.value)
        this.setData({
            real_consumption:e.detail.value
        })
    },
    inputDetail:function(e) {
        // console.log("日程详情修改为" + e.detail.value)
        this.setData({
            content:e.detail.value
        })
    },

    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var app = getApp()
        var show = app.globalData.show
        this.setData({
            //show:show
            show:true
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