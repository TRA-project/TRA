const utils = require("../../utils/util")

// pages/sceneList/sceneList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: "all",

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
        desc: "艾恩格朗特55层，吞食水晶的魔龙出没",
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
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("get:", options.keyword)
    this.setData({
      keyword: options.keyword
    })

    var url = utils.server_hostname + "/api/core/" + "sceneries"
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: url,
      method: "GET",
      data: {
        "keyword": this.data.keyword,
        "token-auth": token
      },
      header: {

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

  returnBackToSearch() {
    wx.navigateBack()
  },

  addScenery() {
    console.log("add scenery")
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
      if (scene.type === this.data.typeValue) { 
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