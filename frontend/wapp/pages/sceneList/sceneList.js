const utils = require("../../utils/util")

// pages/sceneList/sceneList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_hostname,
    keyword: "all",
    usage: "search",

    optionType: [
      { text: '全部类型', value: 0 },
      { text: '亲子出行', value: 1 },
      { text: '休闲娱乐', value: 2 },
      { text: '曲径探幽', value: 3 },
    ],
    typeValue: 0,
    optionTime: [
      { text: '全部时长', value: 0 },
      { text: '3h 以内', value: 1 },
      { text: '1天内', value: 2 },
    ],
    timeValue: 0,
    optionCost: [
      { text: '全部开销', value: 0 },
      { text: '10￥以内', value: 1 },
      { text: '10-100￥', value: 2 },
    ],
    costValue: 0,

    sceneryTotalList: [],
    sceneryShowList: [],
    tmpSceneryList: [
      {
        id: 1,
        name: "回忆之丘",
        desc: "艾恩格朗特47层南侧野外迷宫",
        tags: ["休闲娱乐", "复活"],
        type: 2,
        time: "3h",
        score: 5,
        price: 10,
        image: "preview.png",
      },
      {
        id: 2,
        name: "西边山脉",
        desc: "艾恩格朗特55层，吞食水晶的魔龙出没，占位符占位符占位符占位符占位符占位符占位符占位符占位符占位符",
        tags: ["亲子出行", "锻造材料"],
        type: 1,
        time: "8h",
        score: 4,
        price: 50,
        image: "preview.png",
      },
      {
        id: 3,
        name: "森之屋",
        desc: "艾恩格朗特22层南部高拉尔村外围",
        tags: ["曲径探幽"],
        type: 3,
        time: "3h",
        score: 5,
        price: 0,
        image: "preview.png",
      },
      {
        id: 4,
        name: "塞尔穆布鲁克",
        desc: "艾恩格朗特61层中心市区",
        tags: ["休闲娱乐", "居家"],
        type: 2,
        time: "3h",
        score: 5,
        price: 10,
        image: "preview.png",
      },
      {
        id: 5,
        name: "莉兹贝特武器店",
        desc: "艾恩格朗特48层主街区琳达司",
        tags: ["休闲娱乐", "锻造"],
        type: 2,
        time: "3h",
        score: 5,
        price: 20,
        image: "preview.png",
      },
    ],

    // reselect 专用
    formerScenery: {},
    sceneryChecked: true,
    myInput: "",
    showSearchRes: true, // 重用searchBar阶段: “搜索建议列表”与“搜索结果”的展示互斥
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("sceneList get:", options)
    this.setData({
      keyword: options.keyword,
      usage: options.usage,
    })

    this.getSceneryList(this.data.keyword, true)
  },

  getSceneryList(keyword, initFormer) {
    console.log("GET: sceneryList ? keyword =", keyword)
    var url = utils.server_hostname + "/api/core/" + "sights/search"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "GET",
      data: {
        "keyword": keyword
      },
      header: {
        "token-auth": token
      },
      success: (res) => {
        console.log(res)
        if (res.statusCode !== 200) {
          this.setData({
            sceneryTotalList: this.data.tmpSceneryList
          })
        } else {
          this.setData({
            sceneryTotalList: res.data
          })
        }

        /* init formerScenery: reselect */
        if (initFormer == true) {
          this.setData({
            formerScenery: this.data.sceneryTotalList[0],
            myInput: keyword,
          })
          if (this.data.usage === "reselect") {
            this.initCheckbox()
          }
        }

        /* 选择显示的列表 */
        this.setData({
          sceneryShowList: this.data.sceneryTotalList
        })
        console.log(this.data.sceneryShowList)
      },
      fail: (res) => {
        console.log("请求景点列表失败")
        console.log(res)
      },
    })  
  },

  initCheckbox() {
    this.setData({
      ["formerScenery.checked"]: true,
    })
    this.data.sceneryTotalList.forEach((item, index) => {
      if (item.id === this.data.formerScenery.id) {
        this.setData({
          ["sceneryTotalList[" + index + "].checked"]: true,
        })
        console.log("checked", item)
      }
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
    
  },

  onSearchBarTap() {
    // 该页面由sceneSearch而来
    if (this.data.usage === "search") {
      console.log("for search: back")
      //wx.navigateBack()
    }
    // 该页面由travelPlanPreview而来
    if (this.data.usage === "reselect") {
      console.log("for reselect: search")
    }
  },

  showSceneryDetail(e) {
    console.log("show scenery: ", e)
    var scenery_id = e.currentTarget.dataset.id
    console.log("show scenery id: ", scenery_id)
    wx.navigateTo({
      url: "/pages/sceneryShow/sceneryShow?scenery_id=" + scenery_id,
    })
  },

  selectSceneryFromTag() {// 目前仅匹配了type
    if (this.data.typeValue === 0) {
      this.setData({
        sceneryShowList: this.data.sceneryTotalList
      })
      console.log("show all", this.data.sceneryShowList)
      return  // 返回
    }
    var newSceneryShowList = []
    for (var index in this.data.sceneryTotalList) {
      var scene = this.data.sceneryTotalList[index]
      // 所给的types数组中包含当前typeValue的值，则选入
      if (scene.types.indexOf(this.data.typeValue) > -1) { 
        newSceneryShowList.push(scene)
      }
    }
    this.setData({
      sceneryShowList: newSceneryShowList
    })
    console.log("update showList:", this.data.sceneryShowList)
  },

  onChangeType(event) {
    this.setData({
      typeValue: event.detail
    })
    console.log("change type to", this.data.typeValue)
    var that = this // 使用自定义函数时得用
    that.selectSceneryFromTag()
  },

  addScenery() {
    console.log("tap")
    wx.navigateTo({
      url: '/pages/spotAdd/spotAdd',
    })
  },

  onCheckboxChange(event) {
    console.log("checkbox changed, value:", event.detail.value)
    
    const values = event.detail.value
    // 另一种改Array的方式
    const sceneryShowList  = this.data.sceneryShowList  
    for (var i = 0; i < items.length; ++i) {
      items[i].checked = false
      for (var j = 0; j < values.length; ++j) {
        if (items[i].id === values[j]) {
          items[i].checked = true
          break
        }
      }
    }
    this.setData({
      sceneryShowList
    })
    
  },

  onCheckboxTap() {
    console.log("tap checkbox")
    this.setData({
      sceneryChecked: !this.data.sceneryChecked
    })
    console.log(this.data.sceneryChecked)
  },

  onSyncInput(event) {
    this.setData({
      myInput: event.detail.value,
      showSearchRes: false,
    })
    console.log("father page syncInput:", this.data.myInput)
  },

  onSyncConfirm(event) {
    console.log("father page receive Confirm")
    this.getSceneryList(this.data.myInput, false)
    this.setData({
      showSearchRes: true,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})