// components/schRelease/schRelease.js
const utils = require('../../utils/util')
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        schedule:{
            type:Object,
            value:null
        },
        copydate:{
            type:String,
            value:null
        }

    },

    /**
     * 组件的初始数据
     */
    data: {
        title:null,
        type:null,
        items:null,
        allbudget:null,
        schedule_id:null,
        isShowModel:false,
        schdate:'',
        list: [
            {name: '0', value: '是', checked: 'true'},
            {name: '1', value: '否'},
          ],
        checkitem:null,
        option:0,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        radioChange: function(e) {
            console.log('radio发生change事件，携带value值为：', e.detail.value)
            this.setData({
                option:e.detail.value
            })
            console.log('data.option：', this.data.option)

          },
        copySch:function(){
            this.setData({
                isShowModel:!this.data.isShowModel
            })
            console.log("copy sch");
            console.log(this.data.schedule_id);
            let schid = this.data.schedule_id;
        },
        post:function(){
            console.log('post')
            let schid = this.data.schedule_id;
            let option = this.data.option;
            option=option.toString();
            let date = this.data.schdate;
            if (date == '') {
                wx.showToast({
                  title: '请选择拷贝日期',
                })
            }
            let url = utils.server_hostname + '/api/core/schedule/copy/';
            let token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
            console.log(token)
            console.log(date)
            console.log(schid)

            wx.request({
                url: url,
                method: 'POST',
                header: {
                  'content-type': 'application/json',
                  'token-auth': token
                },
                data: {
                    'date':date,
                    'option':option,
                    'schedule_id':schid 
                },
                success: function (res) {
                    wx.showToast({
                        title: '拷贝成功',
                      })
                },
                fail:function(err){
                    wx.showToast({
                        title: '拷贝失败',
                      })
                }
            })

        },
        navigate2Cal:function(){
            wx.navigateTo({
              url: '../newSchedule/newSchedule?release=2&dateString='+this.data.schdate,
            })
        },
    },

    lifetimes:{


    },
    observers:{
        "schedule":function(val){
            if (val == null) return;
            console.log("schedule")
            console.log(val);
            let items = val.items;
            let schedule_id = val.schid;
            let allbudget=0;
            items.forEach(function(item){
                if (item.budget == null){
                    return;
                }else {
                    allbudget+=item.budget;
                }
            })
            console.log(allbudget)
            this.setData({
                title:val.title,
                type:val.type,
                items:val.items,
                allbudget:allbudget,
                schedule_id:schedule_id
            })
            console.log("akjshdajd")
            console.log(this.data)
        },
        "copydate":function(val){
            if (val == null) return;
            console.log(val);
            this.setData({
                schdate:val,
            })
            console.log('copydate');
            console.log(this.data.copydate)
            console.log(this.data)
        }
    }
})
