// pages/home/home.js
const utils = require("../../utils/util.js");

Page({
    data: {
      server_imagename: utils.server_imagename,
      
      touchStartY: 0,

      userName: "",
      userNickName: "",
      userAvatar: "",
      greetings: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
      this.setData({
        opacity: 1,
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
      this.setData({
        opacity: 1,
      })

      var that = this
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      var id = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')
      var url = utils.server_hostname + "/api/core/users/" + id + "/"
      wx.request({
        url: url,
        method: "GET",
        data: {},
        header: {
          "content-type": "application/json",
          "token-auth": token
        },
        success: (res) => {
          console.log("GET /users/{id} UserInfo", res)
          // 获取用户信息
          var data = res.data
          that.setData({
            userName: data.name,
            userNickName: data.nickname,
            userAvatar: (data.icon == null) ? utils.server_imagename + "/male.png" : 
                                              utils.server_hostname + "/api/core/images/" + data.icon + "/data/"
          })
          // 招呼文案配置
          const curHour = new Date().getHours()
          var greeting  = (curHour <= 5 ) ? "晚安" :
                          (curHour <= 10) ? "早上好" :
                          (curHour <= 13) ? "中午好" :
                          (curHour <= 18) ? "下午好" : "晚上好";
          greeting = greeting + ", " + this.data.userNickName + "!"
          this.setData({
            greetings: greeting
          })
          console.log("greetings:", this.data.greetings)
        },
        fail: (err) => {
          console.log(err)
        }
      })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
      this.setData({
        opacity: 0,
      })
    },
  
    // 跳转到新页面
    onTouchStart(event) {
      console.log("[touch start]", event)
      this.setData({
        // touchStartX: event.changedTouches[0].pageX,
        touchStartY: event.changedTouches[0].pageY,
      })
    },

    onTouchEnd(event) {
      console.log("[touch end]", event)
      // const touchEndX = event.changedTouches[0].pageX
      const touchEndY = event.changedTouches[0].pageY

      console.log("touchStartY:", this.data.touchStartY)
      console.log("touchEndY:", touchEndY)
      if (this.data.touchStartY - touchEndY > 100) {
        console.log("go to page/index/index")
        wx.navigateTo({
          url: '/pages/index/index',
        })
        // 原页面淡出
        this.setData({
          opacity: 0,
        })
      
        // 等待0.5秒，将原页面隐藏
        setTimeout(() => {
          this.setData({
            opacity: 0,
            hidden: true,
          })
        }, 500)
      }
    },

    onSearchBarTap() {
      wx.navigateTo({
        url: '/pages/sceneSearch/sceneSearch',
      })
    },
    
    navigateToTravelPlan() {
      wx.navigateTo({
        url: '/pages/travelPlanList/travelPlanList'
      })
    },

    navigateToNewPage: function() {
      wx.navigateTo({
        url: '/pages/travelButlerChat/travelButlerChat',
      })
    },

    onTapMyZone() {
      wx.navigateTo({
        url: "/pages/RealMyzone/RealMyzone",
      })
    },

    onTapSettings() {
      wx.navigateTo({
        url: "/pages/Settings/Settings",
      })
    }
})