// pages/newScheduleEdit/newScheduleEdit.js
const utils = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    locName: "地点(默认无地点)",
    startTime: "开始",
    endTime: "结束",
    id: -1,
    date: undefined,
    title: "标题",
    if_alarm: 1,
    budget: "",
    consumption: "",
    location: {
      latitude: -1,
      longitude: -1,
      name: "",
      address: {
        city: "",
        district: "",
        nation: "",
        province: "",
        street: "",
        street_number: ""
      }
    },
    location1: undefined,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      date: options.date
    })
    if (options.id != -1) {
      var url = utils.server_hostname + "/api/core/scheduleitem/" + options.id
      var that = this
      var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: url,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        success: function (res) {
         
          that.setData({
            startTime: utils.noSecond(res.data.start_time),
            endTime: utils.noSecond(res.data.end_time),
            budget: res.data.budget,
            consumption: res.data.real_consumption,
            if_alarm: res.data.if_alarm,
            title: res.data.content,
            location: res.data.position,
          })
          if(that.data.location!=null){
            console.log(that.data.location)
            that.setData({
              locName:that.data.location.name
            })
          }
        },
      })
    }
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

  },
  setLoc: function () {
    var that = this;
    utils.authorize()
    wx.chooseLocation({
      success: function (res) {
        // console.log(res)

        var name = res.name
        var latitude = res.latitude
        var longitude = res.longitude
        var locAddress = res.address

        var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" +
          latitude + "," + longitude + "&key=" + utils.subkey;
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
              },
              locName: locAddress + ' · ' + name
            })
            // console.log(that.data)
          },
          fail: function (res) {
            console.log(res)
          }
        })
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },
  getTitle: function (e) {
    this.setData({
      title: e.detail.value
    })
  },
  getStart: function (e) {
    this.setData({
      startTime: e.detail.value
    })
    console.log(this.data.startTime)
  },
  getEnd: function (e) {
    this.setData({
      endTime: e.detail.value
    })
    console.log(this.data.endTime)
  },
  getBudget: function (e) {
    console.log(e.detail.value)
    console.log(isNaN(e.detail.value))
    if (!isNaN(e.detail.value)) {
      this.setData({
        budget: e.detail.value
      })
    } else {
      wx.showToast({
        title: '请输入数字',
        icon: 'error',
      })
      this.setData({
        budget: ""
      })
    }
  },
  getConsumption: function (e) {
    if (!isNaN(e.detail.value)) {
      this.setData({
        consumption: e.detail.value
      })
    } else {
      wx.showToast({
        title: '请输入数字',
        icon: 'error'
      })
      this.setData({
        consumption: ""
      })
    }
  },
  delete: function (e) {
    var that = this
    wx.showModal({
      title: "提示",
      content: "确认删除该日程事项？",
      cancelColor: 'cancelColor',
      success(res) {
        if (res.confirm && that.data.id != -1) {
          var url = utils.server_hostname + "/api/core/scheduleitem/" + that.data.id
          var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
          wx.request({
            url: url,
            method: 'DELETE',
            header: {
              'content-type': 'application/json',
              'token-auth': token
            },
            success: function (res) {
              console.log(res)
            },
          })
        }
        if (res.confirm) {
          // wx.redirectTo({
          //   url: '../newSchedule/newSchedule',
          // })
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面
          prevPage.setData({
            "upadate":true
          })
          wx.navigateBack({
            delta: 1,
          })
        }
      }
    })
  },
  alarm: function (e) {
    this.setData({
      if_alarm: (e.detail.value) ? 1 : 0
    })
  },
  save: function (e) {
    if (this.data.title == "" || this.data.title == "标题") {
      wx.showToast({
        title: '请输入标题',
        icon: 'none',
      })
    } else if (this.data.startTime == "开始") {
      wx.showToast({
        title: '请输入开始时间',
        icon: 'none',
      })
    } else if (this.data.endTime == "结束") {
      wx.showToast({
        title: '请输入结束时间',
        icon: 'none',
      })
    } else {
      var tempstart = this.data.startTime.split(/:/)
      var tempend = this.data.endTime.split(/:/)
      if (parseInt(tempend[0]) < parseInt(tempstart[0])) {
        wx.showToast({
          icon: 'none',
          title: '结束时间早于开始时间',
        })
      } else if (parseInt(tempend[0]) == parseInt(tempstart[0]) && parseInt(tempstart[1]) > parseInt(tempend[1])) {
        wx.showToast({
          icon: 'none',
          title: '结束时间早于开始时间',
        })
      } else {
        var that = this
        var url = utils.server_hostname + "/api/core/scheduleitem/" + this.data.id+'/'
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        if (this.data.id != -1) {
          console.log(that.data.date+" "+that.data.startTime + ":00")
          wx.request({
            url: url,
            method: 'PUT',
            header: {
              'content-type': 'application/json',
              'token-auth': token
            },
            data: {
              id: that.data.id,
              start_time: that.data.startTime + ":00",
              end_time: that.data.endTime + ":00",
              position: (that.data.locName == "地点(默认无地点)") ? null : that.data.location,
              content: that.data.title,
              if_alarm: that.data.if_alarm,
              budget: (that.data.budget == "") ? null : that.data.budget,
              real_consumption: (that.data.consumption == "") ? null : that.data.consumption,
            },
            success(res) {
              console.log(res)
            },
            fail(res) {
              console.log(res)
            }
          })

        } else {
          var url = utils.server_hostname + "/api/core/scheduleitem/"
          wx.request({
            url: url,
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'token-auth': token
            },
            data: {
              date: utils.noZeroDate(that.data.date),
              start_time: that.data.startTime + ":00",
              end_time: that.data.endTime + ":00",
              position: (that.data.locName == "地点(默认无地点)") ? null : that.data.location,
              content: that.data.title,
              if_alarm: that.data.if_alarm,
              budget: (that.data.budget == "") ? null : that.data.budget,
              real_consumption: (that.data.consumption == "") ? null : that.data.consumption,
            },
            success(res) {
              console.log(res)
            },
            fail(res) {
              console.log('s', res)
            }
          })
        }
        // wx.redirectTo({
        //   url: '../newSchedule/newSchedule',
        // })
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上一个页面
        prevPage.setData({
          "upadate":true
        })
        wx.navigateBack({
          delta: 1,
        })
      }
    }
  }
})