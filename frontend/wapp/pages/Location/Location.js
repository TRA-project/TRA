// pages/locs.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_imagename,
    
    locs:{
      id:0,
      name:"",
      cover:null,
      images:[],
      description:"",
    },

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

    travel_num:4,
    next_travel:"init",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    var that = this
    var images = []
    var list = JSON.parse(options.loc_images)
    for (var i in list) {
      images.push(utils.server_hostname + '/api/core/images/' + list[i] + '/data/')
    }

    that.setData({
      locs: {
        id:options.loc_id,
        name:options.loc_name,
        images:images,
        description:options.loc_description,
        cover:options.loc_cover,
      },
    })

    that.getTravels(that.data.travel_num)
  },

  onReachBottom: function () {
    wx.showLoading({
      title: '加载中'
    })
    
    this.getTravels(this.data.travel_num + 4)  

    wx.hideLoading({
      success: (res) => {},
    })
  },

  getTravels: function(travel_num) {
    var that = this
    if (travel_num <= that.data.travel_ids.length) {
      that.setData({
        travel_num: travel_num
      })
      return
    }
    var url
    if (that.data.next_travel == "init") {
      url = utils.server_hostname + '/api/core/travels/?position=' + that.data.locs.id
    } else {
      url = that.data.next_travel
    }

    if (url == null) {
      travel_num = that.data.travel_ids.length
      that.setData({
        travel_num: travel_num,
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
          travel_liked:travel_liked,
          travel_liked_now:travel_liked_now,
          next_travel: res.data.next
        })
        // console.log(that.data.travel_liked)
        if (travel_num > that.data.travel_ids.length) travel_num = that.data.travel_ids.length
        
        that.setData({
          travel_num: travel_num,     
        })
      }
    })        
  },

  thumbsUpRelative: function(res) { 
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
          wx.showToast({
            title: '登陆后才能点赞哦',
            icon: 'none',
            duration: 1000
          })
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

  disThumbsUpRelative: function(res) { 
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
          wx.showToast({
            title: '登陆后才能取消点赞哦',
            icon: 'none',
            duration: 1000
          })
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

  preview: function(event) {
    wx.previewImage({
      current: event.currentTarget.id,
      urls: this.data.locs.images
    })
  }

//   onShareAppMessage: function (res) {
//     // var id = this.data.locs.id
//     var imageUrl = this.data.locs.cover
//     var url = '/pages/Location/Location?'
//     // that.setData({
//     //   locs: {
//     //     id:options.loc_id,
//     //     name:options.loc_name,
//     //     images:images,
//     //     description:options.loc_description,
//     //     cover:options.loc_cover,
//     //   },
//     // })
//     var locs = this.data.locs
//     url = url + "loc_id=" + locs.id
//     url = url + "&" + "loc_name=" + locs.name
//     url = url + "&" + "loc_images=" + locs.images
//     url = url + "&" + "loc_description=" + locs.description
//     url = url + "&" + "loc_cover=" + locs.cover
//     console.log(url)
//     return {
//       title: 'Tripal: Find a Nice Place',
//       path: url,
//       imageUrl: imageUrl
//     }
//   }
})