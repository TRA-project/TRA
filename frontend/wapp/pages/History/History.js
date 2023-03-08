// pages/History/History.js

const utils = require("../../utils/util.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cities_num: 15,
        love_people: '暂无数据',
        love_city: '成都',
        travel_num: 12,
        images: {
            cities_num: utils.server_imagename + '/History/cities_num.jpg',
            love_city: utils.server_imagename + '/History/love_city.jpg',
            love_people: utils.server_imagename + '/History/love_people.jpg',
            travel_num: utils.server_imagename + '/History/travel_num.jpg',
        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('Load')
        this.gethistory()
    },

    gethistory() {
        var that = this

        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var id = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')

        wx.request({
            url: utils.server_hostname +  '/api/core/users/statistics/',
            data:{
            },
            method:'GET',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            success: function(res) {
                console.log('data1', res)
                var data = res.data.results
                var llcities_num = data[0].cities_num
                var lllove_people = data[1].love_people == null ? '暂无数据' : data[1].love_people
                var lllove_city = data[2].love_city == null ? '暂无数据' : data[2].love_city
                that.setData({
                    cities_num: llcities_num,
                    //love_people: lllove_people,
                    love_city: lllove_city,
                    travel_num: data[3].travel_num
                })
                wx.request({
                    url: utils.server_hostname + "/api/core/users/" + lllove_people + "/",
                    data:{
                    },
                    method: 'GET',
                    header: {
                      'content-type': 'application/json',
                      'token-auth': token
                    },
        
                    success:function (res) {
                        var data = res.data
                        
                        console.log('love people',res)
                        that.setData({
                            love_people: data.name
                        })
                    },
                    fail: function(res) { console.log(res); }
                })
            }
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
        console.log('show')
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