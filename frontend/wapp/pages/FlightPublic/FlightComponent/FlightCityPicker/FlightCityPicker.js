// pages/FlightPublic/FlightComponent/FlightCityPicker/FlightCityPicker.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        city: {
            type: String,
            value: "北京",
        },
        obs:{
            type:String,
            observer: function (newVal) { 
                // 监听属性变化，若这个值存在，且与即将附在data中的值不同，就满足我们的要求可以进行后续操作啦
                if (newVal && this.properties.city !== newVal) {
                    this.setData({
                        city: newVal
                    })
                }
            }
        },
       input:{
           type:Array(),
           value:[]
       },
       cur:{
           type:Array(),
           value:[]
       }
    },

    /**
     * 组件的初始数据
     */
    data: {
        idx: [0, 0],
 
    },
    onShow:function(){
        console.log('show?')
        this.updatelist(0, 0) // 初始化渲染
    },
    /**
     * 组件的方法列表
     */
    methods: {
        change(e) {
            console.log('input',this.properties.input)
            let idx = e.detail.value
            this.setData({
                idx: idx,
                city: this.properties.cur[1][idx[1]].name
            })
            this.triggerEvent('value', this.properties.city)
        },
        // picker的列发生变化时
        columnChange(e) {
            // column列索引（0-第一列）  value是列中数组索引
            this.updatelist(parseInt(e.detail.column), parseInt(e.detail.value))
        },

        // 用于更新picker视图的方法封装
        updatelist(col, idx) {
            if (col == 1) {
                this.setData({
                    idx: [this.data.idx[0], idx]
                })
                return;
            }
            console.log('update')
            let list = [
                [],
                []
            ] // 视图渲染
            list[0] = this.data.input[0] // picker的第一列数据
            // 当第一列变化时
            if (col == 0) {
                // 更新第二列的数据
                list[1] = this.data.input[1].filter(ele => ele.province == this.data.input[0][idx].id)
                this.setData({
                    idx: [idx, 0]
                })
            }
            // 更新list，更新picker视图
            this.setData({
                cur: list
            })
        }
    }
})