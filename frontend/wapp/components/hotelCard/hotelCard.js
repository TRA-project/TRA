const util = require("../../utils/util")

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
    distance: {
      type: Number,
      value: 20
    },
    uid: {
      type: String,
      value: "613b4d2293d21e50220262e0"
    },
    address: {
      type: String,
      value: "北京市东城区新中街68号聚龙花园8号商务楼紧邻工人体育馆距三里屯酒吧街500米",
    },
    type: {
      type: String,
      value: "hotel"
    },
    checkable: {
      // 标明此卡片是否可以选中
      type: Boolean,
      value: false
    },
    // 标明此卡片的酒店或美食距离某个地方的位置
    place: {
      type: String,
      value: "您"
    }
  },

  lifetimes: {
    attached() {
      let that = this
      wx.request({
        url: "https://api.map.baidu.com/place/v2/detail",
        method: "GET",
        data: {
          uid: that.data.uid,
          ak: util.baiduMapAk,
          output: "json",
          scope: 2,
          photo_show: false
        },
        success(res) {
          let data = res.data.result;
          console.log(data)
          
          // 获得餐馆的服务描述语，不超过100词
          let service = "老牌子;味道不错;回头客;位置优越;服务热情;人气旺;交通便利;"
          if (data.detail_info.featured_service && data.detail_info.featured_service.length !== 0) {
            service = Array(data.detail_info.featured_service).join(" ")
          } else if (data.detail_info.content_tag) {
            service = data.detail_info.content_tag;
          }
          service = (service.length > 100) ? service.substr(0, 70) + "..." : service;

          that.setData({
            taglist: data.detail_info.tag.split(";"),
            remark: data.detail_info.overall_rating,
            level: that.getLevel(data.detail_info.overall_rating),
            num_comment: data.detail_info.comment_num,
            facility: that.data.type === "hotel" ? 
                      data.detail_info.inner_facility : service,
          })
        }
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
    tags:  "经济型;有WIFI",
    remark: 4.7,
    level: "非常棒",
    num_comment: 29,
    facility: "房间内高速上网 客房WIFI 书桌 多种规格电源插座 遮光窗帘 手动窗帘 床具:鸭绒被 空调 沙发"
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
    },
    getLevel(remark) {
      remark = Number(remark)
      if (remark > 4.0) {
        return "非常棒"
      } else if (remark > 3.0) {
        return "较好"
      } else {
        return "一般"
      }
    }
  }
})
