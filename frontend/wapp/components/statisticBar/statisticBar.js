Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num: {
      type: Number,
      value: 3,
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
