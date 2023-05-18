// components/bottomBar/bottomBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isCollect: {
      type: Boolean,
      value: false,
    },
    numComment: {
      type: Number,
      value: 23,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    collectBtnImage: "/images/star.png"
  },

  observers: {
    'isCollect': function(isCollect) {
      if (isCollect === false) {
        this.setData({
          "collectBtnImage": "/images/star.png"
        })
      } else {
        this.setData({
          "collectBtnImage": "/images/light_star.png"
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onCollect() {
      this.triggerEvent("collect")
    },
    onComment(e) {
      this.triggerEvent("comment", {}, {})
    }
    // onClick(e) {
    //   wx.navigateTo({
    //     url: '../../pages/travelPlanInside/travelPlanInside'
    //   })
    // }
  }
})
