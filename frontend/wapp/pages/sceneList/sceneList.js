// pages/sceneList/sceneList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: "all",
    optionType: [
      { text: '全部类型', value: 0 },
      { text: '亲自出行', value: 1 },
      { text: '休闲部分', value: 2 },
    ],
    typeValue: 0,
    optionTime: [
      { text: '全部时长', value: 'a' },
      { text: '好评排序', value: 'b' },
      { text: '销量排序', value: 'c' },
    ],
    timeValue: 'a',

    sceneryList: [],
    tmpSceneryList: [
      {
        name: "回忆之丘",
        desc: "艾恩格朗特47层南侧野外迷宫",
        tags: ["休闲娱乐", "复活"],
        time: "3h",
        score: 5,
        price: 0,
      },
      {
        name: "西边山脉",
        desc: "艾恩格朗特55层，吞食水晶的魔龙出没",
        tags: ["亲子出行", "锻造材料"],
        time: "8h",
        score: 4,
        price: 0,
      },
      {
        name: "回忆之丘",
        desc: "艾恩格朗特47层南侧野外迷宫",
        tags: ["休闲娱乐", "复活"],
        time: "3h",
        score: 5,
        price: 0,
      },
      {
        name: "回忆之丘",
        desc: "艾恩格朗特47层南侧野外迷宫",
        tags: ["休闲娱乐", "复活"],
        time: "3h",
        score: 5,
        price: 0,
      },
      {
        name: "回忆之丘",
        desc: "艾恩格朗特47层南侧野外迷宫",
        tags: ["休闲娱乐", "复活"],
        time: "3h",
        score: 5,
        price: 0,
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