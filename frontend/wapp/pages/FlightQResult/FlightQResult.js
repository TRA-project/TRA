// pages/FlightQResult/FlightQResult.js
const util = require('../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        curDate: util.getMonthDate(new Date()),
        dates: undefined,
        white: 2,
        index: 0,
        rise: true,
        sortRange: ['起飞时间', '经济舱价格', '公务舱价格', '经济舱折扣', '公务舱折扣', '预计耗时'],
        moreInfoShow: false,
        moreInfoid: undefined,
        moreInfoid2:undefined,
        flight: [],
        city: undefined,
        endcity: undefined,
        icon: [util.server_imagename + '/flight/plane1.png',
            util.server_imagename + '/flight/love.png',
            util.server_imagename + '/flight/sort.png',
            util.server_imagename + '/flight/transmit.png'
        ],
        transit: false,
        flightTransit: [],
        transitClick:false,
        deltaTime:undefined,
        totalTime:undefined,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let date = options.curDate.split(/-/)
        this.setData({
            dates: [{
                    date: util.getMonthDate(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() - 2 * 86400000)),
                    week: util.ChineseWeek(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() - 2 * 86400000)),
                },
                {
                    date: util.getMonthDate(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() - 1 * 86400000)),
                    week: util.ChineseWeek(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() - 1 * 86400000)),
                },
                {
                    date: util.getMonthDate(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() - 0 * 86400000)),
                    week: util.ChineseWeek(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() - 0 * 86400000)),
                },
                {
                    date: util.getMonthDate(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() + 1 * 86400000)),
                    week: util.ChineseWeek(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() + 1 * 86400000)),
                },
                {
                    date: util.getMonthDate(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() + 2 * 86400000)),
                    week: util.ChineseWeek(new Date(new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() + 2 * 86400000)),
                },
            ],
            curDate: date,
            city: options.city,
            endcity: options.endcity,
            transit: options.transit
        })
        var url = util.server_hostname + "/api/core/flight/"
        var that = this
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            data: {
                city: options.city,
                endcity: options.endcity,
                date: this.data.curDate[0] + '-' + parseInt(this.data.curDate[1]).toString() + '-' + parseInt(this.data.curDate[2]).toString()
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (res) {
                var count = res.data.count;
                let tempFlight = []
                for (var i in res.data.results) {
                    
                    let lag = util.timeLag((res.data.results[i].depart_time.toString()+res.data.results[i].arrival_time.toString()))
                    var flightitem = {
                        id: res.data.results[i].id,
                        city: res.data.results[i].city.name,
                        endcity: res.data.results[i].endcity.name,
                        departureDate: util.formatDate(res.data.results[i].depart_time),
                        depatureTime: util.formatHour(res.data.results[i].depart_time),
                        arrivalTime: util.formatHour(res.data.results[i].arrival_time),
                        flightno: res.data.results[i].flight_no,
                        costtime: util.formatCost(res.data.results[i].cost_time),
                        price: res.data.results[i].economy_minprice,
                        discount: parseInt(res.data.results[i].economy_discount * 100),
                        attention: res.data.results[i].if_follow,
                        timelag:((lag==0)?'':('+'+lag)),
                        status:res.data.results[i].status,
                    }
                    tempFlight.push(flightitem)
                }
                that.setData({
                    flight: tempFlight
                })
            },
        })

        // 获取换乘数据

        var url = util.server_hostname + "/api/core/flight/transfer/"
        var that = this
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            data: {
                city: options.city,
                endcity: options.endcity,
                date: this.data.curDate[0] + '-' + parseInt(this.data.curDate[1]).toString() + '-' + parseInt(this.data.curDate[2]).toString()
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (res) {
                let tempFlight = []
                for (var i in res.data.results) {
                    let lag = util.timeLag((res.data.results[i].first_flight.depart_time.toString()+res.data.results[i].second_flight.arrival_time.toString()))
                    var flightitem = {
                        first: {
                            id: res.data.results[i].first_flight.id,
                            city: res.data.results[i].first_flight.city.name,
                            endcity: res.data.results[i].first_flight.endcity.name,
                            departureDate: util.formatDate(res.data.results[i].first_flight.depart_time),
                            depatureTime: util.formatHour(res.data.results[i].first_flight.depart_time),
                            arrivalTime: util.formatHour(res.data.results[i].first_flight.arrival_time),
                            flightno: res.data.results[i].first_flight.flight_no,
                            costtime: util.formatCost(res.data.results[i].first_flight.cost_time),
                            price: res.data.results[i].first_flight.economy_minprice,
                            discount: parseInt(res.data.results[i].first_flight.economy_discount * 100),
                            attention: res.data.results[i].first_flight.if_follow
                        },
                        second: {
                            id: res.data.results[i].second_flight.id,
                            city: res.data.results[i].second_flight.city.name,
                            endcity: res.data.results[i].second_flight.endcity.name,
                            departureDate: util.formatDate(res.data.results[i].second_flight.depart_time),
                            depatureTime: util.formatHour(res.data.results[i].second_flight.depart_time),
                            arrivalTime: util.formatHour(res.data.results[i].second_flight.arrival_time),
                            flightno: res.data.results[i].second_flight.flight_no,
                            costtime: util.formatCost(res.data.results[i].second_flight.cost_time),
                            price: res.data.results[i].second_flight.economy_minprice,
                            discount: parseInt(res.data.results[i].second_flight.economy_discount * 100),
                            attention: res.data.results[i].second_flight.if_follow
                        },
                        totalTime: util.formatCost(res.data.results[i].total_cost_time),
                        totalPrice: res.data.results[i].total_price,
                        deltaTime: util.formatCost(res.data.results[i].delta_time),
                        transitCity: res.data.results[i].trans_city,
                        timelag:((lag==0)?'':('+'+lag))

                    }
                    tempFlight.push(flightitem)
                }
                that.setData({
                    flightTransit: tempFlight
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
    highlight: function (e) {
        const {
            num
        } = e.currentTarget.dataset
        if (num == this.data.white) {
            return
        }
        var date = new Date(new Date(
                this.data.curDate[0], parseInt(this.data.curDate[1]) - 1, this.data.curDate[2]).getTime() +
            (num - this.data.white) * 86400000)
        this.setData({
            white: num,
            curDate: [date.getFullYear(), (date.getMonth() + 1).toString(), date.getDate()]
        })
        var url = util.server_hostname + "/api/core/flight/"
        var that = this
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            data: {
                city: that.data.city,
                endcity: that.data.endcity,
                date: that.data.curDate[0] + '-' + parseInt(that.data.curDate[1]).toString() + '-' + parseInt(that.data.curDate[2]).toString()
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (res) {
                var count = res.data.count;
                let tempFlight = []
                for (var i in res.data.results) {
                    let lag = util.timeLag((res.data.results[i].depart_time.toString()+res.data.results[i].arrival_time.toString()))
                    var flightitem = {
                        id: res.data.results[i].id,
                        city: res.data.results[i].city.name,
                        endcity: res.data.results[i].endcity.name,
                        departureDate: util.formatDate(res.data.results[i].depart_time),
                        depatureTime: util.formatHour(res.data.results[i].depart_time),
                        arrivalTime: util.formatHour(res.data.results[i].arrival_time),
                        flightno: res.data.results[i].flight_no,
                        costtime: util.formatCost(res.data.results[i].cost_time),
                        price: res.data.results[i].economy_minprice,
                        discount: parseInt(res.data.results[i].economy_discount * 100),
                        attention: res.data.results[i].if_follow,
                        timelag:((lag==0)?'':('+'+lag)),
                        status:res.data.results[i].status,
                    }
                    tempFlight.push(flightitem)
                }
                that.setData({
                    flight: tempFlight
                })
            },
        })
        var url = util.server_hostname + "/api/core/flight/transfer/"
        var that = this
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            data: {
                city: that.data.city,
                endcity: that.data.endcity,
                date: this.data.curDate[0] + '-' + parseInt(this.data.curDate[1]).toString() + '-' + parseInt(this.data.curDate[2]).toString()
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (res) {
                let tempFlight = []
                for (var i in res.data.results) {
                    let lag = util.timeLag((res.data.results[i].first_flight.depart_time.toString()+res.data.results[i].second_flight.arrival_time.toString()))
                    var flightitem = {
                        first: {
                            id: res.data.results[i].first_flight.id,
                            city: res.data.results[i].first_flight.city.name,
                            endcity: res.data.results[i].first_flight.endcity.name,
                            departureDate: util.formatDate(res.data.results[i].first_flight.depart_time),
                            depatureTime: util.formatHour(res.data.results[i].first_flight.depart_time),
                            arrivalTime: util.formatHour(res.data.results[i].first_flight.arrival_time),
                            flightno: res.data.results[i].first_flight.flight_no,
                            costtime: util.formatCost(res.data.results[i].first_flight.cost_time),
                            price: res.data.results[i].first_flight.economy_minprice,
                            discount: parseInt(res.data.results[i].first_flight.economy_discount * 100),
                            attention: res.data.results[i].first_flight.if_follow
                        },
                        second: {
                            id: res.data.results[i].second_flight.id,
                            city: res.data.results[i].second_flight.city.name,
                            endcity: res.data.results[i].second_flight.endcity.name,
                            departureDate: util.formatDate(res.data.results[i].second_flight.depart_time),
                            depatureTime: util.formatHour(res.data.results[i].second_flight.depart_time),
                            arrivalTime: util.formatHour(res.data.results[i].second_flight.arrival_time),
                            flightno: res.data.results[i].second_flight.flight_no,
                            costtime: util.formatCost(res.data.results[i].second_flight.cost_time),
                            price: res.data.results[i].second_flight.economy_minprice,
                            discount: parseInt(res.data.results[i].second_flight.economy_discount * 100),
                            attention: res.data.results[i].second_flight.if_follow
                        },
                        totalTime: util.formatCost(res.data.results[i].total_cost_time),
                        totalPrice: res.data.results[i].total_price,
                        deltaTime: util.formatCost(res.data.results[i].delta_time),
                        transitCity: res.data.results[i].trans_city,
                        timelag:((lag==0)?'':('+'+lag))

                    }
                    tempFlight.push(flightitem)
                }
                that.setData({
                    flightTransit: tempFlight
                })
            },
        })

    },
    isRise: function () {
        this.setData({
            rise: !this.data.rise
        })
        var url = util.server_hostname + "/api/core/flight/"
        var that = this
        var rise = this.data.rise
        var index = this.data.index
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            data: {
                city: that.data.city,
                endcity: that.data.endcity,
                date: that.data.curDate[0] + '-' + parseInt(that.data.curDate[1]).toString() + '-' + parseInt(that.data.curDate[2]).toString(),
                order: (rise) ? index * 2 : index * 2 + 1
            },
            success: function (res) {
                let tempFlight = []
                for (var i in res.data.results) {
                    let lag = util.timeLag((res.data.results[i].depart_time.toString()+res.data.results[i].arrival_time.toString()))
                    var flightitem = {
                        id: res.data.results[i].id,
                        city: res.data.results[i].city.name,
                        endcity: res.data.results[i].endcity.name,
                        departureDate: util.formatDate(res.data.results[i].depart_time),
                        depatureTime: util.formatHour(res.data.results[i].depart_time),
                        arrivalTime: util.formatHour(res.data.results[i].arrival_time),
                        flightno: res.data.results[i].flight_no,
                        costtime: util.formatCost(res.data.results[i].cost_time),
                        price: res.data.results[i].economy_minprice,
                        discount: parseInt(res.data.results[i].economy_discount * 100),
                        attention: res.data.results[i].if_follow,
                        timelag:((lag==0)?'':('+'+lag)),
                        status:res.data.results[i].status,
                    }
                    tempFlight.push(flightitem)
                }
                that.setData({
                    flight: tempFlight
                })
            },
        })
    },
    bindPickerChange: function (e) {
        if (e.detail.value == this.data.index) {
            return
        }
        this.setData({
            index: e.detail.value
        })
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        var url = util.server_hostname + "/api/core/flight/"
        var that = this
        var rise = this.data.rise
        var index = this.data.index
        wx.request({
            url: url,
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            data: {
                city: that.data.city,
                endcity: that.data.endcity,
                date: that.data.curDate[0] + '-' + parseInt(that.data.curDate[1]).toString() + '-' + parseInt(that.data.curDate[2]).toString(),
                order: (rise) ? index * 2 : index * 2 + 1
            },
            success: function (res) {
                let tempFlight = []
                for (var i in res.data.results) {
                    let lag = util.timeLag((res.data.results[i].depart_time.toString()+res.data.results[i].arrival_time.toString()))
                    var flightitem = {
                        id: res.data.results[i].id,
                        city: res.data.results[i].city.name,
                        endcity: res.data.results[i].endcity.name,
                        departureDate: util.formatDate(res.data.results[i].depart_time),
                        depatureTime: util.formatHour(res.data.results[i].depart_time),
                        arrivalTime: util.formatHour(res.data.results[i].arrival_time),
                        flightno: res.data.results[i].flight_no,
                        costtime: util.formatCost(res.data.results[i].cost_time),
                        price: res.data.results[i].economy_minprice,
                        discount: parseInt(res.data.results[i].economy_discount * 100),
                        attention: res.data.results[i].if_follow,
                        timelag:((lag==0)?'':('+'+lag)),
                        status:res.data.results[i].status,
                    }
                    tempFlight.push(flightitem)
                }
                that.setData({
                    flight: tempFlight
                })
            },
        })
    },
    moreInfoClick: function (e) {
        if (!this.data.moreInfoShow) {
            var index = e.currentTarget.dataset.idx
            var trans = e.currentTarget.dataset.trans
            if (index != undefined && trans=='false') {
                this.setData({
                    moreInfoid: this.data.flight[index].id,
                })
            }
            if(index !=undefined && trans=='true'){
                this.setData({
                    moreInfoid: this.data.flightTransit[index].first.id,
                    moreInfoid2:this.data.flightTransit[index].second.id,
                    totalTime:this.data.flightTransit[index].totalTime,
                    deltaTime:this.data.flightTransit[index].deltaTime
                })
            }
        }
        this.setData({
            moreInfoShow: !this.data.moreInfoShow,
            transitClick:trans,
        })

    },
    changeAttentionState: function (e) {
        var curAttention = this.data.flight[e.currentTarget.dataset.idx].attention
        var index = e.currentTarget.dataset.idx
        var url = (curAttention == 0) ? util.server_hostname + "/api/core/usersflight/" : util.server_hostname + "/api/core/usersflight/cancel_follow/"
        var that = this
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'POST',
            data: {
                flight: that.data.flight[index].id.toString(),
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (data) {
                if (data.data.error_code == 605 || data.data.error_code == 400) {
                    util.loginExpired()
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
            ['flight[' + index + '].attention']: !curAttention
        })

    },
    changeAttentionState1: function (e) {
        var curAttention = this.data.flightTransit[e.currentTarget.dataset.idx].first.attention
        var curA1=this.data.flightTransit[e.currentTarget.dataset.idx].second.attention
        if(curAttention && curA1){
            curAttention=true;
        }else{
            curAttention=false;
        }
        var index = e.currentTarget.dataset.idx
        var url = (curAttention == 0) ? util.server_hostname + "/api/core/usersflight/" : util.server_hostname + "/api/core/usersflight/cancel_follow/"
        var that = this
        var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
        wx.request({
            url: url,
            method: 'POST',
            data: {
                flight: that.data.flightTransit[index].first.id.toString(),
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (data) {
                if (data.data.error_code == 605 || data.data.error_code == 400) {
                    util.loginExpired()
                    return
                }
                // loginExpire
            },
            fail: function (res) {
                console.log(res);
            }

        })
        wx.request({
            url: url,
            method: 'POST',
            data: {
                flight: that.data.flightTransit[index].second.id.toString(),
            },
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function (data) {
                if (data.data.error_code == 605 || data.data.error_code == 400) {
                    util.loginExpired()
                    return
                }
                // loginExpire
            },
            fail: function (res) {
                console.log(res);
            }

        })
        

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
            ['flightTransit[' + index + '].first.attention']: !curAttention,
            ['flightTransit[' + index + '].second.attention']: !curAttention
        })

    },
})