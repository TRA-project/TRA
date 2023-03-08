// pages/schRelease/schRelease.js
const utils = require("../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        schedule : {
            schid:null,
            type:"同行/游记",
            title:"计划单",
            items:null,
        },
        schdate:null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let option = options.option;
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
        let that = this;
        if (option == 1) {
            console.log('游记')
            let travelid = options.travelid;
            
            wx.request({
                url: utils.server_hostname + '/api/core/travels/' + travelid + '/',
                method: 'GET',
                header: {
                  'content-type': 'application/json',
                  'token-auth': token
                },
                success: function(res) {
                   console.log(res);
                   let items = res.data.schedule.schedule_items;
                   items.forEach(
                    function(item){
                        item.start_time = item.start_time.substring(0,5)
                        item.end_time = item.end_time.substring(0,5)
                    }
                )
                   let title = res.data.schedule.title;
                   let type = "游记";
                   let schid = res.data.schedule.id;
                   that.setData({
                       schedule:{
                           schid:schid,
                           items:items,
                           title:title,
                           type:type
                       }
                   })
                   console.log("schrelease schedule")
                   console.log(that.data.schedule)

                },
                fail: function(res) { console.log(res) }
              })

        }else if (option==2) {
            console.log('同行')
            let palid = options.palid;
            wx.request({
                url: utils.server_hostname + '/api/core/companions/' + palid + '/',
                method: 'GET',
                header: {
                  'content-type': 'application/json',
                  'token-auth': token
                },
                success: function(res) {
                   console.log(res);
                   let items = res.data.schedule.schedule_items;
                   items.forEach(
                       function(item){
                           item.start_time = item.start_time.substring(0,5)
                           item.end_time = item.end_time.substring(0,5)
                       }
                   )
                   let title = res.data.schedule.title;
                   let type = "同行";
                   let schid = res.data.schedule.id;
                   that.setData({
                       schedule:{
                           schid:schid,
                           items:items,
                           title:title,
                           type:type
                       }
                   })
                   console.log(that.data.schedule)

                },
                fail: function(res) { console.log(res) }
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

    }
})