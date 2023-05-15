Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num: {
      type: Number,
      value: 3,
    },
    btnName: {
      type: String,
      value: "返回"
    },
    showNum: {
      type: Boolean,
      value: true
    }
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
    onClick(e) {
      this.triggerEvent("click");
    }
  }
})
