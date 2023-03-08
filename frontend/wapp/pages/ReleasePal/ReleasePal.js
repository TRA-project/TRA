// pages/launch/launch.js
const utils = require("../../utils/util.js");

function Loc(name) {
  this.name = name;
}

var currentDateTime = new Date()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:true,

    title:"",
    startDate:"请选择开始日期",
    startTime:"请选择开始时间",
    endDate:"请选择结束日期",
    endTime:"请选择结束时间",
    deadDate:"请选择截止日期",
    deadTime:"请选择截止时间",
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
    locName:"请选择活动地点",
    capacity:"-1",
    content:"",
    schdate:"",
    schtitle:"",
    tagset:[

    ]
  },

  openEditor() {
    console.log('open~');
    this.setData({
      showEditor: true,
    })
  },

  // 关闭编辑器-------------------------
  switchEditor(e) {
    console.log("switch-editor",e.detail)
    console.log('here close in pare', this.data.showEditor)
    this.setData({
      showEditor: false,
    })
    console.log('here close in pare', this.data.showEditor)
  },

  deletetag: function(e) {
    console.log(e.currentTarget.dataset.tagname)
    let tagname = e.currentTarget.dataset.tagname
    let newset = new Array()
    for(let i = 0; i < this.data.tagset.length; ++i) {
        if(this.data.tagset[i] != tagname) {
            newset.push(this.data.tagset[i])
        } 
    }
    this.setData({
        tagset: newset
    })
  },

  addnewtag(e) {
    console.log('main add')
    const tagset = this.data.tagset
    var newtag = e.detail
    tagset.push(newtag)
    console.log(this.data.tagset)
    this.setData({
        tagset
    })
  },

  testtitle() {
      console.log('title is ',this.data.title)
  },


  onSubmit: function() {
    var that = this
    var formatCheck = ""
    var isSpace = /^\s+$/.test(this.data.title)
    if (this.data.title == "") {
        formatCheck = "请输入标题" 
        console.log('title is', this.data.title)
    }
    else if (isSpace) {
        formatCheck = "标题不能为空格"
    }
    else if (this.data.startDate == "请选择开始日期") formatCheck = "请选择开始日期"
    else if (this.data.startTime == "请选择开始时间") formatCheck = "请选择开始时间"
    else if (this.data.endDate == "请选择结束日期") formatCheck = "请选择结束日期"
    else if (this.data.endTime == "请选择结束时间") formatCheck = "请选择结束时间"
    else if (this.data.location.latitude == -1) formatCheck = "请选择活动地点"
    else if (this.data.schdate == null) formatCheck = "请绑定日程时间"
    else if (!(/(^[1-9]\d*$)/.test(this.data.capacity))) formatCheck = "活动人数不合法"
    else if (this.data.deadDate == "请选择截止日期") formatCheck = "请选择截止日期"
    else if (this.data.deadTime == "请选择截止时间") formatCheck = "请选择截止时间"
    else if (this.data.content == '') formatCheck = "请输入活动详情描述"
    else {
      var year = parseInt(currentDateTime.getFullYear())
      var month = parseInt(currentDateTime.getMonth())
      var day = parseInt(currentDateTime.getDate())
      var hour = parseInt(currentDateTime.getHours())
      var minute = parseInt(currentDateTime.getMinutes())
      var date = this.data.deadDate.split("-")

      if (parseInt(date[0]) < year) formatCheck = "截止早于现在"
      else if (parseInt(date[0]) == year) {
        if (parseInt(date[1]) < month + 1) formatCheck = "截止早于现在"
        else if (parseInt(date[1]) == month + 1) {
          // console.log(1)
          if (parseInt(date[2]) < day) formatCheck = "截止早于现在"
          else if (parseInt(date[2]) == day) {
            var time = this.data.deadTime.split(":")
            if (parseInt(time[0]) < hour) formatCheck = "截止早于现在"
            else if (parseInt(time[0]) == hour && parseInt(time[1]) <= minute)  formatCheck = "截止早于现在"
          }
        }
      }

      var start_time = that.data.startDate + 'T' + that.data.startTime
      var end_time = that.data.endDate + 'T' + that.data.endTime
      var deadline = that.data.deadDate + 'T' + that.data.deadTime

      if (end_time <= start_time) formatCheck = "结束早于开始"
      else if (deadline > end_time) formatCheck = "截止晚于结束"
    }

    if (formatCheck != "") {
      wx.showToast({
        title: formatCheck,
        icon: 'error',
        duration: 1000
      })
      return
    }

    var qiuqiule = ''
    for (let i = 0; i < that.data.tagset.length; ++i) {
        qiuqiule = qiuqiule + that.data.tagset[i] + " "
    }

    var that = this;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.showLoading({
      title: '上传中',
    })
    
    // console.log(that.data.startDate + 'T' + that.data.startTime)
    // console.log(that.data.endDate + 'T' + that.data.endTime)
    // console.log(that.data.deadDate + 'T' + that.data.deadTime)
    // console.log(that.data.title)
    // console.log(that.data.content)
    // console.log(that.data.capacity)
    // console.log(that.data.location)

    wx.request({
      url: utils.server_hostname + "/api/core/companions/",
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        start_time: that.data.startDate + 'T' + that.data.startTime,
        end_time: that.data.endDate + 'T' + that.data.endTime,
        deadline: that.data.deadDate + 'T' + that.data.deadTime,
        title: that.data.title,
        content: that.data.content,
        capacity: that.data.capacity,
        position: that.data.location,
        schedule_date:utils.noZeroDate(that.data.schdate),
        schedule_title:that.data.schtitle,
        tag: qiuqiule
      },

      success: function(data) {
        // console.log(data);
        wx.hideLoading({
          success: (res) => {},
        })
        
        if (data.data.error_code == 605 || data.data.error_code == 400) {
          utils.loginExpired()
          return
        }
        // loginExpired
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 500
        })

        setTimeout(function () {
          var pages = getCurrentPages();
          var url = '/' + pages[pages.length - 2].route

          wx.navigateBack({
            delta: 1,
          })

          if (url == "/pages/MyZone/MyZone") {
            wx.redirectTo({
              url: url,
            })
          }
        }, 500)
      },
      fail: function(res) { console.log(res); }
    })
  },

  bindPinkerchange: function(e) {
    console.log('pinker selecting:', e.detail.value)
    this.setData({
      col_index:e.detail.value
    })
  },

  inputTitle: function(e) {
     console.log("标题为" + e.detail.value)
    this.setData({
      title:e.detail.value
    })
  },

  startDateChange: function(e) {
    // console.log("开始日期修改为" + e.detail.value)
    this.setData( {
      startDate:e.detail.value
    })
  },

  startTimeChange: function(e) {
    // console.log("开始时间修改为" + e.detail.value)
    this.setData( {
      startTime:e.detail.value
    })
  },

  endDateChange: function(e) {
    // console.log("结束日期修改为" + e.detail.value)
    this.setData({
      endDate:e.detail.value
    })
  },

  endTimeChange: function(e) {
    // console.log("结束时间修改为" + e.detail.value)
    this.setData({
      endTime:e.detail.value
    })
  },

  deadDateChange: function(e) {
    // console.log("截止日期修改为" + e.detail.value)
    this.setData( {
      deadDate:e.detail.value
    })
  },
  changeSchDate: function(e) {
    console.log(e.detail.value);
    this.setData({
      schdate:e.detail.value
    })
  },

  deadTimeChange: function(e) {
    // console.log("截止时间修改为" + e.detail.value)
    this.setData({
      deadTime:e.detail.value
    })
  },

  setLoc:function (){
    var that = this;
    utils.authorize()
    wx.chooseLocation({
      success: function (res) {
        // console.log(res)

        var name = res.name
        var latitude = res.latitude
        var longitude = res.longitude
        var locAddress = res.address

        var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" 
        + latitude + "," + longitude + "&key=" + utils.subkey;
        wx.request({        
          url: getAddressUrl,
          success: function (address) {   
            address = address.data.result   
            // console.log(address)

            that.setData({
              location: {
                latitude: latitude,
                longitude: longitude,
                name: name,
                address: address.address_component
              },
              locName: locAddress + ' · ' + name
            })
            // console.log(that.data)
          },
          fail: function(res) { console.log(res) }
        })
      },
      fail: function(res) { console.log(res); }
    })
  },

  capacityInput: function(e) {
    // console.log("容量为" + e.detail.value)
    this.setData({
      capacity:e.detail.value
    })
  },

  inputDetail:function(e) {
    // console.log("活动详情修改为" + e.detail.value)
    this.setData({
      content:e.detail.value
    })
  },

  onLoad:function(){
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:true
    });
  },
  navigate2Cal:function(){
    wx.navigateTo({
      url: '../newSchedule/newSchedule?release=1&dateString='+this.data.schdate,
    })
},
deletesch:function(){
  this.setData({
    schdate:"",
    schtitle:"添加日程",
  })
}
})