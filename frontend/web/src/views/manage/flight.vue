<template>
<div style="text-align:left;margin:10px 0">
  <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
    <a-tab-pane  v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
      <div v-if="pane.key ==='0'">
        <a-select default-value="city" style="width: 100px; margin:0px 10px 15px 0px"   @change="handleSearchChange">
          <a-select-option value="city">
            始发地
          </a-select-option>
          <a-select-option value="endcity">
            目的地
          </a-select-option>
          <a-select-option value="date">
            出发时间
          </a-select-option>
          <a-select-option value="fid">
            航班编号
          </a-select-option>

        </a-select>
        <a-input-search placeholder="请输入飞机编号" style="width: 300px; margin:0 5px 0 2px" @search="search" />
        <a-button style="margin:0 0px 0 0px" type="primary" >查看</a-button>

        <a-spin :spinning="spinning">
          <a-table :row-selection="rowSelection" :columns = "columns" :data-source="pane.data" :pagination="false" >
            <a slot="flightId" slot-scope="text, flight" @click="addSingle(flight)">{{text}}</a>
          </a-table>

          <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
        </a-spin>

      </div>
      <div v-else>
        <a-descriptions title="航班信息" bordered style="word-break: break-all;word-wrap: break-word;">
          <a-descriptions-item label="航班编号">
            {{data[pane.key-1].flightId}}
          </a-descriptions-item>
          <a-descriptions-item label="起飞时间">
            {{data[pane.key-1].takeOffTime}}
          </a-descriptions-item>
          <a-descriptions-item label="始发地">
            {{data[pane.key-1].startCity}}
          </a-descriptions-item>
          <a-descriptions-item label="目的地">
            {{data[pane.key-1].targetCity}}
          </a-descriptions-item>
          <a-descriptions-item label="当前状态">
            {{data[pane.key-1].flightStatus}}
          </a-descriptions-item>
        </a-descriptions>
        <a-button style="margin-left:20px;"  type="primary" @click="changeFlightState" >修改航班状态</a-button>

        <a-modal  v-model="visible" title="修改航班状态" @ok="handleOk(data[pane.key-1].id,pane.key-1)">
          <a-select :default-value="data[pane.key-1].flightStatus" style="width: 120px; " @change="handleChange">
            <a-select-option value="正常">
              正常
            </a-select-option>
            <a-select-option value="晚点">
              晚点
            </a-select-option>
            <a-select-option value="提前">
              提前
            </a-select-option>
            <a-select-option value="异常">
              异常
            </a-select-option>
          </a-select>
<!--          <a-textarea style="width: 120px;height:20px">-->
<!--          </a-textarea>-->
<!--          分钟-->
        </a-modal>
      </div>


    </a-tab-pane>
  </a-tabs>
</div>
</template>

<script>


const columns = [
  {
    title:'航班编号',
    dataIndex:'flightId',
    key:'flightId',
    scopedSlots: { customRender: 'flightId' },

  },
  {
    title:'始发地',
    dataIndex:'startCity',

  },
  {
    title:'目的地',
    dataIndex: 'targetCity',

  },
  {
    title:'起飞时间',
    dataIndex:'takeOffTime',

  },
  {
    title:'降落时间',
    dataIndex:'arrivalTime',

  },
  {
    title:'当前状态',
    dataIndex:'flightStatus',
  }

]

let data=[{
  flightId:'CA123456',
  startCity:'北京',
  targetCity:'上海',
  takeOffTime:'2022-5-6 00:00:00',
  arriveTime:'2022-5-6 01:00:00',
  flightStatus:'未起飞',
  key :'1',
}];
let pageNum;
let selectstatus;
let searchType='city';
export default {
  name: "flight",

  data() {
    const panes = [
      { title: '航班管理', data:[],  key: '0' ,closable: false },
    ];
    panes[0].data = [{
      flightId:'CA123456',
      startCity:'北京',
      targetCity:'上海',
      takeOffTime:'2022-5-6 00:00:00',
      arrivalTime:'2022-5-6 01:00:00',
      flightStatus:'未起飞',
      key :'1',
    }]

    return {
      activeKey : panes[0].key,
      panes,
      columns,
      selectedRowKeys:[],
      data,
      visible:false,
      spinning:false,
      pageNum,
      searchType,

    }
  },
  computed : {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          this.selectedRows = selectedRows;
          this.selectedRowKeys = selectedRowKeys;
        },
        getCheckboxProps: record => ({
          props: {
            title: record.flightId,
          },
        }),
      };
    },
  },
  mounted() {
    this.getFlight({page:1});
  },
  methods:{
    formatTime(time){
      const arr = time?.split('T');
      const newtime = arr[0] + " " +arr[1].split('+')[0];
      return newtime;
    },
    handleChange(value) {
      //alert(value);
      selectstatus = value;

    },
    handleSearchChange(value){
      this.searchType = value;
      alert(this.searchType);
    },
    search(value){
      let p={page:1};
      p[this.searchType] = value;
      this.getFlight(p);
    },
    handleOk(fid,key){
      //alert(fid+' '+selectstatus)
      let status = 0;
      switch (selectstatus){
        case '正常': status=0;break;
        case '晚点': status=1;break;
        case '提前': status=2;break;
        case '异常': status=3;break;
      }

      this.$axios({
        method: "put",
        url: "api/admin/flight/"+fid+'/',
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {
          status:status
        },
      }).then(()=>{
        alert('修改成功')
      })
      this.visible = false;
      this.panes[0].data[key].flightStatus = selectstatus
      //console.log(changeStatus)
    },
    callback(key) {
      console.log(key);
    },
    onEdit(targetKey, action) {
      this[action](targetKey);
    },
    getFlight(p) {
      //alert('调用flightlist')
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/flight/",
        params:p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        //alert('成功')
        this.data = res.data.results;
        this.pageNum = res.data.pages;
        let key = 1;
        this.data.forEach((item)=>{
          item.key = key + '';
          key = key + 1;
          item.flightId = item.flight_no == null? null : item.flight_no;
          item.startCity = item.city.name ==  null? null : item.city.name+" ";
          item.startCity += item.departport.name == null? null : item.departport.name;
          item.targetCity = item.endcity.name == null ? null:item.endcity.name+" ";
          item.targetCity += item.arrivalport.name == null? null : item.arrivalport.name;
          item.takeOffTime = item.depart_time == null ? null : item.depart_time;
          item.arrivalTime = item.arrival_time == null ? null : item.arrival_time;
          item.positionName = item.position == null ? null : item.position.name;
          item.arrivalTime = this.formatTime(item.arrivalTime);
          item.takeOffTime = this.formatTime(item.takeOffTime);
          switch (item.status) {
            case 0: item.flightStatus='正常';break;
            case 1:item.flightStatus='晚点';break;
            case 2:item.flightStatus='提前';break;
            case 3:item.flightStatus="异常";break;
          }
          // const c = changeStatus.find(ele=>ele.fid === item.flightId);
          // if (c != null) {
          //   item.flightStatus = c.status;
          // }else {
          //   item.flightStatus = '正常';
          // }

        })
        this.panes[0].data = this.data;
        this.spinning = false;
      }).catch((error) => {
        alert(error);
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    changeFlightState( ) {
      this.visible = true;
    },
    addSingle(flight){
      console.log(flight);
      const panes = this.panes;
      let flag = 0;
      let item = flight;
      console.log(item);
      for(let j = 0; j<panes.length;j++){
        if(panes[j].key == item.key){
          console.log("item.key:"+item.key);
          flag = 1;
          break;
        }
      }
      if(flag == 0){
        panes.push({ title: item.flightId, data:item.data, key: item.key,closable:true });
      }
      this.activeKey = item.key;
      this.panes = panes;
    },
    remove(targetKey) {
      let activeKey = this.activeKey;
      let lastIndex;
      this.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.panes.filter(pane => pane.key !== targetKey);
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].key;
        } else {
          activeKey = panes[0].key;
        }
      }
      this.panes = panes;
      this.activeKey = activeKey;
    },
    onSearch(value){
      this.page = 1;
      let params = {"page":"1"};
      params[this.searchType] = value;
      this.getRecords(params);
    },
    onPageChange(page) {
      for (let i = 1; i < this.panes.length; i++) {
        this.remove(this.panes[i].key);
      }
      this.panes.splice(1, this.panes.length-1);
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.page = page;
      this.spinning = true;
      this.getFlight({page: page});
    },

  }

}
</script>





























































<style scoped>

</style>
