// pages/myFlight/myFlight.js
const utils = require('../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        moreInfoShow: false,
        flight: [],
        moreInfoid: undefined,
        icon: [utils.server_imagename + '/flight/plane1.png',
            utils.server_imagename + '/flight/alarm.png',
            utils.server_imagename + '/flight/quit.png',
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var url = utils.server_hostname + "/api/core/usersflight/?page=1"
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
                console.log(res)
                var count = res.data.count;
                let tempFlight = that.data.flight
                for (var i in res.data.results) {
                    let lag = utils.timeLag((res.data.results[i].flight.depart_time.toString()+res.data.results[i].flight.arrival_time.toString()))
                    var flightitem = {
                        id: res.data.results[i].flight.id,
                        city: res.data.results[i].flight.city.name,
                        endcity: res.data.results[i].flight.endcity.name,
                        departureDate: utils.formatDate(res.data.results[i].flight.depart_time),
                        depatureTime: utils.formatHour(res.data.results[i].flight.depart_time),
                        arrivalTime: utils.formatHour(res.data.results[i].flight.arrival_time),
                        flightno: res.data.results[i].flight.flight_no,
                        costtime: utils.formatCost(res.data.results[i].flight.cost_time),
                        price: res.data.results[i].flight.economy_minprice,
                        discount: parseInt(res.data.results[i].flight.economy_discount * 100),
                        alarm: res.data.results[i].if_alarm,
                        timelag:((lag==0)?'':('+'+lag)),
                        status:res.data.results[i].flight.status
                    }
                    tempFlight.push(flightitem)
                    that.setData({
                        flight: tempFlight
                    })
                }

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
    changeAlarmState: function (e) {
        var url = utils.server_hostname + "/api/core/usersflight/alarm/"
        console.log('id', this.data.flight[e.currentTarget.dataset.idx].id)
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'POST',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            data: {
                flight: this.data.flight[e.currentTarget.dataset.idx].id,
                if_alarm: (this.data.flight[e.currentTarget.dataset.idx].alarm) ? '0' : '1'
            },
            success: function (data) {
                console.log('success', data);

                if (data.data.error_code == 605 || data.data.error_code == 400) {
                    utils.loginExpired()
                    return
                }
                // loginExpire
            },
            fail: function (res) {
                console.log(res);
            }

        })
        // console.log(e.currentTarget.dataset.idx)

        if (!this.data.flight[e.currentTarget.dataset.idx].alarm) {
            wx.showToast({
                title: '已设为提醒项',
            })
        } else {
            wx.showToast({
                title: '已取消提醒',
                icon: 'error'
            })
        }
        this.setData({
            ['flight[' + e.currentTarget.dataset.idx + '].alarm']: !this.data.flight[e.currentTarget.dataset.idx].alarm
        })

    },
    cancelAttention: function (e) {
        var that = this
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.showModal({
            cancelColor: 'cancelColor',
            content: '是否取消关注',
            method: 'POST',
           
            success(res) {
                if (res.confirm) {
                    var url = utils.server_hostname + "/api/core/usersflight/cancel_follow/"
                    var flightTemp = that.data.flight
                    var index = e.currentTarget.dataset.idx
                    console.log(that.data.flight[index].id)
                    wx.request({
                        url: url,
                        method: 'POST',
                        data: {
                            flight: that.data.flight[index].id,
                        },
                        header: {
                            'content-type': 'application/json',
                            'token-auth': token
                        },
                        success: function (res) {
                            console.log('success',res);
                            if (res.data.error_code == 605 || res.data.error_code == 400) {
                              utils.loginExpired()
                              return
                            }
                            flightTemp.splice(index, 1)
                            that.setData({
                                flight: flightTemp
                            })
                            // loginExpire
                        },
                        fail: function (res) {
                            console.log(res);
                        }

                    })
                    wx.showToast({
                        title: '已取消',
                    })
                }
            }
        })
    },
    moreInfoClick: function (e) {
        if (!this.data.moreInfoShow) {
            var index = e.currentTarget.dataset.idx
            if (index != undefined) {
                this.setData({
                    moreInfoid: this.data.flight[index].id,
                })
            }
        }
        this.setData({
            moreInfoShow: !this.data.moreInfoShow,
        })
    },
})