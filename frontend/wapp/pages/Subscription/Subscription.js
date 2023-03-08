const utils = require("../../utils/util.js");

Page({

  data: {
      show_tab: 0, //顶部选项卡索引
      current_tab: 0,// tab切换
      show: false,
      tab: {
          tabnum: 2,
          tabitem: [
          {
              "id": 0,
              "text": "关注",
              "messagenum":0
          },    
          {
              "id": 1,
              "text": "粉丝",
              "messagenum":0
          }
          ]
        },
      subscriber_list : [],
      follower_list : [],
      subscribe_id_list:[],
      dissubscribe_id_list:[],
      next_subscriber: 'init',
      next_follower: 'init',
      swiper_height:[0,0]
  },

  open: function () {
      this.setData({
          show: true
      })
  },
  buttontap(e) {
      console.log(e.detail)
  },
  /**
   * Lifecycle function--Called when page load
   */
  
  onLoad: function (options) {
    this.disappear_animation = wx.createAnimation({
      duration:800,
    })

    var that = this
    that.setData({
      show_tab: options.tabindex
    })
    if (this.data.currentTab === options.tabindex) {
      return false;
    } else {
      that.setData({
        current_tab: options.tabindex
      })
    }
    
    this.getFollower()
    this.getSubscriber()
  },

  getSubscriber: function() {
    var that = this
    var url
    url = utils.server_hostname + '/api/core/users/subscription/'
    if(that.data.next_subscriber != "init"){
      url = that.data.next_subscriber
    }

    if(url == null) return

    //获取关注列表
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': wx.getStorageSync('token')
      },
      success: function(res) {
        // console.log(res)
        that.setData({
          next_subscriber: res.data.next
        })

        var list = res.data.results
        var subscriber_list = that.data.subscriber_list
        for (var i in list) {
          var item = list[i]
          // console.log(item)

          var subscriber = {
            id: item.id,
            protrait:(item.icon == null)? utils.server_imagename + "/male.png" : utils.server_hostname + "/api/core/images/" + item.icon + "/data/",
            nickname:item.nickname,
            subscribed: true
          }
          subscriber_list.push(subscriber)
          var swiper_height = that.data.swiper_height
          swiper_height[0] = subscriber_list.length * 200
          that.setData({
            subscriber_list: subscriber_list,
            swiper_height: swiper_height
          })

        }
      }

    })
  },

  getFollower: function() {
    var that = this
    var url
    url = utils.server_hostname + '/api/core/users/subscribers/'
    if(that.data.next_follower != "init"){
      url = that.data.next_follower
    }

    if(url == null) return

    //获取粉丝列表
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': wx.getStorageSync('token')
      },
      success: function(res) {        
        that.setData({
          next_follower: res.data.next
        })

        var list = res.data.results
        var follower_list = that.data.follower_list
        for(var i in list) {
          var item = list[i]

          var follower = {
            id: item.id,
            protrait: (item.icon == null)? utils.server_imagename + "/male.png" 
            : utils.server_hostname + "/api/core/images/" + item.icon + "/data/",
            nickname:item.nickname,
            subscribed: item.subscribed
          }
          follower_list.push(follower)

          var swiper_height = that.data.swiper_height
          swiper_height[1] = follower_list.length * 200
          that.setData({
            follower_list: follower_list,
            swiper_height: swiper_height
          })
        }
      }
    })
  },

  onUnload: function (options) {
    var that = this

    //将新关注的用户的id列表传向后端
    var data = {
      id: that.data.subscribe_id_list,
      cancel: false
    }
    wx.request({
      url: utils.server_hostname + '/api/core/users/subscribe/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': wx.getStorageSync('token')
      },
      data: data,
      fail: function(res) { console.log(res) }
    })

    //将取关列表传向后端
    var data = {
      id: that.data.dissubscribe_id_list,
      cancel: true
    }
    wx.request({
      url: utils.server_hostname + '/api/core/users/subscribe/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': wx.getStorageSync('token')
      },
      data: data,
      fail: function(res) { console.log(res) }
    })
  },
  
  setTab: function (e) {
    //点击当前tab也触发
    var that = this
    that.setData({
      show_tab: e.currentTarget.dataset.tabindex
    })
    if (this.data.currentTab === e.currentTarget.dataset.tabindex) {
      return false;
    } else {
      that.setData({
        current_tab: e.currentTarget.dataset.tabindex
      })
    }
  },

  bindChange: function (e) {
    //仅当切换tab时触发
    // console.log(e)
    var that = this;
    that.setData({ 
      current_tab: e.detail.current,
      show_tab: e.detail.current
    });
  },
   
  indexOf_subscriber: function(val) {
    var that = this
    var subscriber_list = that.data.subscriber_list

    for (var i in subscriber_list) {
      var item = subscriber_list[i]

      if (item.id == val) {
        return i
      }
    }
    return -1;
  },

  indexOf_follower: function(val) {
    var that = this
    var follower_list = that.data.follower_list

    for (var i in follower_list) {
      var item = follower_list[i]

      if (item.id == val) {
        return i
      }
    }
    return -1;
  },

  indexOf_subscribe: function(val) {
    var that = this
    var subscribe_id_list = that.data.subscribe_id_list

    for (var i = 0; i < subscribe_id_list.length; i++) {
      if (subscribe_id_list[i] == val) return i;
    }
    return -1;
  },

  indexOf_dissubscribe: function(val) {
    var that = this

    var dissubscribe_id_list = that.data.dissubscribe_id_list
    for (var i = 0; i < dissubscribe_id_list.length; i++) {
      if (dissubscribe_id_list[i] == val) return i;
    }
    return -1;
  },

  remove_from_subscribe: function(val) {
    var that = this
    var subscribe_id_list = that.data.subscribe_id_list
    var index = subscribe_id_list.indexOf(val);
    if (index > -1) {
      subscribe_id_list.splice(index, 1);
    }
    that.setData({
      subscribe_id_list: subscribe_id_list
    })
  },

  remove_from_dissubscribe: function(val) {
    var that = this
    var dissubscribe_id_list = that.data.dissubscribe_id_list
    var index = dissubscribe_id_list.indexOf(val);
    if (index > -1) {
      dissubscribe_id_list.splice(index, 1);
    }
    that.setData({
      dissubscribe_id_list: dissubscribe_id_list
    })
  },
  
  subscribe: function(e) {
      //从取关列表dissubscribe_id_list里面删除该用户id
      //将该用户id加入subscribe_id_list列表

      // console.log(e)
      var that = this
      var index = e.currentTarget.id
      var cur_tab = that.data.current_tab
      var subscribe_id_list = that.data.subscribe_id_list

      if (cur_tab == 0) {
        // console.log("debug")
        var subscriber_list = that.data.subscriber_list
        var follower_list = that.data.follower_list
        var temp = that.indexOf_follower(subscriber_list[index].id)

        subscriber_list[index].subscribed = true
        if (temp != -1) {
          follower_list[temp].subscribed = true
        }
        
        that.remove_from_dissubscribe(subscriber_list[index].id)
        //查看是否已关注（查找subscriber_list）
        temp = that.indexOf_subscriber(subscriber_list[index].id)
        if(temp == -1) {
          subscribe_id_list.push(subscriber_list[index].id)
        }
        
      }
      else if (cur_tab == 1) {
        var subscriber_list = that.data.subscriber_list
        var follower_list = that.data.follower_list
        var temp = that.indexOf_subscriber(follower_list[index].id)

        follower_list[index].subscribed = true
        if (temp != -1) {
          subscriber_list[temp].subscribed = true
        }
        
        that.remove_from_dissubscribe(follower_list[index].id)
        //查看是否已关注（查找subscriber_list）
        temp = that.indexOf_subscriber(follower_list[index].id)
        if(temp == -1) {
          subscribe_id_list.push(follower_list[index].id)
        }
      }
      that.setData({
        subscribe_id_list:subscribe_id_list,
        subscriber_list:subscriber_list,
        follower_list:follower_list
      })
  },
      
  disSubscribe: function(e) {
      //从关注列表subscribe_id_list里面删除该用户id
      //将该用户id加入dissubscribe_id_list列表

      console.log(e)
      var that = this
      var index = e.currentTarget.id
      var cur_tab = that.data.current_tab

      var dissubscribe_id_list = that.data.dissubscribe_id_list

      if (cur_tab == 0) {
        var subscriber_list = that.data.subscriber_list
        var follower_list = that.data.follower_list
        var temp = that.indexOf_follower(subscriber_list[index].id)
        subscriber_list[index].subscribed = false
        if (temp != -1) {
          follower_list[temp].subscribed = false
        }
        
        that.remove_from_subscribe(subscriber_list[index].id)
        //查看是否已关注（查找subscriber_list）
        temp = that.indexOf_subscriber(subscriber_list[index].id)
        if(temp != -1) {
          dissubscribe_id_list.push(subscriber_list[index].id)
        }
      }
      else if (cur_tab == 1) {
        var subscriber_list = that.data.subscriber_list
        var follower_list = that.data.follower_list
        var temp = that.indexOf_subscriber(follower_list[index].id)
        follower_list[index].subscribed = false
        if (temp != -1) {
          subscriber_list[temp].subscribed = false
        }
        
        that.remove_from_subscribe(follower_list[index].id)
        //查看是否已关注（查找subscriber_list）
        temp = that.indexOf_subscriber(follower_list[index].id)
        if(temp != -1) {
          dissubscribe_id_list.push(follower_list[index].id)
        }
      }

      that.setData({
        dissubscribe_id_list: dissubscribe_id_list,
        subscriber_list: subscriber_list,
        follower_list:follower_list
      })
  },

  navigate2OtherZone: function(event) {
    // console.log(event)
    wx.navigateTo({
      url: '/pages/OtherZone/OtherZone?id=' + event.currentTarget.id,
    })
  },
})