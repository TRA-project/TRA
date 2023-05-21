// pages/demo/demo.js
const utils = require("../../utils/util.js");

Page({

  /**
   * Page initial data
   */
  data: {
      show:false,

      server_imagename: utils.server_imagename,

      systemTop:0,
      scrollTop:0,

      id:'',
      icon: utils.server_imagename + '/male.png',
      fans:'',
      concern:0,
      likes:'',

      nickname:"",
      gender:0,      /**0-male 1-female */
      signature:"",
      moreInfo:false,
      birthday:"",
      location:{
        latitude:-1,
        longitude:-1,
        name:"",
        address:{
          city:"",
          district:"",
          nation:"",
          province:"",
          street:"",
          street_number:""
        }
      },

      cities:0,
      travels:0,

      notification: false,

      pressEditButton:false,

      showtab: 0, //顶部选项卡索引
      currentTab: 0,// tab切换
      tab: {
        tabnum: 2,
        tabitem: [
        {
        "id": 0,
        "text": "游记"
        },
        {
        "id": 1,
        "text": "同行"
        },
        {
        "id": 2,
        "text": "日程"
        }
        ]
      },
      pageSize:1260,
      travel_num:3,
      next_travel:"init",
      pal_num:3,
      next_pal:"init",
      schedule_num:3,
      next_schedule:"init",
      
      travel_ids:[],
      travel_covers:[],
      travel_names:[],
      travel_titles:[],
      travel_times:[],
      travel_reads:[],
      travel_likes:[],
      travel_comments:[],
      travel_visibility:[],
      travel_forbidden:[],

      pal_ids:[],
      pal_titles:[],
      pal_startTimes:[],
      pal_endTimes:[],
      pal_locations:[],
      pal_nums:[],
      pal_capacities:[],
      pal_ownerids:[],
      pal_icons:[],
      pal_nicknames:[],
      pal_genders:[],
      pal_cities:[],
      pal_travels:[],
      pal_forbidden:[],

      schedule_ids:[],
      schedule_titles:[],
      schedule_startTimes:[],
      schedule_endTimes:[],
      schedule_locations:[],
      schedule_contents:[],
      schedule_budgets:[],
      schedule_real_consumptions:[],
      //travel_reads:[],
      schedule_visibility:[],
      schedule_forbidden:[],

      tabbar_homepage : false,
      tabbar_mine : true,

      tabbar_3: true,//tabbar中有3个
      tabbar_1:false,//tabbar中有1个
      
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    wx.showLoading({
      title: '加载中'
    })
    this.update()
    wx.hideLoading({
      success: (res) => {},
    })
   
  },

  update: function() {
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
        console.log(res);
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
        var location = (data.position == null)? that.data.location : utils.positionTransform(data.position)
        that.setData({
          id: id,
          fans: data.subscribers,
          concern: data.subscription,
          likes: data.likes,
          nickname: data.nickname,
          gender: data.gender,
          signature: (data.sign == null)? "" : data.sign,
          birthday: (data.birthday == null)? "" : data.birthday,
          location: location,
          cities: data.cities,
          travels: data.travels,
          icon: (data.icon == null)? utils.server_imagename + "/male.png" 
          : utils.server_hostname + "/api/core/images/" + data.icon + "/data/"
        })

        // console.log(that.data.currentTab)
        if(that.data.currentTab == 0) that.getTravels(that.data.travel_num)
        else if(that.data.currentTab == 1) that.getPals(that.data.pal_num)
        else that.getSchedules(that.data.schedule_num)
      },
      fail: function(res) { console.log(res); }
    })

    that.getNotification()
  },

  getTravels: function(travel_num) {
    var that = this
    if (travel_num <= that.data.travel_ids.length) {
      that.setData({
        travel_num: travel_num,
        pageSize: (travel_num == 0)? 430 : travel_num * 430,
      })
      return
    }
    var id = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')
    var url
    if (that.data.next_travel == "init") {
      url = utils.server_hostname + "/api/core/travels/?owner=" + id 
    } else {
      url = that.data.next_travel
    }

    if (url == null) {
      travel_num = that.data.travel_ids.length
      that.setData({
        travel_num: travel_num,
        pageSize: (travel_num == 0)? 430 : travel_num * 430,
      })
      // console.log("no more travels")
      return
    }
    
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

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
        // loginExpired?

        var travellist = res.data.results
        // console.log(travellist)

        var travel_ids = that.data.travel_ids
        var travel_covers = that.data.travel_covers
        var travel_names = that.data.travel_names
        var travel_titles = that.data.travel_titles
        var travel_times = that.data.travel_times
        var travel_reads = that.data.travel_reads
        var travel_likes = that.data.travel_likes
        var travel_comments = that.data.travel_comments
        var travel_visibility = that.data.travel_visibility
        var travel_forbidden = that.data.travel_forbidden

        for (var i in travellist) {
          var travel = travellist[i]
          // console.log(travel)

          var cover
          if (travel.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
          else cover = utils.server_hostname + "/api/core/images/" + travel.cover + "/data/"

          travel_ids.push(travel.id)
          travel_covers.push(cover)
          if (travel.position == null) travel_names.push('')
          else travel_names.push(travel.position.name)
          
          if (travel.title.length > 9) travel_titles.push(travel.title.substring(0,10) + '...')
          else travel_titles.push(travel.title)

          travel_times.push(travel.time.substring(0,10))
          
          if(travel.read_total >= 1000) travel_reads.push((travel.read_total / 1000).toFixed(1).toString() + 'k')
          else travel_reads.push(travel.read_total)
          
          if(travel.likes >= 1000) travel_likes.push((travel.likes / 1000).toFixed(1).toString() + 'k')
          else travel_likes.push(travel.likes)

          if(travel.comments >= 1000) travel_comments.push((travel.comments / 1000).toFixed(1).toString() + 'k')
          else travel_comments.push(travel.comments)

          travel_visibility.push(travel.visibility)
          travel_forbidden.push(travel.forbidden)
        }

        that.setData({
          travel_ids: travel_ids,
          travel_covers:travel_covers,
          travel_names:travel_names,
          travel_titles:travel_titles,
          travel_times:travel_times,
          travel_reads:travel_reads,
          travel_likes:travel_likes,
          travel_comments:travel_comments,
          travel_visibility:travel_visibility,
          travel_forbidden: travel_forbidden,
          next_travel: res.data.next
        })

        if (travel_num > that.data.travel_ids.length) travel_num = that.data.travel_ids.length
        // no more travels
        
        that.setData({
          travel_num: travel_num,
          pageSize: (travel_num == 0)? 430 : travel_num * 430        
        })
        // console.log(that.data)
      },
      fail: function(res) { console.log(res); }
    })
  },

  getPals: function(pal_num) {
    var that = this
    if (pal_num <= that.data.pal_ids.length) {
      that.setData({
        pal_num: pal_num,
        pageSize: (pal_num == 0)? 460 : pal_num * 460,
      })
      return
    }

    var url
    if (that.data.next_pal == "init") {
      url = utils.server_hostname + "/api/core/users/join/"
    } else {
      url = that.data.next_pal
    }

    if (url == null) {
      pal_num = that.data.pal_ids.length
      that.setData({
        pal_num: pal_num,
        pageSize: (pal_num == 0)? 460 : pal_num * 460,
      })
      // console.log("no more pals")
      return
    }
    
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
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

        var pallist = res.data.results
        // console.log(pallist)

        var pal_ids = that.data.pal_ids
        var pal_titles = that.data.pal_titles
        var pal_startTimes = that.data.pal_startTimes
        var pal_endTimes = that.data.pal_endTimes
        var pal_locations = that.data.pal_locations
        var pal_nums = that.data.pal_nums
        var pal_capacities = that.data.pal_capacities
        var pal_ownerids = that.data.pal_ownerids
        var pal_icons = that.data.pal_icons
        var pal_nicknames = that.data.pal_nicknames
        var pal_genders = that.data.pal_genders
        var pal_cities = that.data.pal_cities
        var pal_travels = that.data.pal_travels
        var pal_forbidden = that.data.pal_forbidden

        for (var i in pallist) {
          var pal = pallist[i]
          // console.log(pal)

          var icon
          if (pal.owner.icon == null) icon = utils.server_imagename + "/male.png"
          else icon = utils.server_hostname + "/api/core/images/" + pal.owner.icon + "/data/"
          // console.log(icon)

          pal_ids.push(pal.id)
          
          if (pal.title.length > 19) pal_titles.push(pal.title.substring(0,20) + '...')
          else pal_titles.push(pal.title)

          pal_startTimes.push(pal.start_time.substring(0,10) + '-' + pal.start_time.substring(11,16))
          pal_endTimes.push(pal.end_time.substring(0,10) + '-' + pal.end_time.substring(11,16))
          if (pal.position == null) pal_locations.push('')
          else pal_locations.push(pal.position.province + pal.position.city + pal.position.district + pal.position.street_number + ' · ' + pal.position.name)

          pal_nums.push(pal.fellows.length)
          pal_capacities.push(pal.capacity)
          pal_ownerids.push(pal.owner.id)
          pal_icons.push(icon)
          pal_nicknames.push(pal.owner.nickname)
          pal_genders.push(pal.owner.gender)
          pal_cities.push(pal.owner.cities)
          pal_travels.push(pal.owner.travels)
          if (pal.owner.id != wx.getStorageSync('id') && pal.forbidden == 1) pal_forbidden.push(2)
          else pal_forbidden.push(pal.forbidden)
        }

        that.setData({
          pal_ids: pal_ids,
          pal_titles: pal_titles,
          pal_startTimes: pal_startTimes,
          pal_endTimes: pal_endTimes,
          pal_locations: pal_locations,
          pal_nums: pal_nums,
          pal_capacities: pal_capacities,
          pal_ownerids: pal_ownerids,
          pal_icons: pal_icons,
          pal_nicknames: pal_nicknames,
          pal_genders: pal_genders,
          pal_cities: pal_cities,
          pal_travels: pal_travels,
          pal_forbidden: pal_forbidden,
          next_pal: res.data.next
        })

        if (pal_num > that.data.pal_ids.length) pal_num = that.data.pal_ids.length
        // no more pals
        
        that.setData({
          pal_num: pal_num,
          pageSize: (pal_num == 0)? 460 : pal_num * 460        
        })
        // console.log(that.data)
      },
      fail: function(res) { console.log(res); }
    })
  },

  getSchedules: function(schedule_num) {
    var that = this
    if (schedule_num <= that.data.schedule_ids.length) {
      that.setData({
        schedule_num : schedule_num,
        pageSize:(schedule_num == 0) ? 460 : schedule_num * 460,
      })
      return
    }
    var id = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')
    var url
    if (that.data.next_schedule == "init") {
      url = utils.server_hostname + "/api/core/schedule/?owner=" + id
    }else {
      url = that.data.next_schedule
    }

    if (url == null) {
      schedule_num = that.data.schedule_ids.length
      that.setData({
        schedule_num:schedule_num,
        pageSize:(schedule_num == 0) ? 430 :schedule_num * 430,
      })

      return
    }

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      data:{
      },
      method:'GET',
      header :{
      'content-type': 'application/json',
      'token-auth': token
      },
      success:function(res) {
        var schedulelist = res.data.results
        
        var schedule_ids = that.data.schedule_ids
        var schedule_titles = that.data.schedule_titles
        var schedule_contents = that.data.schedule_contents
        var schedule_startTimes = that.data.schedule_startTimes
        var schedule_endTimes = that.data.schedule_endTimes
        var schedule_locations = that.data.schedule_locations
        var schedule_budgets = that.data.schedule_budgets
        var schedule_real_consumptions = that.data.schedule_real_consumptions
        var schedule_visibility = that.data.schedule_visibility
        var schedule_forbidden = that.data.schedule_forbidden

        for (var i in schedulelist) {
          var schedule = schedulelist[i]

          var icon
        //   if (schedule.owner.icon == null) icon = utils.server_imagename + "/male.png"
        //   else icon = utils.server_hostname + "/api/core/images/" + pal.owner.icon + "/data/"
          // console.log(icon)

          schedule_ids.push(schedule.id)
          if (schedule.title.length > 19) schedule_titles.push(schedule.title.substring(0,20) + '...')
          else schedule_titles.push(schedule.title)

          schedule_startTimes.push(schedule.start_time.substring(0,10) + '-' + schedule.start_time.substring(11,16))
          schedule_endTimes.push(schedule.end_time.substring(0,10) + '-' + schedule.end_time.substring(11,16))
          if (schedule.position == null) schedule_locations.push('')
          else schedule_locations.push(schedule.position.province + schedule.position.city + schedule.position.district + schedule.position.street_number + ' · ' + schedule.position.name)

          schedule_budgets.push(schedule.budget)
          schedule_real_consumptions.push(schedule.real_consumption)
          schedule_visibility.push(schedule.visibility)
          schedule_forbidden.push(schedule.forbidden)
        }

        that.setData({
          schedule_ids: schedule_ids,
          schedule_titles: schedule_titles,
          schedule_startTimes:schedule_startTimes,
          schedule_endTimes:schedule_endTimes,
          schedule_locations:schedule_locations,
          schedule_budgets:schedule_budgets,
          schedule_real_consumptions:schedule_real_consumptions,
          schedule_visibility:schedule_visibility,
          schedule_forbidden:schedule_forbidden,
          next_schedule:res.data.next
        })

        if(schedule_num > that.data.schedule_ids.length) schedule_num = that.data.schedule_ids.length
        // no more schedules

        that.setData({
          schedule_num:schedule_num,
          pageSize: (schedule_num == 0) ? 430 : schedule_num * 430
        })
      },
      fail:function(res) {console.log(res);}
    })
  },

  getNotification: function() {
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    if (token != 'notoken') {
      wx.request({
        url: utils.server_hostname + '/api/core/users/messages/?unread=true',
        data: {
        },
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        success: function(res) {
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
          if (res.statusCode == 200) {
            that.setData({
              notification: res.data.count > 0
            })
          }
        }
      })
    }
  },

  moreInfo:function(){
    this.setData({
        moreInfo:true,
    })
  },

  lessInfo:function(){
    this.setData({
        moreInfo:false,
    })
  },

  setTab: function (e) {
    var that = this
    that.setData({
      showtab: e.currentTarget.dataset.tabindex
    })
    if (that.data.currentTab === e.currentTarget.dataset.tabindex) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.tabindex
      })
    }
  },

  /**
  * 滑动切换tab
  */
  bindChange: function (e) {
    var that = this;

    // console.log(2)
    if (e.detail.current == 0) that.getTravels(that.data.travel_num)
    else if (e.detail.current == 1) that.getPals(that.data.pal_num)
    else if (e.detail.current == 2) that.getSchedules(that.data.schedule_num)

    that.setData({ 
      currentTab: e.detail.current,
      showtab: e.detail.current
    });
  },

  navigate2Edit: function (options) {
    wx.navigateTo({
      url: '/pages/EditInfo/EditInfo',//要跳转到的页面路径
    }); 
  },

  pressEditButton: function (options) {
    this.setData({ 
      pressEditButton:true
    });
  },
  navigate2Flight:function(){
    console.log('flight')
    wx.navigateTo({
      url: '/pages/Flight/Flight',
    })
  },
  releaseEditButton: function (options) {
    this.setData({ 
      pressEditButton:false
    });
  },

  navigate2footprint: function(event) {
    utils.navigate2footprint(wx.getStorageSync('id'), 
    this.data.nickname, this.data.icon, this.data.cities, this.data.travels)
  },

  navigate2Travel: function(event) {
    // console.log(event)
    var data = this.data
    var travel_id = data.travel_ids[parseInt(event.currentTarget.id)]
    utils.navigate2Travel(travel_id, data.id, data.icon, data.nickname, data.cities, data.travels)
  },

  navigate2Notification: function() {
    wx.navigateTo({
      url: '/pages/Notification/Notification',
    })
  },

  navigate2Likes: function() {
    wx.navigateTo({
      url:'/pages/Likes/Likes'
    })
  },

  deleteTravel: function(event) {
    // console.log(event)
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    
    wx.showModal({
      content: '是否确认删除该游记？',
      title: '删除游记',
      success: function(choose) {
        if (choose.confirm) {
          var id = that.data.travel_ids[parseInt(event.currentTarget.id)]
          wx.request({
            url: utils.server_hostname + '/api/core/travels/' + id + '/',
            method: "DELETE",
            header: {
              'content-type': 'application/json',
              'token-auth': token
            },
            success: function(res) {
              // console.log(res)
              // loginExpired?

              wx.redirectTo({
                url: '/pages/MyZone/MyZone'
              })
            }
          })
        }
      }
    })
  },

  navigate2Pal: function(event) {
    // console.log(event)
    var data = this.data
    var index = parseInt(event.currentTarget.id)
    var pal_id = data.pal_ids[index]
    var author_id = data.pal_ownerids[index]
    var author_icon = data.pal_icons[index]
    var author_nickname = data.pal_nicknames[index]
    var author_cities = data.pal_cities[index]
    var author_travels = data.pal_travels[index]
    utils.navigate2Pal(pal_id, author_id, author_icon, author_nickname, author_cities, author_travels)
  },

  deletePal: function(event) {
    // console.log(event)
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

    if (that.data.pal_ownerids[parseInt(event.currentTarget.id)] != wx.getStorageSync('id')) {
      wx.showToast({
        title: '只能删除自己发布的同行',
        icon: 'none',
        duration: 1000
      })
      return
    }

    wx.showModal({
      content: '是否确认删除该同行？',
      title: '删除同行',
      success: function(choose) {
        if (choose.confirm) {   
          var id = that.data.pal_ids[parseInt(event.currentTarget.id)]
          wx.request({
            url: utils.server_hostname + '/api/core/companions/' + id + '/',
            method: "DELETE",
            header: {
              'content-type': 'application/json',
              'token-auth': token
            },
            success: function(res) {
              // console.log(res)
              // loginExpired?

              wx.redirectTo({
                url: '/pages/MyZone/MyZone'
              })
            }
          })
        }
      }
    })
  },

  navigate2Schedule:function(event) {
    //console.log(event)
    var data = this.data
    var index = parseInt(event.currentTarget.id)
    var schedule_id = data.schedule_ids[index]
    utils.navigate2Schedule(schedule_id,data.id,data.icon,data.nickname,data.cities,data.travels)
    //var author_id = data.schedule_o
  },
  deleteSchedule:function(event) {
    var that = this
    var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')

    wx.showModal({
      content: '是否确认删除该日程？',
      title:'删除日程',
      success:function(choose) {
          if(choose.confirm) {
              var id = that.data.schedule_ids[parseInt(event.currentTarget.id)]
              wx.request({
                url: utils.server_hostname + '/api/core/schedule/' + id + '/',
                method:"DELETE",
                header:{
                    'content-type': 'application/json',
                    'token-auth': token
                },
                success:function(res) {
                    wx.redirectTo({
                      url: '/pages/MyZone/MyZone'
                    })
                }
              })
          }
      }
    })
  },

  navigate2Release: function() {
    utils.navigate2Release()
  },
  navigate2calendar:function(){
    wx.navigateTo({
      url: '/pages/newSchedule/newSchedule'
    })
  },
  navigate2Subscription:function(event) {
    wx.navigateTo({
      url: '/pages/Subscription/Subscription?tabindex=' + event.currentTarget.id,
    }); 
  },

  quit: function(options){
    wx.showActionSheet({
      itemList: ['退出登录','修改密码','问题反馈','关于我们'],
      success (res) {
        if(res.tapIndex == 0){
          wx.clearStorageSync()
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
        else if (res.tapIndex == 1) {
          wx.navigateTo({
            url: '/pages/EditPassword/EditPassword',
          })
        }
        else if (res.tapIndex == 2) {
          wx.navigateTo({
            url: '/pages/FeedBack/FeedBack',
          })
        }
        else if (res.tapIndex == 3) {
          wx.navigateTo({
            url: '/pages/AboutUs/AboutUs',
          })
        }
      },
      fail (res) { console.log(res) }
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:show
    })
    

    this.tabbar_3_animation = wx.createAnimation({
      duration:10,
    })

    this.tabbar_1_animation = wx.createAnimation({
      duration:10,
    })
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    wx.redirectTo({
      url: '/pages/MyZone/MyZone',
    })
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    wx.showLoading({
      title: '加载中'
    })

    if (this.data.showtab == 0){
      if (this.data.next_travel == null && this.data.travel_num == this.data.travel_ids.length) {
        wx.hideLoading({
          success: (res) => {},
        })
        return
      }
      this.getTravels(this.data.travel_num + 3)  
    }
    else if (this.data.showtab == 1) {
      if (this.data.next_pal == null && this.data.pal_num == this.data.pal_ids.length) {
        wx.hideLoading({
          success: (res) => {},
        })
        return
      }
      this.getPals(this.data.pal_num + 3)
    }
    else if (this.data.showtab == 2) {
        if (this.data.next_schedule == null && this.data.schedule_num == this.data.schedule_ids.length) {
          wx.hideLoading({
            success: (res) => {},
          })
          return
        }
        this.getSchedules(this.data.schedule_num + 3)
      }

    wx.hideLoading({
      success: (res) => {},
    })
  },

  changeTabbarHomepage: function(){
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },

  changeTabbarMine: function(){
      wx.navigateTo({
        url: '/pages/RealMyzone/RealMyzone',
      })
      console.log('mine')
  },

  

  onPageScroll:function (ev) {
    var _this = this;
    var topNow = ev.scrollTop
    var topLast = _this.data.scrollTop
    //当滚动的top值最大或者最小时，为什么要做这一步是由于在手机实测小程序的时候会发生滚动条回弹，所以为了解决回弹，设置默认最大最小值   
    if (topNow <= 0) {
     topNow = 0;
    } else if (ev.scrollTop > wx.getSystemInfoSync().windowHeight) {
      ev.scrollTop = wx.getSystemInfoSync().windowHeight;
    }
    
    let query = wx.createSelectorQuery()
    query.select('#bottom').boundingClientRect((rect) => {
      if (rect.top < wx.getSystemInfoSync().windowHeight + 10) return

      //判断浏览器滚动条上下滚动   
      if (topNow > topLast) { 
        if(this.data.tabbar_3){
          _this.setData({
            tabbar_3:false,
            tabbar_1:true,
          })
        }
      } else {
        if(this.data.tabbar_1){
          _this.setData({
              tabbar_3:true,
              tabbar_1:false,
          })
        }
      }
      //给scrollTop重新赋值    
      _this.setData({
        scrollTop: topNow
      })
    }).exec()
  },

  onShareAppMessage: function (res) {
    return {
      title: 'Tripal: Share Trip With Pal',
      path: '/pages/index/index',
      imageUrl: 'https://tra-fr-2.zhouyc.cc/media/logo.png'
    }
  },

  preview: function(event) {
    wx.previewImage({
      current: event.currentTarget.id,
      urls: [event.currentTarget.id]
    })
  }
})