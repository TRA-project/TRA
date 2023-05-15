// pages/travelHotelRestaurant/travelHotelRestaurant.js
const utils = require("../../utils/util.js");
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: "",
    longitude: "",
    hotels: [],
    restaurants: [],
    selected: [],
    numSelected: 0,
    place: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // options包含sceneryId

    let token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
    let sceneryId = options.sceneryId;
    let that = this;
    wx.request({
      url: utils.server_hostname + "/api/core/sights/" + sceneryId + "/",
      header: {
        'token-auth': token
      },
      success(res) {
        if (res.statusCode == 200) {
          that.setData({
            latitude: res.data.address.latitude,
            longitude: res.data.address.longitude,
            place: res.data.name
          });
          that.getHotels()
          that.getRestaurants()
        } else {
          Toast.fail(`加载景点位置信息失败！statusCode = ${res.statusCode}`);
        }
      },
      fail(err) {
        Toast.fail(`加载景点位置信息失败！${err}`);
      }
    });
  },

  getHotels() {
    let that = this
    wx.request({
      url: "https://api.map.baidu.com/place/v2/search",
      method: "GET",
      data: {
        location: `${that.data.latitude},${that.data.longitude}`,
        ak: utils.baiduMapAk,
        query: "酒店",
        output: "json"
      },
      success(res) {
        let results = res.data.results
        console.log(res)
        for (let i = 0; i < results.length; i++) {
          results[i].distance = utils.GetDistance(results[i].location.lat, results[i].location.lng, that.data.latitude, that.data.longitude);
          results[i].distance = Number(results[i].distance).toFixed(2);
        }
        that.setData({
          hotels: results
        })
        console.log(results)
      }
    })
  },

  getRestaurants() {
    let that = this
    wx.request({
      url: "https://api.map.baidu.com/place/v2/search",
      method: "GET",
      data: {
        location: `${that.data.latitude},${that.data.longitude}`,
        ak: utils.baiduMapAk,
        query: "餐饮",
        output: "json"
      },
      success(res) {
        let results = res.data.results
        console.log(res)
        for (let i = 0; i < results.length; i++) {
          results[i].distance = utils.GetDistance(results[i].location.lat, results[i].location.lng, that.data.latitude, that.data.longitude);
          results[i].distance = Number(results[i].distance).toFixed(2);
        }
        that.setData({
          restaurants: results
        })
        console.log(results)
      }
    })
  },

  // TODO: 可能需要在app.json里面注册自己需要使用查询位置的接口
  // 正式版发布需要在微信中提交审核
  getLoc: function (callback){
    let that = this
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      success (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        callback()
      },
      fail (res) {
        console.log(`获取位置信息失败：${res}`)
      }
    })
  },

  onSave() {
    // 下面的代码转移到travelPlanFinish页面实现
    // wx.requestSubscribeMessage({
    //   tmplIds: [utils.plan_notification_id], // 向用户推送行程提醒消息
    //   success: () => {
    //     console.log("success")
    //   }, 
    //   fail: (res) => {
    //     console.log(`failed: ${res.errCode}, ${res.errMsg}`)
    //     console.log("template id:", utils.plan_notification_id)
    //   }
    // })
    // wx.reLaunch({
    //   url: "/pages/home/home",
    // })
    wx.navigateBack() // 返回上一级
  },

  onSelect(e) {
    let name = e.currentTarget.dataset['name']
    let selected = this.data.selected
    if (e.detail === true) {
      if (selected.indexOf(name) === -1) {
        selected.push(name)
      }
    } else {
      let i = selected.indexOf(name)
      if (i !== -1) {
        selected = selected.filter(item => item !== name);
      }
    }
    // console.log(selected)
    this.setData({
      numSelected: selected.length,
      selected: selected
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