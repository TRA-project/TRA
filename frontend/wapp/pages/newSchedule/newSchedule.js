//index.js
const utils = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateString: "",
    spot: [utils.getNowDateLine(new Date())],
    curDate: utils.getNowDateLine(new Date()),
    curSch: [],
    curSumBudget: 0,
    curSumConsumption: 0,
    update: false,
    icon: utils.server_imagename + '/flight/quit.png',
    release: 0,
  },
  dateChange(e) {
    //   console.log("选中日期变了,现在日期是", e.detail.dateString)
    this.setData({
      dateString: e.detail.dateString
    })
    var url = utils.server_hostname + "/api/core/scheduleitem/"
    var that = this
    var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
    // console.log(utils.noZeroDate(this.data.dateString))
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        'date': utils.noZeroDate(this.data.dateString),
      },
      success: function (res) {
        let tempSch = []
        if (res.data.count != 0) {
          for (var i in res.data.results) {
            var item = {
              id: res.data.results[i].id,
              start_time: utils.noSecond(res.data.results[i].start_time),
              end_time: utils.noSecond(res.data.results[i].end_time),
              position: res.data.results[i].position,
              content: res.data.results[i].content,
              budget: res.data.results[i].budget,
              real_consumption: res.data.results[i].real_consumption,
              if_alarm: res.data.results[i].if_alarm,
            }
            tempSch.push(item)
          }
        }
        that.setData({
          curSch: tempSch,
          curSumConsumption: res.data.sum_consumption,
          curSumBudget: res.data.sum_budget,
        })
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var url = utils.server_hostname + "/api/core/scheduleitem/"
    var that = this
    var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
    // console.log(utils.noZeroDate(this.data.dateString))
    this.setData({
      release: options.release
    })
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        'date': utils.noZeroDate(this.data.dateString),
      },
      success: function (res) {
        let tempSch = []
        if (res.data.count != 0) {
          for (var i in res.data.results) {
            var item = {
              id: res.data.results[i].id,
              start_time: utils.noSecond(res.data.results[i].start_time),
              end_time: utils.noSecond(res.data.results[i].end_time),
              position: res.data.results[i].position,
              content: res.data.results[i].content,
              budget: res.data.results[i].budget,
              real_consumption: res.data.results[i].real_consumption,
              if_alarm: res.data.results[i].if_alarm,
            }
            tempSch.push(item)
          }
        }
        that.setData({
          curSch: tempSch,
          curSumConsumption: res.data.sum_consumption,
          curSumBudget: res.data.sum_budget,
        })
      },
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
    var url = utils.server_hostname + "/api/core/scheduleitem/"
    var that = this
    var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
    // console.log(utils.noZeroDate(this.data.dateString))
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        'date': utils.noZeroDate(this.data.dateString),
      },
      success: function (res) {
        let tempSch = []
        if (res.data.count != 0) {
          for (var i in res.data.results) {
            var item = {
              id: res.data.results[i].id,
              start_time: utils.noSecond(res.data.results[i].start_time),
              end_time: utils.noSecond(res.data.results[i].end_time),
              position: res.data.results[i].position,
              content: res.data.results[i].content,
              budget: res.data.results[i].budget,
              real_consumption: res.data.results[i].real_consumption,
              if_alarm: res.data.results[i].if_alarm,
            }
            tempSch.push(item)
          }
        }
        that.setData({
          curSch: tempSch,
          curSumConsumption: res.data.sum_consumption,
          curSumBudget: res.data.sum_budget,
        })
      },
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

  },
  editSch: function (e) {
    this.setData({
      update: false
    })
    wx.navigateTo({
      url: '../newScheduleEdit/newScheduleEdit?date=' + this.data.dateString + '&id=' + e.currentTarget.dataset.idx,
    })
  },
  alarm: function (e) {
    var that = this
    var url = utils.server_hostname + "/api/core/scheduleitem/" + e.currentTarget.dataset.idx + '/'
    var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: 'PUT',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        if_alarm: (e.currentTarget.dataset.ala == 1) ? 0 : 1,
      },
      success(res) {
        that.setData({
          ['curSch[' + e.currentTarget.dataset.index + '].if_alarm']: (e.currentTarget.dataset.ala == 1) ? 0 : 1
        })
      },
      fail(res) {
        console.log('s', res)
      }
    })

  },
  newEditSch: function (e) {
    if(this.data.curSch.length>20){
      wx.showToast({
        title: '日程项最多为20',
        icon:'none'
      })
      return
    }
    this.setData({
      update: false
    })
    wx.navigateTo({
      url: '../newScheduleEdit/newScheduleEdit?date=' + this.data.dateString + '&id=' + e.currentTarget.dataset.idx,
    })
  },
  alarm: function (e) {
    var that = this
    var url = utils.server_hostname + "/api/core/scheduleitem/" + e.currentTarget.dataset.idx + '/'
    var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: 'PUT',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        if_alarm: (e.currentTarget.dataset.ala == 1) ? 0 : 1,
      },
      success(res) {
        that.setData({
          ['curSch[' + e.currentTarget.dataset.index + '].if_alarm']: (e.currentTarget.dataset.ala == 1) ? 0 : 1
        })
      },
      fail(res) {
        console.log('s', res)
      }
    })

  },
  more: function (e) {
    wx.navigateTo({
      url: '../newScheduleMore/newScheduleMore?date=' + this.data.dateString + '&id=' + e.currentTarget.dataset.idx,
    })
  },
  return2Release(e) {
    var that = this;
    if (this.data.release==2) {
      wx.showModal({
        editable: false,
        title: "是否确认选择日期",
        success(res) {
          if (res.confirm) {
            let pages = getCurrentPages(); //当前页面
            let prevPage = pages[pages.length - 2]; //上一页面
            console.log(pages)
            prevPage.setData({ //直接给上移页面赋值
              schdate: that.data.dateString,
            });
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    }else {
    wx.showModal({
      editable: true,
      title: "是否确认提交",
      content: "计划单",
      success(res) {
        if (res.confirm) {
          let pages = getCurrentPages(); //当前页面
          let prevPage = pages[pages.length - 2]; //上一页面
          prevPage.setData({ //直接给上移页面赋值
            schtitle: res.content,
            schdate: that.data.dateString,
          });

          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  }

  }
})