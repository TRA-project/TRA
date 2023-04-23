// pages/travelHotelRestaurant/travelHotelRestaurant.js
const utils = require("../../utils/util.js");

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // // 使用示例
    // const distance = this.GetDistance(39.923423, 116.368904, 39.922501, 116.387271);
    // console.log(distance);
    this.getLoc(() => {
      this.getHotels()
      this.getRestaurants()
    })
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
          results[i].distance = that.GetDistance(results[i].location.lat, results[i].location.lng, that.data.latitude, that.data.longitude);
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
          results[i].distance = that.GetDistance(results[i].location.lat, results[i].location.lng, that.data.latitude, that.data.longitude);
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

  // 获取到两地距离
  GetDistance( lat1,  lng1,  lat2,  lng2){
    var radLat1 = lat1*Math.PI / 180.0;
    var radLat2 = lat2*Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
  },

  onSave() {
    wx.requestSubscribeMessage({
      tmplIds: [utils.plan_notification_id], // 向用户推送行程提醒消息
      success: () => {
        console.log("success")
      }, 
      fail: (res) => {
        console.log(`failed: ${res.errCode}, ${res.errMsg}`)
        console.log("template id:", utils.plan_notification_id)
      }
    })
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