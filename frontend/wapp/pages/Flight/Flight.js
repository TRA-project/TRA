// pages/Flight/Flight.js
const utils = require('../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        date: utils.getNowDate(new Date()),
        left2right: true,
        city: '北京',
        endcity: '杭州',
        moreInfoShow: false,
        moreInfoid: undefined,
        citys: [],
        defaultcity: [],
        cheapflight: [],
        recommendflight:[],
        icon: [utils.server_imagename + '/flight/fire1.png',
            utils.server_imagename + '/flight/love.png',
            utils.server_imagename + '/flight/flightArrow.png',
            utils.server_imagename + '/flight/plane1.png',
            utils.server_imagename+'/flight/plane3.png',
            utils.server_imagename+'/flight/plane.png'
        ],
        transit:true,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        var url = utils.server_hostname + "/api/core/city/all/"
        wx.request({
            url: url,
            method: 'GET',
            success: function (res) {
                that.setData({
                    citys: res.data.results
                })
            }
        })
        wx.request({
            url: url,
            method: 'GET',
            data: {
                province: '北京'
            },
            success: function (res) {
                that.setData({
                    defaultcity: res.data.results
                })
            }
        })

        url = utils.server_hostname + "/api/core/flight/cheap_flight/"
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (res) {
                let tempFlight = []
                for (let i = 0; i < 3; i++) {
                    let lag = utils.timeLag((res.data.result[i].depart_time.toString()+res.data.result[i].arrival_time.toString()))
                    var flightitem = {
                        id: res.data.result[i].id,
                        city: res.data.result[i].city.name,
                        endcity: res.data.result[i].endcity.name,
                        departureDate: utils.formatDate(res.data.result[i].depart_time),
                        depatureTime: utils.formatHour(res.data.result[i].depart_time),
                        arrivalTime: utils.formatHour(res.data.result[i].arrival_time),
                        flightno: res.data.result[i].flight_no,
                        costtime: utils.formatCost(res.data.result[i].cost_time),
                        price: res.data.result[i].economy_minprice,
                        discount: parseInt(res.data.result[i].economy_discount * 100),
                        attention: res.data.result[i].if_follow,
                        timelag:((lag==0)?'':('+'+lag))
                    }
                    tempFlight.push(flightitem)
                }
                console.log(tempFlight)
                that.setData({
                    cheapflight: tempFlight
                })


            },
        })
        url = utils.server_hostname + "/api/core/flight/recommend_flight/"
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (res) {
                let tempFlight = []
                for (let i in res.data.result) {
                    let lag = utils.timeLag((res.data.result[i].depart_time.toString()+res.data.result[i].arrival_time.toString()))
                    var flightitem = {
                        id: res.data.result[i].id,
                        city: res.data.result[i].city.name,
                        endcity: res.data.result[i].endcity.name,
                        departureDate: utils.formatDate(res.data.result[i].depart_time),
                        depatureTime: utils.formatHour(res.data.result[i].depart_time),
                        arrivalTime: utils.formatHour(res.data.result[i].arrival_time),
                        flightno: res.data.result[i].flight_no,
                        costtime: utils.formatCost(res.data.result[i].cost_time),
                        price: res.data.result[i].economy_minprice,
                        discount: parseInt(res.data.result[i].economy_discount * 100),
                        attention: res.data.result[i].if_follow,
                        timelag:((lag==0)?'':('+'+lag))
                    }
                    tempFlight.push(flightitem)
                }
                that.setData({
                    recommendflight: tempFlight
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
        var that = this
        var url = utils.server_hostname + "/api/core/city/all/"
        wx.request({
            url: url,
            method: 'GET',
            success: function (res) {
                that.setData({
                    citys: res.data.results
                })
            }
        })
        wx.request({
            url: url,
            method: 'GET',
            data: {
                province: '北京'
            },
            success: function (res) {
                that.setData({
                    defaultcity: res.data.results
                })
            }
        })

        url = utils.server_hostname + "/api/core/flight/cheap_flight/"
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (res) {
                let tempFlight = []
                for (let i = 0; i < 3; i++) {
                    let lag = utils.timeLag((res.data.result[i].depart_time.toString()+res.data.result[i].arrival_time.toString()))
                    var flightitem = {
                        id: res.data.result[i].id,
                        city: res.data.result[i].city.name,
                        endcity: res.data.result[i].endcity.name,
                        departureDate: utils.formatDate(res.data.result[i].depart_time),
                        depatureTime: utils.formatHour(res.data.result[i].depart_time),
                        arrivalTime: utils.formatHour(res.data.result[i].arrival_time),
                        flightno: res.data.result[i].flight_no,
                        costtime: utils.formatCost(res.data.result[i].cost_time),
                        price: res.data.result[i].economy_minprice,
                        discount: parseInt(res.data.result[i].economy_discount * 100),
                        attention: res.data.result[i].if_follow,
                        timelag:((lag==0)?'':('+'+lag))
                    }
                    tempFlight.push(flightitem)
                }
             
                that.setData({
                    cheapflight: tempFlight
                })


            },
        })
        url = utils.server_hostname + "/api/core/flight/recommend_flight/"
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (res) {
                let tempFlight = []
                for (let i in res.data.result) {
                    let lag = utils.timeLag((res.data.result[i].depart_time.toString()+res.data.result[i].arrival_time.toString()))
                    var flightitem = {
                        id: res.data.result[i].id,
                        city: res.data.result[i].city.name,
                        endcity: res.data.result[i].endcity.name,
                        departureDate: utils.formatDate(res.data.result[i].depart_time),
                        depatureTime: utils.formatHour(res.data.result[i].depart_time),
                        arrivalTime: utils.formatHour(res.data.result[i].arrival_time),
                        flightno: res.data.result[i].flight_no,
                        costtime: utils.formatCost(res.data.result[i].cost_time),
                        price: res.data.result[i].economy_minprice,
                        discount: parseInt(res.data.result[i].economy_discount * 100),
                        attention: res.data.result[i].if_follow,
                        timelag:((lag==0)?'':('+'+lag))
                    }
                    tempFlight.push(flightitem)
                }
                that.setData({
                    recommendflight: tempFlight
                })
            },
        })

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.setData({
            cheapflight:[],
            recommendflight:[]
        })
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
    bindDateChange: function (e) {
        this.setData({
            date: e.detail.value,
        })
    },
    bindleftChange: function (e) {
        this.setData({
            city: e.detail,
        })
    },
    bindrightChange: function (e) {
        this.setData({
            endcity: e.detail,
        })
    },
    returnFlight: function () {
        var tempcity = this.data.city;
        var tempcity1 = this.data.endcity;
        this.setData({
            city: tempcity1,
            endcity: tempcity
        })

    },
    query: function () {
        if(this.data.city==this.data.endcity){
            wx.showToast({
              title: '出发地和目的地相同',
              icon:"error"
            })
            return
        }
        wx.navigateTo({
            url: '../FlightQResult/FlightQResult?' + 'curDate=' + this.data.date + '&city=' + this.data.city + '&endcity=' + this.data.endcity+'&transit='+this.data.transit,
        })
    },
    moreInfoClick: function (e) {
        if (!this.data.moreInfoShow) {
            var index = e.currentTarget.dataset.idx
            if (index != undefined) {
                this.setData({
                    moreInfoid: this.data.cheapflight[index].id,
                })
            }
        }
        console.log(this.data.moreInfoShow)
        this.setData({
            moreInfoShow: !this.data.moreInfoShow,
        })
    },
    moreInfoClick1: function (e) {
        if (!this.data.moreInfoShow) {
            var index = e.currentTarget.dataset.idx
            if (index != undefined) {
                this.setData({
                    moreInfoid: this.data.recommendflight[index].id,
                })
            }
        }
        console.log(this.data.moreInfoShow)
        this.setData({
            moreInfoShow: !this.data.moreInfoShow,
        })
    },
    changeAttentionState: function (e) {
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        var curAttention = this.data.cheapflight[e.currentTarget.dataset.idx].attention
        var target = this.data.cheapflight[e.currentTarget.dataset.idx]
        var index = e.currentTarget.dataset.idx
        var url = (curAttention == 0) ? utils.server_hostname + "/api/core/usersflight/" : utils.server_hostname + "/api/core/usersflight/cancel_follow/"
        var that = this
        console.log(that.data.cheapflight[index].id.toString())
        wx.request({
            url: url,
            method: 'POST',
            data: {
                flight: that.data.cheapflight[index].id.toString(),
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (data) {
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

        if (!curAttention) {
            wx.showToast({
                title: '已关注',
            })
        } else {
            wx.showToast({
                title: '已取消关注',
                icon: 'error'
            })
        }
        this.setData({
            ['cheapflight[' + index + '].attention']: !curAttention
        })

    },
    changerecommendAttentionState: function (e) {
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        var curAttention = this.data.recommendflight[e.currentTarget.dataset.idx].attention
        var index = e.currentTarget.dataset.idx
        var url = (curAttention == 0) ? utils.server_hostname + "/api/core/usersflight/" : utils.server_hostname + "/api/core/usersflight/cancel_follow/"
        var that = this
        wx.request({
            url: url,
            method: 'POST',
            data: {
                flight: that.data.recommendflight[index].id.toString(),
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (data) {
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

        if (!curAttention) {
            wx.showToast({
                title: '已关注',
            })
        } else {
            wx.showToast({
                title: '已取消关注',
                icon: 'error'
            })
        }
        this.setData({
            ['recommendflight[' + index + '].attention']: !curAttention
        })

    },
    transitChange:function(e){
        console.log(e)
        this.setData({
            transit:!this.data.transit,
        })
    }
})