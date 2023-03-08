// components/test/test.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isHidden: {
            type:Boolean,
            value: true 
        },
        schData:{
            type:Object,
            value:null
        }
        
    },

    /**
     * 组件的初始数据
     */
    data: {
        hidden:true,
    },

    /**
     * 组件的方法列表
     */
    methods: {

    },
    observers:{
        "schData": function(val){
            if (val == null) {
                this.setData({
                    hidden:true
                })
            }else {
                this.setData({
                    hidden:false
                })
            }
        }
    }
})
