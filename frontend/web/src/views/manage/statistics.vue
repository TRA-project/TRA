<template>
<div style="text-align: left">
  <a-tabs v-model="activeKey" type="card" @click="drawEchart(activeKey)" >
    <a-tab-pane  v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
      <div v-if="pane.key === '0'" >
        <div style="background: #ECECEC; padding: 30px; width: 1000px">
          <a-row :gutter="[20,10]" >
            <a-col :span="24">
              <a-card @click.native="activeKey='1'">
                <a-statistic
                    title="今日活跃量"
                    :value= "latestactivedata.toString()"
                    :precision="0"
                    suffix="人次"
                    :value-style="{ color: '#3f8600' }"
                    style="margin-right: 50px"
                >
                  <template #prefix>
                    <a-icon type="minus" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
          </a-row>
          <a-row :gutter="[20,10]" >
            <a-col :span="24">
              <a-card @click.native="activeKey='2'">
                <a-statistic
                    title="游记地域增长最大"
                    class="demo-class"
                    suffix = '篇'
                    :value-style="{ color: '#3f8600' }"
                >
                  <template #formatter>
                    北京：10
                  </template>
                  <template #prefix>
                    <a-icon type="arrow-up" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
          </a-row>
          <a-row :gutter="[20,10]" >
            <a-col :span="24">
              <a-card @click.native="activeKey='3'">
                <a-statistic
                    title="游记今日发布数"
                    :value="traveltodaydata.toString()"
                    :precision="0"
                    suffix="篇"
                    class="demo-class"
                    :value-style="{ color: '#3f8600' }"
                >
                  <template #prefix>
                    <a-icon type="arrow-up" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
          </a-row>
          <a-row :gutter="[20,10]" >
            <a-col :span="24">
              <a-card @click.native="activeKey='4'">
                <a-statistic
                    title="同行今日发布数"
                    :value="3"
                    :precision="0"
                    suffix="个"
                    class="demo-class"
                    :value-style="{ color: '#3f8600' }"
                >
                  <template #prefix>
                    <a-icon type="arrow-up" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </div>


      <div v-if="pane.key === '1'" @click="myEcharts1">
        <div id="main" style="width: 900px;height: 600px;"></div>
      </div>
      <div v-else-if="pane.key === '2'" @click="myEcharts2">
        <div id="main2" ref="china" style="width: 900px;height: 600px;"></div>
      </div>
      <div v-else-if="pane.key === '3'" @click="myEcharts3">
        <div id="main3" style="width: 900px;height: 600px;"></div>
      </div>
      <div v-if="pane.key === '4'" @click="myEcharts4">
        <div id="main4" style="width: 900px;height: 600px;"></div>
      </div>
<!--      <div v-if="! (pane.key === '0') " style="width: 900px;text-align: right">-->
<!--        <a-icon  type="download" style="font-size: 40px" @click="dataDownload($event,pane.key)" ></a-icon>-->
<!--      </div>-->
    </a-tab-pane>

  </a-tabs>
</div>
</template>

<script>
import china from '@/assets/china.json';

let panes = [
  // {title:'数据统计',key:'0',closable: false},
  {title:'日活跃量',key:'1',closable:false},
  {title:'游记地域分布图',key:'2',closable:false},
  {title:'游记总数统计',key:'3',closable:false},
  {title:'同行发布数',key:'4',closable:false},
]
let timedata=[];
let activedata=[];
let traveldata=[];
let areadata=[];
let globaldataList = [
  {
    name: "北京",
    value: 0,
  },
  {
    name: "南海诸岛",
    value: 0,
  },
  {
    name: "天津",
    value: 0,
  },
  {
    name: "上海",
    value: 40,
  },
  {
    name: "重庆",
    value: 0,
  },
  {
    name: "河北",
    value: 0,
  },
  {
    name: "河南",
    value: 0,
  },
  {
    name: "云南",
    value: 0,
  },
  {
    name: "辽宁",
    value: 0,
  },
  {
    name: "黑龙江",
    value: 0,
  },
  {
    name: "湖南",
    value: 0,
  },
  {
    name: "安徽",
    value: 0,
  },
  {
    name: "山东",
    value: 0,
  },
  {
    name: "新疆",
    value: 0,
  },
  {
    name: "江苏",
    value: 0,
  },
  {
    name: "浙江",
    value: 0,
  },
  {
    name: "江西",
    value: 0,
  },
  {
    name: "湖北",
    value: 0,
  },
  {
    name: "广西",
    value: 0,
  },
  {
    name: "甘肃",
    value: 0,
  },
  {
    name: "山西",
    value: 0,
  },
  {
    name: "内蒙古",
    value: 0,
  },
  {
    name: "陕西",
    value: 0,
  },
  {
    name: "吉林",
    value: 0,
  },
  {
    name: "福建",
    value: 0,
  },
  {
    name: "贵州",
    value: 0,
  },
  {
    name: "广东",
    value: 0,
  },
  {
    name: "青海",
    value: 0,
  },
  {
    name: "西藏",
    value: 0,
  },
  {
    name: "四川",
    value: 0,
  },
  {
    name: "宁夏",
    value: 0,
  },
  {
    name: "海南",
    value: 0,
  },
  {
    name: "台湾",
    value: 0,
  },
  {
    name: "香港",
    value: 0,
  },
  {
    name: "澳门",
    value: 0,
  },
];
let latestactivedata ;
let traveltodaydata ;
let companiondata;
export default {
  name: "statistics",
  methods: {
    getData() {
      console.log(localStorage.getItem('Authorization'))
      this.$axios({
        method: "get",
        url: "api/admin/log/statistics/",
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res)=>{
        timedata = res.data.countdata.timedata;
        activedata = res.data.countdata.activedata;
        latestactivedata = activedata[activedata.length-1];
        traveldata = res.data.countdata.traveldata;
        traveltodaydata = traveldata[activedata.length-1]-traveldata[activedata.length-2];
        areadata = res.data.areadata;
        console.log(areadata)
        companiondata = res.data.countdata.companiondata;
        console.log(companiondata)
        areadata.forEach((item)=>{
          //console.log(item.province+'1')
          switch (item.province) {
            case '上海市': {
              item.name = '上海';
              break;
            }
            case '北京市': {
              item.name = '北京';
              break;
            }
            case '河北省': {
              item.name = '河北';
              break;
            }
            case '天津市': {
              item.name = '天津';
              break;
            }
            case '山西省': {
              item.name = '山西';
              break;
            }
            case '内蒙古自治区': {
              item.name = '内蒙古';
              break;
            }
            case '辽宁省': {
              item.name = '辽宁';
              break;
            }
            case '吉林省': {
              item.name = '吉林';
              break;
            }
            case '黑龙江省': {
              item.name = '黑龙江';
              break;
            }
            case '江苏省': {
              item.name = '江苏';
              break;
            }
            case '浙江省': {
              item.name = '浙江';
              break;
            }
            case '安徽省': {
              item.name = '安徽';
              break;
            }
            case '福建省': {
              item.name = '福建';
              break;
            }
            case '江西省': {
              item.name = '江西';
              break;
            }
            case '山东省': {
              item.name = '山东';
              break;
            }
            case '河南省': {
              item.name = '河南';
              break;
            }
            case '湖北省': {
              item.name = '湖北';
              break;
            }
            case '湖南省': {
              item.name = '湖南';
              break;
            }
            case '广东省': {
              item.name = '广东';
              break;
            }
            case '广西壮族自治区': {
              item.name = '广西';
              break;
            }
            case '海南省': {
              item.name = '海南';
              break;
            }
            case '重庆市': {
              item.name = '重庆';
              break;
            }
            case '四川省': {
              item.name = '四川';
              break;
            }
            case '贵州省': {
              item.name = '贵州';
              break;
            }
            case '云南省': {
              item.name = '云南';
              break;
            }
            case '西藏自治区': {
              item.name = '西藏';
              break;
            }
            case '陕西省': {
              item.name = '陕西';
              break;
            }
            case '甘肃省': {
              item.name = '甘肃';
              break;
            }
            case '青海省': {
              item.name = '青海';
              break;
            }
            case '宁夏回族自治区': {
              item.name = '宁夏';
              break;
            }
            case '新疆省': {
              item.name = '新疆';
              break;
            }
            case '台湾省': {
              item.name = '台湾';
              break;
            }
            case '香港特别行政区': {
              item.name = '香港';
              break;
            }
            case '澳门特别行政区': {
              item.name = '澳门';
              break;
            }
            case '新疆维吾尔自治区':{
              item.name = '新疆';
              break;
            }
            default:{
              item.name = item.province;
            }
          }
          let element = globaldataList.find(ele => ele.name === item.name )
          //console.log(item.province+'0')
          element.value = item.count;
          //console.log(item.province+'00')
          //console.log(element)
          //item.value = item.count;
        })

      }).catch((err)=>{
        console.log(err);
      })
      console.log('getdata结束')
    },
    myEcharts1() {
      console.log('echart 1 开始')
      var myChart = this.$echarts.init(document.getElementById('main'));
      //配置图表
      var option = {
        title: {
          text: '日活跃量',
          align: 'center',
          subtextStyle: {
            align: 'center'
          }
        },

        tooltip: {},
        legend: {
          data: ['活跃量']
        },

        xAxis: {
          type: 'category',
          data: timedata,
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '活跃量/人次',
          type: 'bar',
          data: activedata,
          smooth: true
        }]
      };
      myChart.setOption(option);
    },
    myEcharts2() {
      console.log('echart 2 开始')
      let dataList = globaldataList;
      this.$echarts.registerMap('china', china);
      let chinachart = this.$echarts.init(document.getElementById('main2'));
      let options = {
        title: {
          text: "游记地域分布图",
        },
        tooltip: {
          triggerOn: "click",
          formatter: function (e) {
            return e.seriesName + "<br />" + e.name + "：" + e.value;
          },
        },
        // 热力地图
        visualMap: {
          min: 0,
          max: 1000,
          textStyle: {
            color: "#000",
          },
          pieces: [
            {
              gt: 100,
              label: "> 100 篇",
              color: "#7f1100",
            },
            {
              gte: 10,
              lte: 100,
              label: "10 - 100 篇",
              color: "#ff5428",
            },
            {
              gte: 1,
              lt: 10,
              label: "1 - 9 篇",
              color: "#ff8c71",
            },
            {
              value: 0,
              label: "无",
              color: "#ffd768",
            },
          ],
        },
        series: [
          {
            name: "游记数",
            data: dataList,
            type: "map",
            map: "china",
            zoom: 1.2,
            aspectScale: 0.75,
            label: {
              // 默认文本标签样式
              normal: {
                color: "white",
                show: false,
              },
              // 高亮文本标签样式
              emphasis: {
                color: "yellow",
                fontSize: 22,
                fontWeight: "bold",
              },
            },
            itemStyle: {
              // 默认区域样式
              normal: {
                // 区域背景透明
                areaColor: "transparent",
                borderColor: "rgba(39,211,233, 1)",
                borderWidth: 1,
              },
              // 高亮区域样式
              emphasis: {
                // 高亮区域背景色
                areaColor: "#01ADF2",
              },
            },
          },
        ],
      };

      chinachart.setOption(options);
      // 添加窗口大小改变监听事件，当窗口大小改变时，图表会重新绘制，自适应窗口大小

      window.addEventListener("resize", function () {
        chinachart.resize();
      });
    },
    myEcharts3() {console.log('echart 3 开始')
      var myChart = this.$echarts.init(document.getElementById('main3'));
      //配置图表
      var option = {
        title: {
          text: '游记每日发布数',
          align: 'center',
          subtextStyle: {
            align: 'center'
          }
        },

        tooltip: {},
        legend: {
          data: ['活跃量']
        },

        xAxis: {
          type: 'category',
          data: timedata,
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '活跃量/人次',
          type: 'bar',
          data: traveldata,
          smooth: true
        }]
      };
      myChart.setOption(option);
    },
    myEcharts4() {

      console.log('echart 4 开始-----')
      console.log(companiondata)
      var myChart = this.$echarts.init(document.getElementById('main4'));
      //配置图表
      var option = {
        title: {
          text: '同行每日发布数',
          align: 'center',
          subtextStyle: {
            align: 'center'
          }
        },
        legend: {
          data: ['活跃量']
        },
        xAxis: {
          type: 'category',
          // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          data: timedata
        },

        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: companiondata,
            type: 'bar'
          }
        ]
      };
      myChart.setOption(option);
    },
    dataDownload(e,key) {
         console.log(e);
         alert('下载'+key);
    },
    drawEchart(value){
      switch (value){
        case '1':{
          this.myEcharts1();
          break;
        }
        case '2':{
          this.myEcharts2();
          break;
        }
        case '3':{
          this.myEcharts3();
          break;
        }
        case '4':{
          this.myEcharts4();
          break;
        }
      }
    }
  },
  mounted() {
    this.getData();
  },
  updated(){
    console.log('update 开始')
    this.myEcharts1();
    this.myEcharts2();
    this.myEcharts3();
    this.myEcharts4();
    console.log('update 结束')

  },

  data(){
    return{
      panes,
      activeKey:'0',
      latestactivedata,
      traveltodaydata,
    }
  }
}
</script>

<style scoped>

</style>
