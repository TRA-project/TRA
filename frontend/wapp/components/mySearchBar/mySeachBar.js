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
      value: "rgba(30, 144, 255, 1.0);"
    },
    // 圆角尺寸
    radius: {
      type: Number,
      value: 36
    },
    // confirm跳转页面
    confirmTargetUrl: {
      type: String,
      value: "/pages/sceneList/sceneList"
    },
    keyword: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    timer: null,
    delay: 300,
    //keyword: "", 改用properties中的keyword，同样可以用this.data.keyword获取
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

    deleteInput() {
      console.log("delete input keyword")
      this.setData({
        keyword: "",
        searchRes: []
      })
      console.log("currnet keyword:" + this.data.keyword)
      this.triggerEvent("syncinput", {value: this.data.keyword})
      console.log("son component call sync:" + this.data.keyword)
    },

    getSearchList() {
      if (this.data.keyword === "") {
        this.setData({
          searchRes: []
        })
        return
      }

      var url = utils.server_hostname + "/api/core/" + "sights/brief_search/"
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: url,
        method: "GET",
        data: {
          "keyword": this.data.keyword
        },
        header: {
          "token-auth": token
        },
        success: (res) => { // 发送请求成功
          console.log("get searchList:", res)
          if (res.statusCode !== 200) {
            this.setData({
              searchRes: this.data.tmpRes
            })
          } else {
            this.setData({
              searchRes: res.data
            })
          }
        },
        fail: (res) => {  // 发送请求失败
          console.log(res)
        }
      })
    },

    onConfirm() {
      this.timer = setTimeout(() => {
        this.triggerEvent("syncconfirm", {value: this.data.keyword})
        wx.navigateTo({
          url: this.properties.confirmTargetUrl + "?keyword=" + this.data.keyword,
        })
      }, this.data.delay)
    },

    confirmSuggest(event) {
      this.setData({
        keyword: event.currentTarget.dataset.name
      })
      this.onConfirm()
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
