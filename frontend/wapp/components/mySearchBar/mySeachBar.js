// components/mySearchBar/mySeachBar.js
const utils = require("../../utils/util.js");

Component({
  options: {
    // 纯数据字段定义：以下划线开头的数据字段
    pureDataPattern: /^_/
  },

  /**
   * 组件的属性列表
   */
  properties: {
    // 背景颜色
    bgcolor: {
      type: String,
      value: "rgb(4, 138, 201);"
    },
    // 圆角尺寸
    radius: {
      type: Number,
      value: 36
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    timer: null,
    delay: 500,
    keyword: "",
    searchRes: [],  // 搜索结果列表
    tmpRes: [
      {"name": "天空岛", "position": "提瓦特"},
      {"name": "红玉宫", "position": "艾恩格朗特"},
      {"name": "碎片大厦","position": "伦蒂尼姆"},
      {"name": "来生","position": "沃森-歌舞伎区"},
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event) {
      // 输入防抖动：延后500ms取值，不停输入则不断重置timer 
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.setData({
          keyword: event.detail.value,
        })
        this.getSearchList()
        console.log(this.data.keyword)
        
        this.triggerEvent("syncinput", {value: this.data.keyword})
        console.log("sync from son component:" + this.data.keyword)
      }, this.data.delay) // 还得这么用data的值
    },

    getSearchList() {
      if (this.data.keyword === "") {
        this.setData({
          searchRes: []
        })
        return
      }

      var url = utils.server_hostname + "/api/core/sceneries/quicksearch/"
      wx.request({
        url: url,
        method: "GET",
        data: {
          "keyword": this.data.keyword
        },
        header: {

        },
        success: (res) => { // 发送请求成功
          console.log(res)
          if (res.statusCode !== 200) {
            this.setData({
              searchRes: this.data.tmpRes
            })
            console.log(this.data.searchRes)
          }
        },
        fail: (res) => {  // 发送请求失败
          console.log(res)
        }
      })
    }
  },

  /**
   * 组件的生命周期函数
   */
  lifetimes: {
    created() {},
    attached() {},
  },

  /**
   * 组件所在页面的生命周期函数
   */
  pageLifetimes: {
    show() {},
    hide() {},
  }
})
