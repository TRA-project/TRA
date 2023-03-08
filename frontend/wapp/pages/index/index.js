// pages/homepage/homepage.js
const utils = require("../../utils/util.js");

Page({
    onShareAppMessage() {
      return {
        title: 'cover-view',
        path: 'page/component/pages/cover-view/cover-view'
      }
    },
    /**
     * Page initial data
     */
    data: {
      show:false,

      server_hostname: utils.server_hostname,
      server_imagename: utils.server_imagename,

      notification: false,

      systemTop:0,
      scrollTop:0,

      input_value:"五一去哪儿?",

      showtab: 0, //顶部选项卡索引
      currentTab: 0,// tab切换
      screenwidth:0, 
      tab: {
        tabnum: 3,
        tabitem: [
        {
        "id": 0,
        "text": "发现"
        },
        {
        "id": 1,
        "text": "同行"
        },
        {
          "id": 2,
          "text": "地点"
        }
      ],
    },


    pageSize:1290,
    travel_num:3,
    // next_travel:"init",
    pal_num:3,
    // next_pal:"init",
    loc_num:3,
    ad_num:5,
    next_loc:"init",
    
    travel_ids:[],
    travel_covers:[],
    travel_names:[],
    travel_titles:[],
    travel_ownerids:[],
    travel_icons:[],
    travel_nicknames:[],
    travel_liked:[],
    travel_liked_now:[],
    travel_likes:[],
    travel_cities:[],
    travel_travels:[],
    travel_tags:[],

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

    loc_ids:[],
    loc_covers:[],
    loc_images:[],
    loc_descriptions:[],
    loc_names:[],

    // ad_ids:[],
    // ad_covers:[],
    // ad_titles:[],
    // ad_urls:[],
    todo_items:[],
    todo_flights:[],
    alarm_items:[],
    alarm_flights:[],
    // todo_items_size:0,
    // todo_flights_size:0,
    // alarm_flights_size:0,
    // alarm_items_size:0,

    tabbar_homepage : true,
    tabbar_mine : false,

    tabbar_3: true,//tabbar中有3个
    tabbar_1: false,//tabbar中有1个

    
    firstTouch: true
    },

    onShow: function(){
      this.getNotification()
      this.getAds()
      //this.onPullDownRefresh()
      this.setData({
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

        travel_ids:[],
        travel_covers:[],
        travel_names:[],
        travel_titles:[],
        travel_ownerids:[],
        travel_icons:[],
        travel_nicknames:[],
        travel_liked:[],
        travel_liked_now:[],
        travel_likes:[],
        travel_cities:[],
        travel_travels:[],
        travel_tags:[],
      })
      this.getPals(this.data.pal_num)
      this.getTravels(this.data.travel_num)
      console.log(666666)
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
      var that = this
      wx.request({
        url: utils.server_hostname + '/api/status/',
        method:"GET",
        success: function(res) {
          var code = res.statusCode
          if (code != 404){
            that.setData({
              // show:false
              show:true
            })
          }else{
            that.setData({
              show:true
            })
          }
        },
      })

      var top = wx.getSystemInfoSync().windowHeight
      this.setData({
        systemTop:top
      })
      this.initSetting()
      this.getTravels(this.data.travel_num)
      this.getAds()
      
      // console.log(this.data)
    },

    initSetting: function() {
      var that = this
      wx.getSystemInfo({
        success: function(res) {
          that.setData({
            screenwidth: res.windowWidth
          })
        }
      })
      this.big_animation = wx.createAnimation({
        duration:400,
      })

      this.fly_animation = wx.createAnimation({
        duration:800,
        timingFunction:"ease"
      })

      this.tabbar_3_animation = wx.createAnimation({
        duration:150,
      })

      this.tabbar_1_animation = wx.createAnimation({
        duration:150,
      })
    },

    getAds(){
      var that = this
      var url = utils.server_hostname + "/api/core/users/todos/"
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
          // console.log(res)
          var result = res.data

          var todo_items = []
          var todo_flights = []
          var alarm_items = []
          var alarm_flights = []
          
          for (var i in result.todo_flights) {
              todo_flights.push(result.todo_flights[i])
              todo_flights[i].flight.depart_time = utils.formatDate(todo_flights[i].flight.depart_time) + ' ' + utils.formatHour(todo_flights[i].flight.depart_time)
          }
          for (var i in result.alarm_flights) {
            alarm_flights.push(result.alarm_flights[i])
            alarm_flights[i].flight.depart_time = utils.formatDate(alarm_flights[i].flight.depart_time) + ' ' + utils.formatHour(alarm_flights[i].flight.depart_time)
        }
        //   for (var i in adlist) {
        //     var ad = adlist[i]
        //     // console.log(ad)


        //     var cover
        //     if (ad.cover == null) cover = utils.server_imagename + "/olympic1.jpg"
        //     else cover = utils.server_hostname + "/api/core/images/" + ad.cover.id + "/data/"

        //     ad_ids.push(ad.id)
        //     ad_covers.push(cover)
        //     ad_titles.push(ad.title)
        //   }
          
          that.setData({
            // ad_ids:ad_ids,
            // ad_covers:ad_covers,
            // ad_titles:ad_titles,
            // ad_urls:ad_urls
            todo_items:result.todo_items,
            todo_flights:todo_flights,
            alarm_items:result.alarm_items,
            alarm_flights:alarm_flights
          })
        console.log(that.data.todo_flights)
        console.log(666)
        }
      })        

    },

    getTravels: function(travel_num) {
      var that = this
      if (travel_num <= that.data.travel_ids.length) {
        that.setData({
          travel_num: travel_num,
          pageSize: (travel_num == 0)? 425 : travel_num * 425,
        })
        return
      }
      var url = utils.server_hostname + "/api/core/travels/recommend/"
      // if (that.data.next_travel == "init") {
      //   url = utils.server_hostname + "/api/core/travels/" 
      // } else {
      //   url = that.data.next_travel
      // }
  
      // if (url == null) {
      //   travel_num = that.data.travel_ids.length
      //   that.setData({
      //     travel_num: travel_num,
      //     pageSize: (travel_num == 0)? 425 : travel_num * 425,
      //   })
      //   // console.log("no more travels")
      //   return
      // }
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

          var travellist = res.data.data
          // var travellist = res.data.results
          // console.log(res)
          console.log(res.data)
  
          var travel_ids = that.data.travel_ids
          var travel_covers = that.data.travel_covers
          var travel_names = that.data.travel_names
          var travel_titles = that.data.travel_titles
          var travel_ownerids = that.data.travel_ownerids
          var travel_icons = that.data.travel_icons
          var travel_nicknames = that.data.travel_nicknames
          var travel_likes = that.data.travel_likes
          var travel_cities = that.data.travel_cities
          var travel_travels = that.data.travel_travels
          var travel_liked = that.data.travel_liked
          var travel_liked_now = that.data.travel_liked_now
          
          var travel_tags = that.data.travel_tags

          for (var i in travellist) {
            var travel = travellist[i]
            // console.log(travel)
            if (travel.forbidden == 1) continue
  
            var icon
            if (travel.owner.icon == null) icon = utils.server_imagename + "/male.png"
            else icon = utils.server_hostname + "/api/core/images/" + travel.owner.icon + "/data/"

            var cover
            if (travel.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
            else cover = utils.server_hostname + "/api/core/images/" + travel.cover + "/data/"
        
            travel_ids.push(travel.id)
            travel_covers.push(cover)
            if (travel.position == null) travel_names.push('')
            else travel_names.push(travel.position.name)

            if (travel.title.length > 9) travel_titles.push(travel.title.substring(0,10) + '...')
            else travel_titles.push(travel.title)

            if (travel.tag.length >= 3) {
                var limit_tag = travel.tag.slice(0,3)
                travel_tags.push(limit_tag)
            } else if (travel.tag.length == 0){
                var blank_tag = ['Travel']
                travel_tags.push(blank_tag)
            } else {
                travel_tags.push(travel.tag)
            }

            travel_ownerids.push(travel.owner.id)
            travel_icons.push(icon)
            travel_nicknames.push(travel.owner.nickname)
            travel_likes.push(travel.likes)
            travel_cities.push(travel.owner.cities)
            travel_travels.push(travel.owner.travels)
            travel_liked.push(travel.liked)
            travel_liked_now.push(travel.liked)
          }
          
          that.setData({
            travel_ids: travel_ids,
            travel_covers:travel_covers,
            travel_names:travel_names,
            travel_titles:travel_titles,
            travel_ownerids:travel_ownerids,
            travel_icons:travel_icons,
            travel_nicknames:travel_nicknames,
            travel_likes:travel_likes,
            travel_cities:travel_cities,
            travel_liked:travel_liked,
            travel_liked_now:travel_liked_now,
            // next_travel: res.data.next
            travel_tags: travel_tags
          })
          
          if (travel_num > that.data.travel_ids.length) travel_num = that.data.travel_ids.length
          // no more travels
          
          that.setData({
            travel_num: travel_num,
            pageSize: (travel_num == 0)? 425 : travel_num * 425       
          })
        }
      })        
    },

    thumbsUp: function(res) {
      wx.showLoading({
        title: '加载中'
      })

      var that = this
      var data = {
        cancel: false
      }
      var index = res.currentTarget.id
      var liked = !that.data.travel_liked_now[index]
      var liked_edit = 'travel_liked_now['+index+']'  
      
  
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: utils.server_hostname + '/api/core/travels/' + that.data.travel_ids[index] + '/like/',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        data: data,
        success: function(res) {
          // console.log(res)
          wx.hideLoading({
            success: (res) => {},
          })

          if (res.statusCode == 403 || res.data.error_code == 605) {
            utils.unLogin()
            return
          }
          //unlogin?
  
          if (res.statusCode == 200) {
            that.setData({
              [liked_edit]:liked,
            })
            wx.showToast({
              title: '点赞成功',
              duration: 1000
            })
          }
        },
        fail: function(res) { console.log(res) }
      })
    },
  
    disThumbsUp: function(res) {
      wx.showLoading({
        title: '加载中'
      })

      var that = this
      var data = {
        cancel: true
      }
      var index = res.currentTarget.id
      var liked = !that.data.travel_liked_now[index]
      var liked_edit = 'travel_liked_now['+index+']'
      
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: utils.server_hostname + '/api/core/travels/' + that.data.travel_ids[index] + '/like/',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        data: data,
        success: function(res) {
          // console.log(res)
          wx.hideLoading({
            success: (res) => {},
          })

          if (res.statusCode == 403 || res.data.error_code == 605) {
            utils.unLogin()
            return
          }
          //unlogin?
  
          if (res.statusCode == 200) {
            that.setData({
              [liked_edit]:liked
            })
            wx.showToast({
              title: '点赞已取消',
              duration: 1000
            })
          }
        },
        fail: function(res) { console.log(res) }
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
      var url = utils.server_hostname + "/api/core/companions/recommend/"
      // if (that.data.next_pal == "init") {
      //   url = utils.server_hostname + "/api/core/companions/" 
      // } else {
      //   url = that.data.next_pal
      // }
  
      // if (url == null) {
      //   pal_num = that.data.pal_ids.length
      //   that.setData({
      //     pal_num: pal_num,
      //     pageSize: (pal_num == 0)? 460 : pal_num * 460,
      //   })
      //   // console.log("no more pals")
      //   return
      // }

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

          var pallist = res.data.data
          // var pallist = res.data.results
          // console.log(palllist)
  
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

          for (var i in pallist) {
            var pal = pallist[i]
            // console.log(pal)
            if (pal.forbidden == 1) continue
  
            var icon
            if (pal.owner.icon == null) icon = utils.server_imagename + "/male.png"
            else icon = utils.server_hostname + "/api/core/images/" + pal.owner.icon + "/data/"

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
            // next_pal: res.data.next
          })

          // console.log(that.data)
  
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

    getLocs: function(loc_num) {
      var that = this
      if (loc_num <= that.data.loc_ids.length) {
        that.setData({
          loc_num: loc_num,
          pageSize: (loc_num == 0)? 550 : loc_num * 550,
        })
        return
      }
      var url
      if (that.data.next_loc == "init") {
        url = utils.server_hostname + "/api/core/position/" 
      } else {
        url = that.data.next_loc
      }
  
      if (url == null) {
        loc_num = that.data.loc_ids.length
        that.setData({
          loc_num: loc_num,
          pageSize: (loc_num == 0)? 550 : loc_num * 550,
        })
        // console.log("no more locs")
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
  
          var loclist = res.data.results
          // console.log(loclist)
  
          var loc_ids = that.data.loc_ids
          var loc_covers = that.data.loc_covers
          var loc_images = that.data.loc_images
		      var loc_descriptions = that.data.loc_descriptions
          var loc_names = that.data.loc_names

          for (var i in loclist) {
            var loc = loclist[i]
            // console.log(loc)

            var cover
            if (loc.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
            else cover = utils.server_hostname + "/api/core/images/" + loc.cover + "/data/"
            var description
            if(loc.description == "") description = "暂无地点简介"
            else description = loc.description
            
            loc_ids.push(loc.id)
            loc_covers.push(cover)
            loc_descriptions.push(description)
            loc_names.push(loc.name)
            loc_images.push(loc.images)
          }
  
          that.setData({
            loc_ids: loc_ids,
            loc_covers:loc_covers,
			      loc_descriptions:loc_descriptions,
            loc_names:loc_names,
            loc_images:loc_images,
            next_loc: res.data.next
          })
          
          if (loc_num > that.data.loc_ids.length) loc_num = that.data.loc_ids.length
          // no more locs
          
          that.setData({
            loc_num: loc_num,
            pageSize: (loc_num == 0)? 550 : loc_num * 550       
          })
          // console.log(that.data)
        },
        fail: function(res) { console.log(res); }
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
            // console.log(res)
            if (res.statusCode == 200) {
              that.setData({
                notification: res.data.count > 0
              })
            }
          }
        })
      }
    },

    /**
     * Page event handler function--Called when user drop down
     */
    onPullDownRefresh: function () {
      wx.reLaunch({
        url: '/pages/index/index',
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
        // console.log(1)
        this.getTravels(this.data.travel_num + 3)  
      }
      else if (this.data.showtab == 1) {
        // console.log(1)
        this.getPals(this.data.pal_num + 3)
      }
      else if(this.data.showtab == 2){
        this.getLocs(this.data.loc_num + 3)
      }

      wx.hideLoading({
        success: (res) => {},
      })
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
  

    setTab: function (e) {
    var that = this
      that.setData({
        showtab: e.currentTarget.dataset.tabindex
      })
      if (this.data.currentTab === e.currentTarget.dataset.tabindex) {
        return false;
      } else {
        that.fly(that.data.currentTab,e.currentTarget.dataset.tabindex)
        that.big()
        that.setData({
          currentTab: e.currentTarget.dataset.tabindex,
        })
      }
    },
        /**
        * 滑动切换tab
        */
    bindChange: function (e) {
      var that = this;
      that.fly(that.data.currentTab, e.detail.current)
      that.big()
      
      if (e.detail.current == 0) that.getTravels(that.data.travel_num)
      else if (e.detail.current == 1) that.getPals(that.data.pal_num)
      else if (e.detail.current == 2) that.getLocs(that.data.loc_num)

      that.setData({ 
        currentTab: e.detail.current,
        showtab: e.detail.current
      });
    },
  

    fly:function(from,to){
      this.fly_animation.translateX((to)*this.data.screenwidth/this.data.tab.tabnum).step()
      this.setData({
        fly_animation:this.fly_animation.export()
      })
    },

    big:function(from,to){
      this.big_animation.scale(1.15).step()
      this.setData({
        big_animation:this.big_animation.export()
      })
    },
    

    changeTabbarHomepage: function(){
    },

    changeTabbarMine: function(){
      wx.navigateTo({
        url: '/pages/RealMyzone/RealMyzone',
      })
    },

    navigate2Release: function() {
      utils.navigate2Release()
    },
    navigate2Flight:function(){
      wx.navigateTo({
        url: '/pages/Flight/Flight',
      })
    },
    navigate2Search:function(){
      wx.navigateTo({
        url: '/pages/Search/Search',
      })
    },
    navigate2calendar:function(){
      wx.navigateTo({
        url: '/pages/newSchedule/newSchedule'
      })
    },
    navigate2Travel: function(event) {
      // console.log(event)
      var data = this.data
      var index = parseInt(event.currentTarget.id)
      var travel_id = data.travel_ids[index]
      var author_id = data.travel_ownerids[index]
      var author_icon = data.travel_icons[index]
      var author_nickname = data.travel_nicknames[index]
      var author_cities = data.travel_cities[index]
      var author_travels = data.travel_travels[index]
      utils.navigate2Travel(travel_id, author_id, author_icon, author_nickname, author_cities, author_travels)
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

    navigate2Loc: function(event) {
      // console.log(event)
      var data = this.data
      var index = parseInt(event.currentTarget.id)
      var loc_id = data.loc_ids[index]
      var loc_name = data.loc_names[index]
      var loc_images = JSON.stringify(data.loc_images[index])
      var loc_description = data.loc_descriptions[index]
      var loc_cover = data.loc_covers[index]
      utils.navigate2Loc(loc_id,loc_name,loc_images,loc_description,loc_cover)
    },
    
    navigate2Notification: function() {
      wx.navigateTo({
        url: '/pages/Notification/Notification',
      })
    },

    navigate2SearchResult(e){
      var inputValue = e.detail.value
      wx.navigateTo({
        url: '/pages/SearchResult/SearchResult?value=' + inputValue,
      })
  },

  clear:function(){
    this.setData({
      input_value:""
    })
  },

  navigate2Ad:function(res){
    var id = this.data.ad_ids[parseInt(res.target.id)]
    wx.navigateTo({
      url: '/pages/Advertisement/Advertisement'+"?id="+id,
    })
    // console.log('/pages/Advertisement/Advertisement'+"?id="+id)
  },

  clearDefault:function(){
    if(!this.data.firstTouch){
      return 
    }
    this.setData({
      input_value:"",
      firstTouch:false
    })
  },


  onShareAppMessage: function () {
    return {
      title: 'Tripal: Share Trip With Pal',
      path: '/pages/index/index',
      imageUrl: 'https://tra-fr-2.zhouyc.cc/media/logo.png'
    }
  }
})