// pages/notification/notification.js
const utils = require("../../utils/util.js");

Page({

    /**
     * Page initial data
     */
    data: {
        show_tab: 0, //顶部选项卡索引
        current_tab: 0,// tab切换
        show: false,
        tab: {
          tabnum: 3,
          tabitem: [
          {
              "id": 0,
              "text": "系统",
              "unread": false
          },    
          {
              "id": 1,
              "text": "互动",
              "unread": false
          },
          {
              "id": 2,
              "text": "同行",
              "unread": false
          }
          ]
        },

        id:'',
        icon:'',
        nickname:"",
        cities:0,
        travels:0,

        system_list_unread : [],
        interact_list_unread : [],
        pal_list_unread : [],

        system_list : [],
        interact_list : [],
        pal_list : [],

        next_unread: "init",
        next_read: "init",

        system_unread: false,
        interact_unread: false,
        pal_unread: false
    },

    navigate2Travel_Unread: function(event) {
      var data = this.data
      var item = data.interact_list_unread[event.currentTarget.id]
      console.log(item)
      if (item.parent == undefined) {
        utils.navigate2Travel(item.travel_id, data.id, data.icon, data.nickname, data.cities, data.travels)
      }
      else {
        var parent = item.parent
        var owner = parent.owner
        var icon = utils.server_hostname + "/api/core/images/" + owner.icon + "/data/"
        utils.navigate2Travel(parent.id, owner.id, icon, owner.nickname, owner.cities, owner.travels)
      }
    },

    navigate2Travel_Read: function(event) {
      var data = this.data
      var item = data.interact_list[event.currentTarget.id]
      // console.log(item)
      if (item.parent == undefined) {
        utils.navigate2Travel(item.travel_id, data.id, data.icon, data.nickname, data.cities, data.travels)
      }
      else {
        var parent = item.parent
        var owner = parent.owner
        var icon = utils.server_hostname + "/api/core/images/" + owner.icon + "/data/"
        utils.navigate2Travel(parent.id, owner.id, icon, owner.nickname, owner.cities, owner.travels)
      }
    },

    navigate2Pal_Unread: function(event) {
      var data = this.data
      var item = data.pal_list_unread[event.currentTarget.id]
      // console.log(item)
      if (item.parent == undefined) {
        utils.navigate2Pal(item.pal_id, data.id, data.icon, data.nickname, data.cities, data.travels)
      }
      else {
        var parent = item.parent
        var owner = parent.owner
        var icon = utils.server_hostname + "/api/core/images/" + owner.icon + "/data/"
        utils.navigate2Pal(parent.id, owner.id, icon, owner.nickname, owner.cities, owner.travels)
      }
    },

    navigate2Pal_Read: function(event) {
      var data = this.data
      var item = data.pal_list[event.currentTarget.id]
      // console.log(item)
      if (item.parent == undefined) {
        utils.navigate2Pal(item.pal_id, data.id, data.icon, data.nickname, data.cities, data.travels)
      }
      else {
        var parent = item.parent
        var owner = parent.owner
        var icon = utils.server_hostname + "/api/core/images/" + owner.icon + "/data/"
        utils.navigate2Pal(parent.id, owner.id, icon, owner.nickname, owner.cities, owner.travels)
      }
    },

    navigate2OtherZone: function(event) {
      // console.log(event)
      if (event.currentTarget.id == "") return
      wx.navigateTo({
        url: '/pages/OtherZone/OtherZone?id=' + event.currentTarget.id,
      })
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
      var tabIndex = options.tabIndex
      if (tabIndex != undefined) {
        this.setData({
          current_tab: tabIndex,
          show_tab: tabIndex
        })
      } 
      this.disappear_animation = wx.createAnimation({
        duration:800,
      })

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
          // console.log(res);
          if (res.statusCode == 404 || res.statusCode == 405) {
            wx.redirectTo({
              url: '/pages/login/login'
            })
            
            wx.showToast({
              title: '未登陆',
              icon: 'error',
              duration: 1000
            })
            return
          }
          // loginExpired?

          var data = res.data
          that.setData({
            id: id,
            icon: (data.icon == null)? utils.server_imagename + "/male.png" 
            : utils.server_hostname + "/api/core/images/" + data.icon + "/data/",
            nickname: data.nickname,
            cities: data.cities,
            travels: data.travels
          })

          // console.log(that.data)
          that.getMessages(true)
          that.getMessages(false)
        },
        fail: function(res) { console.log(res); }
      })
    },

    moreRead: function() {
      this.getMessages(false)
    },

    moreUnread: function() {
      this.getMessages(true)
    },

    getMessages: function(unread) {
      var that = this
      var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
      var url
      if (unread) {
        if (that.data.next_unread == "init") url = utils.server_hostname + '/api/core/users/messages/?unread=true'
        else url = that.data.next_unread
      } 
      else {
        if (that.data.next_read == "init") url = utils.server_hostname + '/api/core/users/messages/?unread=false'
        else url = that.data.next_read
      }

      if (url == null) return
      // console.log(url)
      wx.request({
        url: url,
        data: {
        },
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        success: function(res) {
          // console.log(res);
          if (res.statusCode == 403 || res.statusCode == 404) {
            wx.redirectTo({
              url: '/pages/login/login'
            })
            
            wx.showToast({
              title: '登陆已过期',
              icon: 'error',
              duration: 1000
            })
            return
          }
          // unlogin?

          if (unread) {
            that.setData({
              next_unread: res.data.next
            })
          }
          else {
            that.setData({
              next_read: res.data.next
            })
          }

          var list = res.data.results
          var system_list = (unread)? that.data.system_list_unread : that.data.system_list
          var interact_list = (unread)? that.data.interact_list_unread : that.data.interact_list
          var pal_list = (unread)? that.data.pal_list_unread : that.data.pal_list
          for (var i in list) {
            var item = list[i]

            var icon = utils.server_imagename + "/editPic.png"
            if (item.owner != null) {
              if (item.owner.icon == null) icon = utils.server_imagename + "/male.png"
              else icon = utils.server_hostname + "/api/core/images/" + item.owner.icon + "/data/"
            }

            // console.log(item)
            if (item.type == 0) { // 系统推送
              var system_notification = {
                id: item.id,
                icon: icon,
                nickname: "系统推送",
                content: item.content,
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              system_list.push(system_notification)
            }
            else if (item.type == 1) { // 点赞游记
              var cover = item.related_travel.cover
              if (cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
              else cover = utils.server_hostname + "/api/core/images/" + item.related_travel.cover + "/data/"

              var like = {
                id: item.id,
                owner_id: item.owner.id,
                icon: icon,
                nickname: item.owner.nickname,
                content: "点赞了你的游记",
                travel_id: item.related_travel.id,
                travel_cover: cover,
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              interact_list.push(like)
            }
            else if (item.type == 3) {
              var subscribe = {
                id: item.id,
                owner_id: item.owner.id,
                icon: icon,
                nickname: item.owner.nickname,
                content: "关注了你",
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              interact_list.push(subscribe)
            }
            else if (item.type == 4) { // 评论
              // console.log(item)
              if (item.related_travel != null) { // 评论游记
                var cover = item.related_travel.cover
                if (cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
                else cover = utils.server_hostname + "/api/core/images/" + item.related_travel.cover + "/data/"

                var comment_travel = {
                  id: item.id,
                  owner_id: item.owner.id,
                  icon: icon,
                  nickname: item.owner.nickname,
                  content: "评论了你的游记",
                  travel_id: item.related_travel.id,
                  travel_cover: cover,
                  time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                  unread: unread
                }
                interact_list.push(comment_travel)
              }
              else { // 评论同行
                var comment_pal = {
                  id: item.id,
                  owner_id: item.owner.id,
                  icon: icon,
                  nickname: item.owner.nickname,
                  content: "评论了你的同行",
                  pal_id: item.related_companion.id,
                  pal_cover: utils.server_imagename + '/visibility.jpg',
                  time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                  unread: unread
                }
                pal_list.push(comment_pal)
              }
            }
            else if (item.type == 5) { // 回复评论
              var related = item.related_comment
              var parent = related.parent
              if (parent == null) { // 历史遗留问题
                var comment_comment = { 
                  id: item.id, 
                  owner_id: item.owner.id, 
                  icon: icon, 
                  nickname: item.owner.nickname, 
                  content: "回复了你的评论", 
                  time: item.time.substring(0,10) + ' ' + item.time.substring(11,16), 
                  unread: unread 
                } 
                interact_list.push(comment_comment) 
                continue
              }
              
              var content = "回复了你的评论："
              if (related.content.length < 5) content = content + related.content
              else content = content + related.content.substring(0,3) + '...'

              if (!parent.hasOwnProperty('cover')) { // 同行
                var reply_pal = {
                  id: item.id,
                  owner_id: item.owner.id,
                  icon: icon,
                  nickname: item.owner.nickname,
                  content: content,
                  pal_id: parent.id,
                  pal_cover: utils.server_imagename + '/visibility.jpg',
                  time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                  parent: parent,
                  unread: unread
                }
                pal_list.push(reply_pal)
              }
              else {
                var cover = parent.cover
                if (cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
                else cover = utils.server_hostname + "/api/core/images/" + cover.id + "/data/"

                var reply_travel = {
                  id: item.id,
                  owner_id: item.owner.id,
                  icon: icon,
                  nickname: item.owner.nickname,
                  content: content,
                  travel_id: parent.id,
                  travel_cover: cover,
                  time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                  parent: parent,
                  unread: unread
                }
                interact_list.push(reply_travel)
              }
            }
            else if (item.type == 6) { // 加入同行
              var join_pal = {
                id: item.id,
                owner_id: item.owner.id,
                icon: icon,
                nickname: item.owner.nickname,
                content: "加入了你的同行",
                pal_id: item.related_companion.id,
                pal_cover: utils.server_imagename + '/visibility.jpg',
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              pal_list.push(join_pal)
            }
            else if (item.type == 7) { // 退出同行
              var quit_pal = {
                id: item.id,
                owner_id: item.owner.id,
                icon: icon,
                nickname: item.owner.nickname,
                content: "退出了你的同行",
                pal_id: item.related_companion.id,
                pal_cover: utils.server_imagename + '/visibility.jpg',
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              pal_list.push(quit_pal)
            }
            else if (item.type == 20) { //游记未通过审核
              var cover = item.related_travel.cover
              if (cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
              else cover = utils.server_hostname + "/api/core/images/" + item.related_travel.cover + "/data/"

              var reject = {
                id: item.id,
                owner_id: "",
                icon: icon,
                nickname: "游记审核",
                content: "你的游记未通过审核",
                travel_id: item.related_travel.id,
                travel_cover: cover,
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              interact_list.push(reject)
            }
            else if (item.type == 21) {
              var reject = {
                id: item.id,
                owner_id: "",
                icon: icon,
                nickname: "同行审核",
                content: "你的同行未通过审核",
                pal_id: item.related_companion.id,
                pal_cover: utils.server_imagename + '/visibility.jpg',
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              pal_list.push(reject)
            }
            else if(item.type==40){
              var system_notification = {
                id: item.id,
                icon: icon,
                nickname: "日程提醒",
                content: "你的日程"+item.related_scheduleitem.content+"即将开始",
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              system_list.push(system_notification)
            }
            else if(item.type==41){
              var system_notification = {
                id: item.id,
                icon: icon,
                nickname: "航班提醒",
                content: "你关注的航班"+item.related_flight.flight_no+"("+item.related_flight.city.name+"至"+item.related_flight.endcity.name+")于明日"+item.related_flight.depart_time.substring(11,16)+"起飞",
                time: item.time.substring(0,10) + ' ' + item.time.substring(11,16),
                unread: unread
              }
              system_list.push(system_notification)
            }
            else {
              console.log(item)
            }
          }
    
          if (unread) {
            var tab = {
              tabnum: 3,
              tabitem: [
              {
                  "id": 0,
                  "text": "系统",
                  "unread": system_list.length > 0
              },    
              {
                  "id": 1,
                  "text": "互动",
                  "unread": interact_list.length > 0
              },
              {
                  "id": 2,
                  "text": "同行",
                  "unread": pal_list.length > 0
              }
              ]
            }

            that.setData({
              system_list_unread: system_list,
              interact_list_unread: interact_list,
              pal_list_unread: pal_list,
              tab: tab
            })
          }
          else {
            that.setData({
              system_list: system_list,
              interact_list: interact_list,
              pal_list: pal_list
            })
          }

          // console.log(that.data)
        },
        fail: function(res) { console.log(res); }
      })
    },
    
    setTab: function (e) {
        var that = this
        
        // console.log(e)
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
      // console.log(e)
        var that = this;
        that.setData({ 
            current_tab: e.detail.current,
            show_tab: e.detail.current
        });
      },

    markAsRead:function(event){
      var that = this
      var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')

      wx.showModal({
        title: '提示',
        content: '标记消息已读',
        success (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中'
            })

            wx.request({
              url: utils.server_hostname + '/api/core/messages/' + event.currentTarget.id + '/',
              method: 'GET',
              header: {
                'content-type': 'application/json',
                'token-auth': token
              },
              success: function(res) {
                wx.hideLoading({
                  success: (res) => {},
                })

                var tabIndex = that.data.show_tab
                wx.redirectTo({
                  url: '/pages/Notification/Notification?tabIndex=' + tabIndex,
                })
              },
              fail: function(res) { console.log(res) }
            })
          }
        }
      })
    },

    markAllRead: function(event) {
      var that = this
      var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
      
      wx.showModal({
        title: '提示',
        content: '标记该类消息已读',
        success (res) {
          if (res.confirm) {
            var type = parseInt(event.currentTarget.id)
            var messages = []
            if (type == 0) {
              var system_list_unread = that.data.system_list_unread
              for (var i in system_list_unread) {
                messages.push(system_list_unread[i].id)
              }
            }
            else if (type == 1) {
              var interact_list_unread = that.data.interact_list_unread
              for (var i in interact_list_unread) {
                messages.push(interact_list_unread[i].id)
              }
            }
            else if (type == 2) {
              var pal_list_unread = that.data.pal_list_unread
              for (var i in pal_list_unread) {
                messages.push(pal_list_unread[i].id)
              }
            }
            // console.log(messages)

            wx.showLoading({
              title: '加载中'
            })

            wx.request({
              url: utils.server_hostname + '/api/core/messages/read/',
              method: 'POST',
              header: {
                'content-type': 'application/json',
                'token-auth': token,
              },
              data: {
                'id': messages
              },
              success: function(res) {
                // console.log(res)
                wx.hideLoading({
                  success: (res) => {},
                })

                var tabIndex = that.data.show_tab
                wx.redirectTo({
                  url: '/pages/Notification/Notification?tabIndex=' + tabIndex,
                })
              },
              fail: function(res) { console.log(res) }
            })
          }
        }
      })
    },

    delete:function(event){
      // var that = this
      // var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
      // wx.showModal({
      //   title: '提示',
      //   content: '删除消息',
      //   success (res) {
      //     if (res.confirm) {
      //     }
      //   }
      // })
    },

    allRead:function(){
      var that = this
      var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
      
      wx.showModal({
        title: '提示',
        content: '标记所有消息已读',
        success (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中'
            })

            wx.request({
              url: utils.server_hostname + '/api/core/messages/read/',
              method: 'POST',
              header: {
                'content-type': 'application/json',
                'token-auth': token,
              },
              data: {
                
              },
              success: function(res) {
                console.log(res)
                wx.hideLoading({
                  success: (res) => {},
                })

                var tabIndex = that.data.show_tab
                wx.redirectTo({
                  url: '/pages/Notification/Notification?tabIndex=' + tabIndex,
                })
              },
              fail: function(res) { console.log(res) }
            })
          }
        }
      })
    },

    onPullDownRefresh: function () {
      wx.redirectTo({
        url: '/pages/Notification/Notification?tabIndex=' + this.data.current_tab,
      })
    },
})