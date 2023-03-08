// components/myTable/myTable.js
const utils = require('../../utils/util');
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        data:{
            type:Object,
            value:null
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        mydata :[
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24},
            {time:"10:23","eventy":"前往北航","开销":24}],
        data2: [
            1,2,3,4,5,6,7
        ],
        date:null,
        },

    /**
     * 组件的方法列表
     */
    methods: {

    },
    observers:{
        "data":function(val){
            if (val == null) return;
            console.log("ob:"+val);
            val.items.forEach(function(item){
                item.time = item.time.substring(0,5)
            })
            console.log("val:"+val)
            this.setData({
                date:val.date,
                mydata:val.items
            })
        }
    }
})
