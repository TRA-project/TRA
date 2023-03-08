// pages/Release/Release.js
const utils = require("../../utils/util.js");

Page({
  data: {
    show:false,

    server_imagename: utils.server_imagename,

    cover_url: utils.server_imagename + '/cover.jpg',
    img_url: [],
    title:'',
    content:'',
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
    access:1,
    access_list: ["公开","仅自己可见"],
    col_index: 0,
    col_array: ["默认合集", "夏季出行", "秋季出行"],
    tagset: [
        '游记','美食'
    ],
    collections:[],
    schdate:"",
    schtitle:"",
  },
  
  changeSchDate: function(e) {
    console.log(e.detail.value);
    this.setData({
      schdate:e.detail.value
    })
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
    let flag = true
    for (let i = 0; i < tagset.length; i++) {
        if (tagset[i] == newtag) {
            flag = false
            break;
        }
    }
    if (flag == true) {
        tagset.push(newtag)
    }
    console.log(this.data.tagset)
    this.setData({
        tagset
    })
 },

 getcollection: function () {
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

    wx.request({
      url: utils.server_hostname +  '/api/core/travelcollection/',
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },

      success: function (res) {
          var newdata = new Array()
          newdata = res.data.results
          var new_array = new Array()

          console.log(res)
          for(let i = 0; i < newdata.length; ++i) {
              var temp = newdata[i].title
              new_array.push(temp)
          }

          that.setData({
              collections: newdata,
              col_array: new_array
          })
      },
      fail: function (res) {console.log(res)}
    })
},

  //发布按钮事件
  post:function(){
    var formatCheck = ""
    var isSpace = /^\s+$/.test(this.data.title)
    if (this.data.title == "") formatCheck = "请输入标题"
    else if (isSpace) formatCheck = "标题不能为空格" 
    else if (this.data.content == "") formatCheck = "请输入正文"
    else if (this.data.location.latitude == -1) formatCheck = "请添加地点"
    else if (this.data.location.latitude == -1) formatCheck = "请添加地点"
    if (formatCheck != "") {
      wx.showToast({
        title: formatCheck,
        icon: 'error',
        duration: 1000
      })
      return
    }

    var that = this;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    var col_id = 0

    for (let i = 0; i < that.data.collections.length; ++i) {
        if (that.data.collections[i].title == that.data.col_array[this.data.col_index]) {
            col_id = that.data.collections[i].id
            console.log('find col id', col_id)
        }
    }

    var qiuqiule = ''
    for (let i = 0; i < that.data.tagset.length; ++i) {
        qiuqiule = qiuqiule + that.data.tagset[i] + " "
    }

    console.log(qiuqiule)

    wx.showLoading({
      title: '上传中',
    })

     console.log(that.data.location)
     console.log(that.data.schdate)

    wx.request({
      url: utils.server_hostname + "/api/core/travels/",
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        title: that.data.title,
        content: that.data.content,
        position: that.data.location,
        visibility: that.data.access,
        collection: col_id,
        tag: qiuqiule,
        schedule_date:utils.noZeroDate(that.data.schdate),
        schedule_title:that.data.schtitle
      },

      success: function(data) {
        // console.log(data);
        console.log('release ok',data)
        wx.hideLoading({
          success: (res) => {},
        })
        
        if (data.data.error_code == 605 || data.data.error_code == 400) {
          utils.loginExpired()
          return
        }
        // loginExpired

        //var travel_id = data.data.id
        var travel_id = data.data.result.id

        if (that.data.cover_url != utils.server_imagename + '/cover.jpg') {
          that.imageUpload(that.data.cover_url, travel_id, 'cover')
        }
        let img_url = that.data.img_url;
        for (let i = 0; i < img_url.length; i++) {
          that.imageUpload(img_url[i], travel_id, 'image')
        }

        if (data.data.if_legal == true) {
            wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 1000
          })
        } else {
            wx.showToast({
              title: 'Tag中含有不合法词语',
              icon: 'none',
              duration: 4000
            })
        }
        

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

  //图片上传
  imageUpload: function (filePath, travel_id, api) {
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.uploadFile({
      //路径填你上传图片方法的地址
      url: utils.server_hostname + '/api/core/travels/' + travel_id + '/' + api + '/',

      filePath: filePath,
      name: 'image',
      formData: { },
      header:{
        'token-auth': token
      },

      success: function (res) {
        console.log(res)
        if (res.statusCode == 413 || res.statusCode == 500) {
          wx.showToast({
            title: "图片太大",
            icon: 'none',
            duration: 1000
          })
          return
        }

        var data = JSON.parse(res.data)
        if (data.error_code == 604) utils.loginExpired()
      },
      fail: function (res) { console.log(res) }
    })
  },

  // collection
  bindPinkerchange: function(e) {
    console.log('pinker selecting:', e.detail.value)
    this.setData({
      col_index:e.detail.value
    })
  },
  
  // 监听并更新用户输入信息
  input: function(event) {
    var key = event.currentTarget.id
    var value = event.detail.value
    this.setData({[key]:value})
  },


  chooseCover: function() {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
          that.setData({
            cover_url: res.tempFilePaths[0]
          })
        }
    })  
  },


  chooseimage:function(){
    var that = this;
    wx.chooseImage({
      count: 9, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        if (res.tempFilePaths.length>0){
 
          //把每次选择的图push进数组
          let img_url = that.data.img_url;
          for (let i = 0; i < res.tempFilePaths.length; i++) {
            img_url.push(res.tempFilePaths[i])
          }
          that.setData({
            img_url: img_url
          })
        }
      }
    })  
  },


  chooseLocation:function(){
    utils.authorize()
    var that = this
    wx.chooseLocation({
      success(res) {
        // console.log(res)
        var name = res.name
        var latitude = res.latitude
        var longitude = res.longitude

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
              }
            })
            // console.log(that.data)
          },
          fail: function(res) { console.log(res) }
        })
      },
      fail: function(res) { console.log(res) }
    })
  },

  chooseVis:function(options){
    var that = this
    wx.showActionSheet({
      itemList: ["公开","仅自己可见"],
      success(res){
        // console.log(res.tapIndex)
        that.setData({
          access:res.tapIndex
        })
      }
    })
  },

  onLoad: function (options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:show,
      tagset:[]
    })

    this.getcollection()
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