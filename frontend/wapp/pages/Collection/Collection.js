// pages/Collection/Collection.js

const utils = require("../../utils/util.js");


Page({

    /**
     * 页面的初始数据
     */
    data: {

        id:0,
        icon: '',
        nickname: '',
        cities: 0,
        travels: 0,
        img: '',

        list: [],
        col_manage: false,
        addcollection: false,
        collections: [],
        images:[
            utils.server_imagename + '/Collection/up.jpg',
            utils.server_imagename + '/Collection/down.jpg'
        ]

    },

    addCollection() {
      console.log('add new collection')
      var that = this
      wx.showModal({
          title: '新建游记合集',
          editable: true,
          placeholderText: '最长为8个字',
          success(res) {
            if (res.confirm) {
                console.log('用户点击确定')
                console.log(res.content)

                var co_title = res.content
                if (co_title == "") {
                    wx.showToast({
                      title: '请输入合集标题',
                      icon:'error',
                      duration: 2000
                    })
                    return
                } else if (co_title.length >= 8) {
                    wx.showToast({
                      title: '标题太长啦~',
                      icon:'error',
                      duration:2000
                    })
                    return
                }
                that.addrequest(co_title)
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
        })
    },

    addrequest: function(content) {
        var that = this
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

        wx.request({
            url: utils.server_hostname + '/api/core/travelcollection/',
            method: 'POST',
            header: {
                'content-type': 'application/json',
                'token-auth': token
            },
            data: {
                title: content
            },
            success: function(res) {
                console.log('success yes', res)
                if (res.statusCode == 400) {
                    wx.showToast({
                        title: '存在同名合集啦~',
                        icon: 'error',
                        duration: 2000
                    })
                } else {
                    wx.showToast({
                    title: '新建成功',
                    icon: 'success',
                    duration: 1000
                    })
                    that.onShow()
                }
            },
            fail: function (res) {
                console.log('fail', res)
            }
        })
    },

    getcollection: function () {
        console.log('get colletions')
        var that = this
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var thisid = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')

        wx.request({
            url: utils.server_hostname +  '/api/core/travelcollection/all/',
            data: {
        },
        method: 'GET',
        header: {
            'content-type': 'application/json',
            'token-auth': token
        },

        success: function (res) {
            console.log('stm ok', res.data.results)
            var data = res.data.results
            that.setData({
                collections: data,
            })
      },
      fail: function (res) {console.log('sth wrong', res)}
    })
    },

    update: function () {
        var that = this
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
        var id = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')

        wx.request({
            url: utils.server_hostname + "/api/core/users/" + id + "/",
            data: {
            },
            method: 'GET',
            header: {
            'content-type': 'application/json',
            'token-auth': token
            },
            success: function(res) {
                var data = res.data
                that.setData({
                    id: id,
                    icon: (data.icon == null)? utils.server_imagename + "/male.png" 
                    : utils.server_hostname + "/api/core/images/" + data.icon + "/data/",
                    nickname:data.nickname,
                    cities: data.cities,
                    travels: data.travels,
                    img: utils.server_imagename + "/travelRecordCover/1.jpg"
                })
            }
        })
    },


    manCollection() {
      wx.navigateTo({
        url: '/pages/Collection/subpages/col-manage',
      })
    },
    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.update()
    },

    kindToggle(e) {
        const id = e.currentTarget.id
        const list = this.data.collections
        for (let i = 0, len = list.length; i < len; ++i) {
          if (list[i].id == id) {
            list[i].open = !list[i].open
            console.log('find id', id)
            console.log(list[i].open)
          } else {
            console.log(id, list[i].id)
            list[i].open = false
          }
        }
        //console.log(e.currentTarget.id, list.length)
        this.setData({
          collections: list
        })
        //wx.reportAnalytics('click_view_programmatically', {})
    },

    findimage:function (e) {
        let pics = e.currentTarget.data.pics
        let img = ''
          if (pics != null) {
              img = utils.server_imagename + "/travelRecordCover/1.jpg"
          } else {
              img = utils.server_hostname + "/api/core/images/" + pics + "/data/"
          }
          return img
    },

    navigate2travel:function(e) {
          var data = this.data
          var travel_id = e.currentTarget.id
          utils.navigate2Travel(travel_id, data.id, data.icon, data.nickname, data.cities, data.travels)
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
        this.getcollection()
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