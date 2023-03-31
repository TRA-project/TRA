// components/mySearchBar/mySeachBar.js
const utils = require("../../utils/util.js");

Component({
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
      "天空岛",
      "红玉宫"
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
        this.keyword = event.detail.value
        this.getSearchList()
        console.log(this.keyword)
      }, this.data.delay) // 还得这么用data的值
    },

    getSearchList() {
      if (this.keyword === "") {
        this.searchRes = []
        return
      }

      var url = utils.server_hostname + "/api/core/sceneries/quicksearch/"
      wx.request({
        url: url,
        method: "GET",
        data: {
          "keyword": this.keyword
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
  }
})
