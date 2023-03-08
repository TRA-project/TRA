// pages/footprint/footprint.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_imagename,

    rainbow_list:[
      "#3232CDDD",
      "#4D4DFFDD",
      "#007FFFDD",
      "#33C9FFDD",
      "#38B0DEDD"
    ],

    longitude:null,
    latitude:null,
    
    markers:[],
    polyline:[],

    next:"init",

    id:"",
    nickname:"",
    icon:"",
    cities:"",
    travels:"",
    isMine: false,

    southest_city:"",
    northest_city:"",

    recommend_0:"",
    recommend_1:"",
    recommend_2:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)

    this.setData({
      id: options.id,
      nickname: options.nickname,
      icon: options.icon,
      cities: options.cities,
      travels: options.travels,
      isMine: options.id == wx.getStorageSync('id')
    })

    this.getFootprint()
  },

  getFootprint: function() {
    var that = this
    var url
    if (that.data.next == "init") {
      url = utils.server_hostname + '/api/core/travels/positions/?id=' + that.data.id
    } else {
      url = that.data.next
    }

    if (url == null) {
      wx.showToast({
        title: "没有更多足迹啦",
        icon: "none",
        duration: 1000
      })
      return
    }

    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')

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
        
        that.setData({
          next: res.data.next
        })

        var travel_list = res.data.results

        var markers = that.data.markers
        for (var i in travel_list) {
          var travel = travel_list[i]
          // console.log(travel);

          var marker = {
            id: i,    
            longitude: travel.position.longitude,
            latitude: travel.position.latitude,
            callout:{
              content: travel.position.city + " · " + travel.position.name,
              fontSize:25,
              color:"#32cd32",
              bgColor:"#00000000"
            }
          }
          markers.push(marker)
        }

        var polyline = []
        var scale = Math.ceil(markers.length / that.data.rainbow_list.length)
        for (var i = 0; i < markers.length - 1; i++) {
          var poly = {
            points:[
              {
                longitude: markers[i].longitude,
                latitude: markers[i].latitude
              },
              {
                longitude: markers[i + 1].longitude,
                latitude: markers[i + 1].latitude
              }
            ],
            color: that.data.rainbow_list[Math.floor(i / scale)],
            width:10
          }
          polyline.push(poly)
        }

        that.setData({
          markers: markers,
          polyline: polyline,
          longitude: (markers.length > 0)? markers[0].longitude : null,
          latitude: (markers.length > 0)? markers[0].latitude : null
        })

        // console.log(that.data)
        that.analyseFootprint()
      },
      fail: function(res) { console.log(res); }
    })
  },

  analyseFootprint:function() {
    var markers = this.data.markers
    if (markers.length == 0) return
    var southest = markers[0].latitude
    var northest = markers[0].latitude
    var southest_city = markers[0].callout.content
    var northest_city = markers[0].callout.content
    for (var i in markers) {
      var marker = markers[i]
      if (marker.latitude < southest) {
        southest = marker.latitude
        southest_city = marker.callout.content
      }
      if (marker.latitude > northest) {
        northest = marker.latitude
        northest_city = marker.callout.content
      }
    }

    this.setData({
      southest_city: southest_city,
      northest_city: northest_city
    })

    var that = this
    if (that.data.isMine) {
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: utils.server_hostname + "/api/core/position/recommend/",
        data: {
        },
        method: 'GET',
        header: {
        'content-type': 'application/json',
        'token-auth': token
        },
        success: function(res) {
          // console.log(res);
          var loclist = res.data.data
  
          for (var i in loclist) {
            var loc = loclist[i]
            // console.log(loc)

            var latitude = loc.latitude
            var longitude = loc.longitude
            that.getRecommend(i, latitude, longitude)
          }
          // console.log(that.data)
        },
        fail: function(res) { console.log(res); }
      })
    }
  },

  getRecommend: function(index, latitude, longitude) {
    var that = this
    var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" 
    + latitude + "," + longitude + "&key=" + utils.subkey;
    wx.request({        
      url: getAddressUrl,
      success: function (address) {   
        address = address.data.result   
        // console.log(address)
        var recommend = address.address_component.province
        if (recommend != address.address_component.city) {
          recommend = recommend + address.address_component.city
        }
        if (index == 0) that.setData({ recommend_0: recommend })
        else if (index == 1) that.setData({ recommend_1: recommend })
        else if (index == 2) that.setData({ recommend_2: recommend })
        else return
      },
      fail: function(res) { console.log(res) }
    })

  }
})