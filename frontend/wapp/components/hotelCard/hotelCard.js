// components/hotelCard/hotelCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    name: {
      type: String,
      value: "速8酒店(北京朝阳门地铁站店)"
    },
    tags: {
      // 标签支持列表渲染，以分号区隔
      type: String,
      value: "经济型;有WIFI"
    },
    remark: {
      type: Number,
      value: 4.7
    },
    num_comment: {
      type: Number,
      value: 29
    },
    position: {
      type: String,
      value: "北京市东城区新中街68号聚龙花园8号商务楼紧邻工人体育馆距三里屯酒吧街500米"
    },
    hotel_facility: {
      type: String,
      value: "房间内高速上网 客房WIFI 书桌 多种规格电源插座 遮光窗帘 手动窗帘 床具:鸭绒被 空调 沙发"
    }
  },

  lifetimes: {
    attached() {
      this.setData({
        taglist: this.properties.tags.split(";")
      })
      // console.log(this.data.taglist)
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    checked: false,
    taglist: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(e) {
      this.setData({
        checked: e.detail
      })
      this.triggerEvent("change", this.data.checked)
    },
    onFlip(e) {
      this.setData({
        checked: !this.data.checked
      })
      this.triggerEvent("change", this.data.checked)
    }
  }
})
