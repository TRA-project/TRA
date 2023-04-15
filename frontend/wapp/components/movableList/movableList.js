// components/movableList/movableList.js
const utils = require("../../utils/util.js")
const globalUtil = require("../../utils/global.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
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
    moveId: 0,
    endY: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    drawList() {
      // 初始化位置；根据序列重新分配y的位置
      const tarListWithPosition = this.properties.tarList.map((item, index) => {
        item.y = (this.properties.itemMarginTop + this.properties.itemHeight) * index
        return item
      })
      this.setData({
        tarList: tarListWithPosition
      })
      console.log("draw list:", JSON.stringify(this.properties.tarList))
    },

    activateMovable(event) {
      this.setData({
        moveDisabled: false
      })
      console.log("movable activate: now you can move item")
    },

    deactiveMovable(event) {
      this.setData({
        moveDisabled: true
      })
      console.log("movable deactivate")
    },

    onLongPress(event) {
      console.log("[longpress]")
      this.activateMovable()
      console.log(event)
      const {
        currentTarget: {dataset}
      } = event 
      // 不用details.y，因为此时的y来自press的坐标，不来自我们需要的item左上角的坐标
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
      //console.log("[moving...]")
      //console.log(event)
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
      if (!this.data.statusLongpress) { // 过滤非长按结束的情况
        console.log("not after longpress, change nothing\n")
        return
      }
      // 确定为长按结束的情况
      var newList = this.properties.tarList // 其实感觉没必要深拷贝
      console.log("change endY to", this.data.endY)
      newList[this.data.moveId].y = this.data.endY
      newList.sort((a, b) => {return a.y - b.y})
      console.log("after sorting:", JSON.stringify(newList)) 
      // 这里list的y值不对劲的原因是浅拷贝，导致之后的drawList修改也会影响newList
      // console.log打印obj时，其实仅传入地址，所以缩略图时运行时的（对的），打开折叠所见值是当下的（错的）
      this.setData({
        tarList: newList, // 这里是浅拷贝（也可能不是，因为没引子组件）
        statusLongpress: false
      })
      console.log("cur tarList:", JSON.stringify(this.data.tarList))
      this.drawList()
      this.deactiveMovable()
      console.log("\n")
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
