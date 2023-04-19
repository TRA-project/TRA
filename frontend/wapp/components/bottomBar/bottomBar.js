// components/bottomBar/bottomBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isCollect: false,
    collectBtnImage: "/images/star.png"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onCollect() {
      // console.log("tap")
      this.setData({
        "isCollect": !this.data.isCollect
      })
      if (this.data.isCollect === false) {
        this.setData({
          "collectBtnImage": "/images/star.png"
        })
      } else {
        this.setData({
          "collectBtnImage": "/images/light_star.png"
        })
      }
    },
    onComment(e) {
      this.triggerEvent("comment", {}, {})
    }
  }
})
