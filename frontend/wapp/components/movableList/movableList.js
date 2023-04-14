// components/movableList/movableList.js
const utils = require("../../utils/util.js")

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
      value: 5
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    moveDisabled: true,
    moveId: 0,
    endY: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    drawList() {
      const tarListWithPosition = this.properties.tarList.map((item, index) => {
        item.y = (this.properties.itemMarginTop + this.properties.itemHeight) * index
        return item
      })
      console.log('init list:', tarListWithPosition)
      this.setData({
        tarList: tarListWithPosition
      })
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

    onMoving(event) { 
      /* moving时，调用间隔很快，是否应考虑优化 */
      const {
        detail,
        currentTarget: {dataset}
      } = event
      //console.log("moving...")
      this.setData({
        moveId: dataset.moveid,
        endY: detail.y
      })
    },

    afterMoved(event) {
      console.log("[move stopped]")
      console.log(this.data.endY)
      var newList = JSON.parse(JSON.stringify(this.properties.tarList))
      newList[this.data.moveId].y = this.data.endY
      newList = newList.sort((a, b) => a.y - b.y)
      console.log(newList[this.data.moveId].y, this.data.moveId, newList)
      this.setData({
        tarList: newList
      })
      this.drawList()
      this.deactiveMovable()
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
