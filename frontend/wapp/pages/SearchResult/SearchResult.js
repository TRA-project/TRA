// pages/searchresult/searchresult.js
const { server_hostname } = require("../../utils/util.js");
const utils = require("../../utils/util.js");

Page({

    /**
     * Page initial data
     */
    data: {
      server_hostname: utils.server_hostname,
      server_imagename: utils.server_imagename,

    input : "潘子劝嘎子不要学爽子",
    show_tab: 0, //顶部选项卡索引
    current_tab: 0,// tab切换
    show: false,
    tab: {
        tabnum: 4,
        tabitem: [
        {
            "id": 0,
            "text": "游记",
        },   
        {
          "id": 1,
          "text": "用户",
        }, 
        {
            "id": 2,
            "text": "同行",
        },
        {
            "id": 3,
            "text": "地点"
        }
        ]
      },

    users:[
      {
        src:"/images/background.png",
        nickname:"lulalulalula",
        fans:100,
        concerned:false
      },
      {
        src:"/images/bg.jpg",
        nickname:"lulalulalulaasdasdasdsad",
        fans:1000,
        concerned:false
      },
      {
        src:"/images/bg_1.jpg",
        nickname:"emmmm",
        fans:10000,
        concerned:true
      },
    ],

    pageSize: 1260,
    pageSizeUnit:375,
    travelPageSize:375,
    userPageSize:375,
    palPageSize:375,
    locPageSize:375,

    search_value:"",

    travelEmpty: false,
    userEmpty:false,
    palEmpty:false,
    locEmpty:false,
    
    hasMoreTravel: false,
    hasMoreUser:false,
    hasMorePal:false,
    hasMoreLoc:false,

    nextTravel:'init',
    nextUser:'init',
    nextPal:'init',
    nextLoc:'init',


    travel_ids:[],
    travel_covers:[],
    travel_names:[],
    travel_titles:[],
    travel_ownerids:[],
    travel_icons:[],
    travel_nicknames:[],
    travel_likes:[],
    travel_liked:[],
    travel_liked_now:[],
    travel_cities:[],
    travel_travels:[],

    users_ids:[],
    users_icons:[],
    users_fans:[],
    users_nicknames:[],
    users_concerned:[],

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
    loc_images :[],
		loc_descriptions:[],
    loc_names:[],



    tabbar_homepage : true,
    tabbar_mine : false,

    tabbar_3: true,//tabbar中有3个
    tabbar_1: false,//tabbar中有1个

    mylist: [],
    data_order_travel: 2,
    data_order_pal:2,
    data_order_text:[
        '最早发布',
        '最新发布',
        '推荐内容'
    ]

    },

    getbytag: function() {
        var that = this
        var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

        wx.request({
            url: utils.server_hostname +  '/api/core/travels/',
            data: {
                tag: that.data.search_value
            },
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'token-auth':token
            },
            success: function (res) {
                console.log('by tag' + that.data.search_value, res.data.results)
                that.setData({
                    mylist: res.data.results
                })
            },
            fail: function (res) {
                console.log(res)
            }
        })
    },

    bindsortTra: function () {
        var index = (this.data.data_order_travel + 1) % 3
        this.setData({
            data_order_travel: index,
            travel_ids: [],
            travel_covers:[],
            travel_names:[],
            travel_titles:[],
            travel_ownerids:[],
            travel_icons:[],
            travel_nicknames:[],
            travel_likes:[],
            travel_cities:[],
            travel_travels:[],
            travel_liked:[],
            travel_liked_now:[],
        })
        //console.log('old'+this.data.pageSize+this.data.palPageSize)
        this.getTravels()
        //console.log('after travel'+this.data.pageSize+this.data.palPageSize)
        //console.log('after pal'+this.data.pageSize+this.data.palPageSize)
    },

    bindsortPal:function () {
        var index = (this.data.data_order_pal + 1) % 3
        this.setData({
            data_order_pal: index,
            pal_ids: [],
            pal_titles: [],
            pal_startTimes: [],
            pal_endTimes: [],
            pal_locations: [],
            pal_nums: [],
            pal_capacities: [],
            pal_ownerids: [],
            pal_icons: [],
            pal_nicknames: [],
            pal_genders: [],
            pal_cities: [],
            pal_travels: [],
        })
        //console.log('old'+this.data.pageSize+this.data.palPageSize)
        this.getPals()
        //console.log('after travel'+this.data.pageSize+this.data.palPageSize)
        //console.log('after pal'+this.data.pageSize+this.data.palPageSize)
    },

    getTravels: function() {
      var that = this
      
      var url
      url = utils.server_hostname + "/api/core/travels/?title="+that.data.search_value

      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      var userid = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')

      // console.log('token', token)

      if(that.data.nextTravel != "init"){
        url = that.data.nextTravel
      }
      

      var search_title = ""
      var search_tag = ""
      var str = that.data.search_value
      var i
      if (str[0] == '#') {
          i = 1
          for (i = 1; i < str.length; ++i) {
              if (str[i] == '#') {
                  search_title = str.substring(i+1)
                  break
              } else {
                  search_tag += str[i]
              }
          }
      } else {
          search_title = str
      }

      console.log('search value is', '6'+that.data.search_value + '6')
      console.log('search title is', '6'+search_title + '6')
      console.log('search tag is', '6'+search_tag + '6')
    

      if (search_title.length != 0) {
          wx.request({
        url: server_hostname + '/api/core/travels/',
        data: {
            title: search_title,
            tag: search_tag
        },
        method: 'GET',
        header: {
        'content-type': 'application/json',
        'token-auth':token
        },
        success: function(res) {
           console.log('by title' + that.data.search_value, res.data.results);
  
          var travellist = res.data.results
        
  
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


          /*console.log('准备加', that.data.mylist.length)
          for (var j in that.data.mylist) {
              var tagtravel = that.data.mylist[j]
              travellist.push(tagtravel)
              console.log('加进去了')
          }
          console.log('加入结束了')*/

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
            travel_travels:travel_travels,
            travel_liked:travel_liked,
            travel_liked_now:travel_liked_now,
            nextTravel: res.data.next
          })
          
          url = that.data.nextTravel
          if(url == null){
            that.setData({
              hasMoreTravel:false
            })
          }else{
            that.setData({
              hasMoreTravel:true
            })
          }
  
          var len = that.data.travel_ids.length
          var travelPageSize
          if(len == 0){
            travelPageSize = 600
            that.setData({
              travelEmpty:true
            })
          }else{
            travelPageSize = len * 430
          }
          
          that.setData({
            pageSize: travelPageSize,
            travelPageSize: travelPageSize        
          })
        },
        fail: function(res) { console.log(res); }
          })
      } else {
          wx.request({
            url: server_hostname + '/api/core/travels/tag_query/',
            data: {
                order: that.data.data_order_travel,
                tag: search_tag
            },
            method:'GET',
            header: {
                'content-type': 'application/json',
                'token-auth':token
            },
            success: function(res) {
                console.log('special tag' + that.data.search_value, res.data.results);
       
               var travellist = res.data.results
             
       
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
     
     
               /*console.log('准备加', that.data.mylist.length)
               for (var j in that.data.mylist) {
                   var tagtravel = that.data.mylist[j]
                   travellist.push(tagtravel)
                   console.log('加进去了')
               }
               console.log('加入结束了')*/
               console.log('number is',that.data.travel_ids.length)
     
               for (var i in travellist) {
                 var travel = travellist[i]
                 // console.log(travel)
                 if (travel.forbidden == 1) {
                     if (travel.owner.id != userid) {
                         continue
                     }
                 }
       
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
                 travel_travels:travel_travels,
                 travel_liked:travel_liked,
                 travel_liked_now:travel_liked_now,
                 nextTravel: res.data.next
               })
               
               url = that.data.nextTravel
               if(url == null){
                 that.setData({
                   hasMoreTravel:false
                 })
               }else{
                 that.setData({
                   hasMoreTravel:true
                 })
               }
       
               var len = that.data.travel_ids.length
               var travelPageSize
               if(len == 0){
                 travelPageSize = 600
                 that.setData({
                   travelEmpty:true
                 })
               }else{
                 travelPageSize = len * 430
               }
               
               that.setData({
                 pageSize: travelPageSize,
                 travelPageSize: travelPageSize        
               })
               console.log('size in tra',that.data.pageSize,that.data.travelPageSize)
             },
             fail: function(res) { console.log(res); }
          })
      }
      
    },

    getUsers: function(user_num) {
      var that = this

      var url
      url = utils.server_hostname + "/api/core/users/?nickname="+that.data.search_value
      if(that.data.nextUser != "init"){
        url = that.data.nextUser
      }
      
      wx.request({
        url: url,
        data: {
        },
        method: 'GET',
        header: {
        'content-type': 'application/json',
        'token-auth': wx.getStorageSync('token')
        },
        success: function(res) {
          // console.log(res);
  
          var userlist = res.data.results
          // console.log(userlist)

          var len  = userlist.length
          if (len == 0){
           that.setData({
             userEmpty:true
           })
          }
        
          var users_ids = that.data.users_ids
          var users_icons = that.data.users_icons
          var users_fans = that.data.users_fans
          var users_nicknames = that.data.users_nicknames
          var users_concerned = that.data.users_concerned

          for (var i in userlist) {
            var user = userlist[i]
  
            var icon
            if (user.icon == null) icon = utils.server_imagename + "/male.png"
            else icon = utils.server_hostname + "/api/core/images/" + user.icon + "/data/"

            users_ids.push(user.id)
            users_nicknames.push(user.nickname)
            users_fans.push(user.subscribers)
            users_icons.push(icon)
            users_concerned.push(user.subscribed)
          }
  
          that.setData({
            users_ids: users_ids,
            users_nicknames:users_nicknames,
            users_icons:users_icons,
            users_fans:users_fans,
            users_concerned:users_concerned,
            nextUser:res.data.next
          })
  
          url = that.data.nextUser
          if(url == null){
            that.setData({
              hasMoreUser:false
            })
          }else{
            that.setData({
              hasMoreUser:true
            })
          }

          var len = that.data.users_ids.length
          var userPageSize
          if(len == 0){
            userPageSize = 600
            that.setData({
              userEmpty:true
            })
          }else{
            userPageSize = len * 185
          }
          that.setData({
            pageSize: userPageSize,
            userPageSize: userPageSize        
          })
        },
        fail: function(res) { console.log(res); }
      })
    },

    getPals: function() {
      var that = this
      var url
      url = utils.server_hostname + "/api/core/companions/?content="+that.data.search_value

      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

      if(that.data.nextPal != "init"){
        url = that.data.nextPal
      }

      var search_title = ""
      var search_tag = ""
      var str = that.data.search_value
      var i
      if (str[0] == '#') {
          i = 1
          for (i = 1; i < str.length; ++i) {
              if (str[i] == '#') {
                  search_title = str.substring(i+1)
                  break
              } else {
                  search_tag += str[i]
              }
          }
      } else {
          search_title = str
      }

      console.log('search tag is', search_tag)

      wx.request({
        url: utils.server_hostname + '/api/core/companions/tag_query/',
        data: {
            order:that.data.data_order_pal,
            tag:search_tag
        },
        method: 'GET',
        header: {
            'content-type': 'application/json',
            'token-auth':token
        },
        success: function(res) {
           console.log('pal data',res.data);

          var pallist = res.data.results
        //   console.log('pal is',pallist)
  
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
            nextPal: res.data.next
          })

          url = that.data.nextPal
          if(url == null){
            that.setData({
              hasMorePal:false
            })
          }else{
            that.setData({
              hasMorePal:true
            })
          }
  
          // console.log(pallist)
          var len = that.data.pal_ids.length
          var palPageSize
          if(len == 0){
            palPageSize = 600
            that.setData({
              palEmpty:true
            })
          }else{
            palPageSize = 450 * len
          }
          that.setData({
            pageSize: palPageSize,
            palPageSize: palPageSize        
          })
          console.log('size in pal',that.data.pageSize,that.data.palPageSize)
        },
        fail: function(res) { console.log(res); }
      })
    },

    getLocs: function() {
      var that = this
      var url
      url = utils.server_hostname + "/api/core/position/?name="+that.data.search_value

      if(that.data.nextLoc != "init"){
        url = that.data.nextLoc
      }
      wx.request({
        url: url,
        data: {
        },
        method: 'GET',
        header: {
          'content-type': 'application/json',
        },
        success: function(res) {
          // console.log(res);
          var loclist = res.data.results

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
            nextLoc: res.data.next
          })

          url = that.data.nextLoc
          if(url == null){
            that.setData({
              hasMoreLoc:false
            })
          }else{
            that.setData({
              hasMoreLoc:true
            })
          }
  
          var len = that.data.loc_ids.length
          var locPageSize
          if(len == 0){
            locPageSize = 600
            that.setData({
              locEmpty:true
            })
          }else{
            locPageSize = 530 * len
          }
          that.setData({
            pageSize: locPageSize,
            locPageSize: locPageSize
          })
        },
        fail: function(res) { console.log(res); }
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
      // console.log(res)
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

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
      var that = this
      this.setData({
        search_value:options.value
      })
      //this.getbytag()
      this.getTravels()
    },

    clearInput: function(){
        this.setData({
            input:""
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
            var tab = e.detail.current
            if(tab == 0){
                console.log('travelsize' + that.data.pageSize + ' ' + that.data.travelPageSize)
              if (that.data.nextTravel == 'init') {
                  //that.getbytag()
                  that.getTravels()
                }
              else {
                that.setData({
                  pageSize:that.data.travelPageSize
                })
              }
            }else if(tab == 1){
              if (that.data.nextUser == 'init') that.getUsers()
              else {
                that.setData({
                  pageSize:that.data.userPageSize
                })
              }
            }else if(tab == 2){
                console.log('palsize' + that.data.pageSize + ' ' + that.data.palPageSize)
              if (that.data.nextPal == 'init') that.getPals()
              else {
                that.setData({
                  pageSize:that.data.palPageSize
                })
              }
            }else if(tab == 3){
              if (that.data.nextLoc == 'init') that.getLocs()
              else {
                that.setData({
                  pageSize:that.data.locPageSize
                })
              }
            }
          },

          concern:function(e){
            var that = this
            var index= Number(e.currentTarget.id)
            var concerned  = this.data.users_concerned
            var fans = this.data.users_fans
            var data = {
              id: that.data.users_ids[index],
              cancel: false
            }
    
            if (parseInt(that.data.users_ids[index]) == parseInt(wx.getStorageSync('id'))) {
              wx.showToast({
                title: '无法关注自己',
                duration: 1000,
                icon:'error'
              })
            }
            else {
              wx.showLoading({
                title: '加载中'
              })

              wx.request({
                url: utils.server_hostname + '/api/core/users/subscribe/',
                method: 'POST',
                header: {
                  'content-type': 'application/json',
                  'token-auth': wx.getStorageSync('token')
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
                    wx.showToast({
                      title: '关注成功',
                      duration: 1000
                    })
                    concerned[index] = !concerned[index]
                    fans[index] = fans[index] + 1
                    that.setData({
                      users_concerned: concerned,
                      users_fans: fans
                    })
                  }
                },
                fail: function(res) { console.log(res) }
              })
            }
        },
    
        cancelConcern:function(e){
            wx.showLoading({
              title: '加载中'
            })

            var that = this
            var index= Number(e.currentTarget.id)
            var concerned  = this.data.users_concerned
            var fans = this.data.users_fans
            var data = {
              id: that.data.users_ids[index],
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
                  wx.showToast({
                    title: '取消关注成功',
                    duration: 1000
                  })
                  concerned[index] = !concerned[index]
                  fans[index] = fans[index] - 1
                  that.setData({
                    users_concerned: concerned,
                    users_fans: fans
                  })
                }
              },
              fail: function(res) { console.log(res) }
            })
        },

      navigate2Search: function(){
        wx.navigateBack({
          delta: 1,
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

      navigate2User: function(event) {
        // console.log(event)
        var index = parseInt(event.currentTarget.id)
        // console.log('/pages/OtherZone/OtherZone?id=' + this.data.users_ids[index])
        wx.navigateTo({
          url: '/pages/OtherZone/OtherZone?id=' + this.data.users_ids[index],
        })
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

      showMoreTravel:function(){
          //this.getbytag()
        this.getTravels()
      },

      showMoreUser:function(){
        this.getUsers()
      },

      showMorePal:function(){
        this.getPals()
      },

      showMoreLoc:function(){
        this.getLocs()
      },


      redirect2SearchResult:function(e){
        var inputValue = e.detail.value
        wx.redirectTo({
          url: '/pages/SearchResult/SearchResult?value=' + inputValue,
        })
      },

      clear:function(){
        this.setData({
          search_value:""
        })
      }
})