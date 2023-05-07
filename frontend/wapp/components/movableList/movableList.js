// components/movableList/movableList.js
const utils = require("../../utils/util.js")
const globalUtil = require("../../utils/global.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    planNo: {
      type: Number,
      value: 0,
    },
    tarList: {
      type: Array,
      value: [],
    },
    itemHeight : {
      type: Number,
      value: 180
    },
    itemMarginTop : {
      type: Number,
      value: 10
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    moveDisabled: true,
    statusLongpress: false,  /* 是否在longpress状态，用于在touchend中过滤短按结束的情况 */
    moveId: 0, /* 当前移动的代码 */
    endY: 0,  

    // 检测手势
    touchStartX: 0,
    touchStartY: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    drawList() {
      // 初始化位置；根据序列重新分配y的位置
      this.properties.tarList.map((item, index) => {
        var newY = (this.properties.itemMarginTop + this.properties.itemHeight) * index
        this.setData({
          ["tarList[" + index + "].y"]: newY
        })
      })

      //console.log("draw list:", JSON.stringify(this.properties.tarList))
      // 同步到父页面
      this.triggerEvent("synctarlistchange", {
        listNo: this.properties.planNo, 
        newList: this.data.tarList
      })
    },

    activateMovable() {
      this.setData({
        moveDisabled: false
      })
      console.log("movable activate: now you can move item")
    },

    deactiveMovable() {
      this.setData({
        moveDisabled: true
      })
      console.log("movable deactivate")
    },

    onTouchStart(event) {
      console.log("[touch start]")
      console.log(event)
      // 记录初始位置
      this.setData({
        touchStartX: event.changedTouches[0].pageX,
        touchStartY: event.changedTouches[0].pageY,
      })
    },

    onLongPress(event) {
      console.log("[longpress]")
      console.log(event)

      this.activateMovable()
      const {currentTarget: {dataset}} = event // 新型写法，初始化dataset 
      const newEndY = this.properties.tarList[dataset.moveid].y
      // 但仍需要将endY改为对应item中的y（因为touchEnd还会被触发）
      this.setData({
        statusLongpress: true,
        moveId: dataset.moveid,
        endY: newEndY,
      })
    },

    // 注意：只有位置在发生改变才会持续触发bindchange
    onMoving(event) {  
      /* moving时，调用间隔很短，是否应考虑优化 */
      const {
        detail,
        currentTarget: {dataset}
      } = event
      this.setData({
        moveId: dataset.moveid,
        endY: globalUtil.px2rpx(detail.y)
      })
    },

    onTouchEnd(event) {
      console.log("[touch end]")
      console.log(event)
      // 记录结束位置
      const touchEndX = event.changedTouches[0].pageX
      const touchEndY = event.changedTouches[0].pageY

      // 检测到longpress动作 (longpress > tap)
      if (this.data.statusLongpress) {
        console.log("detect longpress")
        this.endMoveAndReorderList()
        return
      }

      // 检测到tap动作
      if (touchEndX === this.data.touchStartX &&
          touchEndY === this.data.touchStartY ) {
        console.log("detect tab: view scenery details")
        this.viewSceneDetail(event)
        return
      }
      
      // default
      console.log("meaningless event, ignored")
      return
    },

    deleteListItem(event) {
      console.log("deleteItem:", event)
      var newList = this.properties.tarList
      var delIdx = event.currentTarget.dataset.id
      newList.splice(delIdx, 1)
      this.setData({
        tarList: newList
      })
      this.drawList()
    },
    
    // 权益之计，组件耦合度太太太高了
    viewSceneDetail(event) {
      console.log("tabView:", event)
      var idx = event.currentTarget.dataset.moveid
      // 点击的Scene参数
      var sceneName = event.currentTarget.dataset.movename
      var sceneId = this.data.tarList[idx].id
      var args = "?keyword=" + sceneName + "&usage=reselect"
      wx.navigateTo({
        url: "/pages/sceneList/sceneList" + args,
      })
    },

    endMoveAndReorderList() {
      var newList = this.properties.tarList // 其实感觉没必要深拷贝
      console.log("change endY to", this.data.endY)
      newList[this.data.moveId].y = this.data.endY // 修改移动项的y值
      newList.sort((a, b) => {return a.y - b.y})
      //console.log("after sorting:", JSON.stringify(newList)) 
      this.setData({
        tarList: newList, // 这里是浅拷贝（也可能不是，因为没引子组件）
        statusLongpress: false
      })
      //console.log("cur tarList:", JSON.stringify(this.data.tarList))
      this.drawList()
      this.deactiveMovable()
    },

    nop(event) {
      console.log("catch event:", event)
    }
  },

  /**
   * 组件的生命周期函数
   */
  lifetimes: {
    created() {},
    attached() {},
    ready() {
      this.drawList()
    }
  },
})
