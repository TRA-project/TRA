<template>
  <div>
<div v-show="isvisivle">
  <a-descriptions title="用户画像"> </a-descriptions>

<!--  <div v-if="isvisivle" >用户id{{userid}}，用户名{{username}}</div>-->
  <div >
    <div id="main"  style="width: 900px;height: 600px;"></div>
  </div>
</div>
  <div v-show="isvisivle===false">
    <a-descriptions title="暂无此用户画像"> </a-descriptions>
  </div>
  </div>

</template>

<script>

export default {
  props:['userid','username'],
  name: "userPersonas",
  methods:{
    getData() {
      this.isvisivle = false;
      let retdata={};
      let list=[];
      this.$axios({
        method: "get",
        url: "api/admin/log/userface/",
        params: {user:this.userid},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        // data: {user:this.userid},
      }).then((res) => {
        this.isvisivle = true;
        console.log(res.data.tags);
        let tags = res.data.tags;
        retdata.name = this.username;
        retdata.children = [];
        for (let ele in tags){
          let tmp={};
          tmp.name = ele;
          tmp.value = tags[ele];
          retdata.children.push(tmp)
        }
        //console.log(retdata)
        list.push(retdata)
        this.mychart(list)
      },(err)=>{
        console.log('err');
          console.log(err);
          this.isvisivle = false;
      })
      return list
    },
    mychart(data) {
      var myChart = this.$echarts.init(document.getElementById('main'));
      let option;
      // let data = [
      //   {
      //     name: '赞美太阳',
      //     children: [
      //       {
      //         name: '小哥哥',
      //         value: 15,
      //         children: [
      //           {
      //             name: '二次元',
      //             value: 13,
      //             children: [
      //               {
      //                 name:'明日方舟',
      //                 value:4,
      //               },
      //               {
      //                 name:'原神',
      //                 value:5,
      //               }
      //             ]
      //           },
      //         ]
      //       },
      //       {
      //         name: '旅行家',
      //         value: 15,
      //         children: [
      //           {
      //             name: '自驾游',
      //             value: 2
      //           },
      //           {
      //             name: '全国游',
      //             value: 5,
      //             children: [
      //               {
      //                 name: '北京',
      //                 value: 2
      //               },
      //               {
      //                 name: '天津',
      //                 value: 2
      //               }
      //             ]
      //           },
      //         ]
      //       },
      //       {
      //         name:'种草达人',
      //         value:7,
      //         children: [
      //           {
      //             name: "发布了3篇游记",
      //             value:4
      //           },
      //           {
      //             name:"拥有3个粉丝",
      //             value:2
      //           }
      //         ]
      //       }
      //     ]
      //   },
      // ];
      // let tmp = this.getData();
      // data = tmp;
      // console.log("dtaa"+data)
      // console.log(data);
      // data = [
      //     {name:"123",
      //       children:[
      //         {name:'##',value:4},
      //         {name:"####",value:4},
      //         {name:"#hhh#",value:4},
      //         {name:'哈尔滨市',value:4},
      //         {name:'立刻这是',value:4},
      //         {name:'曲靖市',value:4},
      //       ]}
      // ]
      // console.log("dtab"+data)
      // console.log(data);
      option = {
        series: {
          type: 'sunburst',
          // emphasis: {
          //     focus: 'ancestor'
          // },
          data: data,
          radius: [0, '90%'],
          label: {
            rotate: 'radial'
          }
        }
      };

      option && myChart.setOption(option);
    },
  },
  mounted() {
    this.getData();
  },
  data(){
    return {
      isvisivle:true
    }
  }
}
</script>

<style scoped>

</style>
