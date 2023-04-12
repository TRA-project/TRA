// pages/destination/destination.js
const {addSelectToArray} = require('../../utils/util');

Page({
    data:{
      active:5,
      list:[
        {name:'卧佛寺'},
        {name:'植物园温室'},
        {name:'珍稀濒危植物区'},
        {name:'宿根花卉园'},
        {name:'农事体验园'},
        {name:'碧桃园'},
        {name:'月季园'},
        {name:'牡丹园'},
      ],
      selectedIdList:[],
      selectedNameList:[]
    },
    activeClick (e){
      let index=e.currentTarget.dataset.index;
       this.setData({
         active:index
       })
    },
      
    enterCity(e){
      let cityname=e.currentTarget.dataset.cityname;
      wx.navigateTo({
        url: 'cityView/cityView?cityname='+cityname+''
      })
    },
    onLoad: function () {
        let list = this.data.list
        addSelectToArray(list)
        this.setData({
          list
        })
      },
      selectFruitClick(e){
        let index = e.currentTarget.dataset.index
        let selectedIdList = [],selectedNameList = [],list = this.data.list
        list[index].select =!list[index].select
        list.forEach(v=>{
          if(v.select){
            selectedIdList.push(v.name)
            selectedNameList.push(v.id)
          }
        })
        this.setData({
          list,
          selectedIdList: selectedIdList,
          selectedNameList:selectedNameList
        })
        //参数是数组格式
      },
      goToPathMapInside:function(){
          wx.navigateTo({
              url:'/pages/pathMapInside/pathMapInside',
          })
      }
  })


