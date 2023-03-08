// pages/Collection/subpages/col-manage.js

const utils = require("../../../utils/util.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        /*collections: [
            {
                id:'default',
                title:'默认合集',
            },
            {
                id: 'Summer',
                title: '夏季游玩',
            },
            {
                id: 'local',
                title: '本地游玩',
            },
            {
                id: 'family',
                title: '家庭游记',
            },

        ],*/
        collections:[
            {
            }
        ],
        arrays: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            slideButtons: [
                {
                    text: '管理'
                },
                {
                    text: '删除',
                }
            ]
        })
        //this.getcollection()
    },

    getcollection: function() {
    console.log('get colletions')
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

    wx.request({
      url: utils.server_hostname +  '/api/core/travelcollection/',
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },

      success: function (res) {
      console.log('stm ok', res)
      var data = res.data.results
      that.setData({
        collections: data
    })
      },
      fail: function (res) {console.log('sth wrong', res)}
    })
    },

    slideButtonTap(e) {
        console.log('slide button tap', e.detail)
    },

    confirmdelete(e) {
        console.log('want to delete')
        var that = this
        const id = e.currentTarget.id
        wx.showModal({
            title: '提示',
            content:'确认删除合集及其中所有游记？',
            success(res) {
                if (res.confirm) {
                    console.log('用户点击确定', id)

                    that.deleterequest(id)
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
            }
        })
    },

    deleterequest:function (col_id) {
        var that = this
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

        wx.request({
          url: utils.server_hostname +  '/api/core/travelcollection/' + col_id + '/',
          method: "DELETE",
          header: {
            'content-type': 'application/json',
            'token-auth': token
          },
          data: {},
          success:function(res) {
              console.log('delete ok', res)
              wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 1000
              })
              that.onShow()
          }
        })
    },

    confirmrename(e) {
        console.log('want to rename')
        var that = this
        const id = e.currentTarget.id
        const name = e.currentTarget.dataset.name
        wx.showModal({
            title: '重命名合集',
            editable: true,
            content: name,
            placeholderText: '合集重命名',
            success(res) {
                if (res.confirm) {
                    console.log('用户点击确定', id)
                    console.log(res.content)

                    var co_title = res.content
                    if (co_title == "") {
                        wx.showToast({
                          title: '合集标题不能为空哦~',
                          icon:'error',
                          duration: 2000
                        })
                        return
                    } else if (co_title.length >= 8) {
                        wx.showToast({
                            title: '标题太长啦~',
                            icon:'error',
                            duration: 2000
                          })
                          return
                    }
                    that.renamerequest(id, co_title)
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
            }
        })
    },

    renamerequest:function (col_id, content) {
        var that = this
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

        wx.request({
          url: utils.server_hostname +  '/api/core/travelcollection/' + col_id + '/',
          method: "PUT",
          header: {
            'content-type': 'application/json',
            'token-auth': token
          },
          data: {
            title: content
          },
          success:function (res) {
              console.log('reanme ok', res)
              wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 1000
              })
              that.onShow()
          }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.getcollection()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})