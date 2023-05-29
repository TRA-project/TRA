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
    myInput: "",
    showSearchRes: true, // 重用searchBar阶段: “搜索建议列表”与“搜索结果”的展示互斥
    selectedIds: [],
    selectedSceneries: [],
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
          // 初始默认选中former
          var selected = [this.data.formerScenery.id]
          this.setData({
            selectedIds: selected
          })
        } else {
          // 重新尝试建立浅拷贝关系,若无则不用
          this.data.sceneryTotalList.forEach((item, index) => {
            if (item.id === this.data.formerScenery.id) {
              this.setData({
                formerScenery: item
              })
            }
          })
        }
        /* 每次重新获取完列表，需要initCheckbox */
        if (this.data.usage === "reselect") {
          this.initCheckbox()
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
    console.log(this.data.selectedIds)
    this.data.sceneryTotalList.forEach((item, index) => {
      for (var selectid of this.data.selectedIds) {
        if (item.id === selectid) {
          this.setData({
            ["sceneryTotalList[" + index + "].checked"]: true,
          })
          break
        }
      }
    })
    // 浅拷贝同步到视图层（逻辑层已经改变）
    this.setData({
      formerScenery: this.data.formerScenery
    })
  },

  // Promise包装,便于后续多个异步请求的最终同步
  getScenery(sceneryId) {
    var promise = new Promise((resolve, reject) => {
      console.log("GET: scenery / <scenery_id> =", sceneryId)
      var url = utils.server_hostname + "/api/core/" + "sights/" + sceneryId + "/"
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: url,
        method: "GET",
        header: {
          "token-auth": token
        },
        success: (res) => {
          console.log(res)
          var scene = res.data
          var item = {
            id: scene.id,
            address: {
              name: scene.address.name,
              latitude: scene.address.latitude,
              longitude: scene.address.longitude
            },
            name: scene.name,
            desc: scene.desc,
            cover: scene.images.length > 0 ? scene.images[0].substr(utils.server_hostname.length) : "/media/images/null",
          }
          resolve(item)
        },
        fail: (err) => {
          console.log(err)
          reject("request " + sceneryId + " failed")
        }
      })
    })
    return promise
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
      wx.navigateBack()
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

  // addScenery() {
  //   console.log("tap")
  //   wx.navigateTo({
  //     url: '/pages/spotAdd/spotAdd',
  //   })
  // },

  onCheckboxChange(event) {
    console.log("checkbox changed, value:")
    const values = event.detail.value.map(Number)

    /* 同时选中超过上限, 禁止操作 */
    if (values.length > 3) {
      wx.showToast({
        title: "最多连续选3处",
        icon: "none"
      })
      // 同步视图层
      this.setData({
        sceneryShowList: this.data.sceneryShowList
      })
      console.log(this.data.selectedIds)
      return 
    }

    /* 允许操作 */
    this.setData({
      selectedIds: values
    })
    console.log(this.data.selectedIds)
    // 另一种改Array的方式
    const items  = this.data.sceneryShowList  
    for (var i in items) {
      items[i].checked = false
      for (var value of values) {
        if (items[i].id == value) {
          items[i].checked = true
          break
        }
      }
    }
    // 同步到视图层
    this.setData({
      items,
      formerScenery: this.data.formerScenery,
    })
  },

  onFormerSceneryCheckboxTap() {
    console.log("tap former scenery checkbox, value:")

    if (this.data.formerScenery.checked !== true) {
      // 说明此举将加入selectedIds, 需要判断是否超过上限
      if (this.data.selectedIds.length >= 3) {
        wx.showToast({
          title: "最多连续选3处",
          icon: "none"
        })
        // 同步到视图层
        this.setData({
          formerScenery: this.data.formerScenery
        })
        return
      }
    }

    this.data.formerScenery.checked = !this.data.formerScenery.checked
    // selectedIds 更新
    if (this.data.formerScenery.checked === true) {
      // 说明之前为false, 不在selectedIds中，添上
      this.data.selectedIds.push(this.data.formerScenery.id)
    } else {
      // 说明之前未true, 在selectedIds中，去除
      this.data.selectedIds.splice(
        this.data.selectedIds.indexOf(this.data.formerScenery.id), 1
      )
    }
    // 同步到视图层
    this.setData({
      selectedIds: this.data.selectedIds,
      formerScenery: this.data.formerScenery,
      sceneryShowList: this.data.sceneryShowList,
    })
    console.log(this.data.selectedIds)
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

  onTapConfirm() {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]
    
    // 获取所选内容对应的景点详情
    // var that = this
    let promiseArr = []
    this.data.selectedIds.forEach(item => {
      promiseArr.push(this.getScenery(item))
    })
    Promise.all(promiseArr).then(items => {
      console.log("Promise all:", items)
      prevPage.setData({
        reselectSceneries: items,
        afterReselect: true,
      })
      wx.navigateBack()
    }).catch(err => {
      console.log(err)
    })
  },

  onTapReturn() {
    wx.navigateBack()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log("sceneList hide")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log("sceneList unload")
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