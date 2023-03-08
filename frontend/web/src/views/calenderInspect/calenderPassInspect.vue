<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <a-select default-value="id" style="width: 100px; margin:0px 10px 15px 0px" @change="handleChange">
            <a-select-option value="id">
              日程编号
            </a-select-option>
            <a-select-option value="owner">
              用户编号
            </a-select-option>
          </a-select>

          <a-input-search placeholder="请输入搜索文本" style="width: 300px; margin:0 5px 0 2px"  @search="onSearch" />
          <a-button style="margin:0 5px 0 5px" type="primary" @click="add">查看</a-button>
          <a-button  style="margin:0 5px" @click="showModal">不通过</a-button>
          <a-modal v-model="refuseVisible" title="不通过原因" @ok="refuseHandleOk" @cancel="refuseHandleCancel">
            <a-textarea v-model="reason" auto-size />
          </a-modal>

          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns = "columns" :data-source="pane.data" :pagination="false">
              <a slot="schtitle" slot-scope="text,calender" @click="addSingle(calender)"> {{text}}</a>
              <template slot="action" >
                <a-button style="margin-right:0" size="small" type="primary" >查看</a-button>
              </template>
            </a-table>

            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>

        </div>
        <div v-else>
          <a-descriptions title="日程信息" bordered style="word-break: break-all;word-wrap: break-word;">
            <a-descriptions-item label="日程单名称">
              {{data[pane.key-1].schtitle}}
            </a-descriptions-item>
            <a-descriptions-item label="日程单编号">
              {{data[pane.key-1].titleid}}
            </a-descriptions-item>
            <a-descriptions-item label="日程单创建时间">
              {{data[pane.key-1].createTime}}
            </a-descriptions-item>
            <a-descriptions-item label="日程单执行时间">
              {{data[pane.key-1].schdate}}
            </a-descriptions-item>
            <a-descriptions-item label="发布者" :span="2">
              {{data[pane.key-1].owner}}
            </a-descriptions-item>
            <a-descriptions-item  v-for="item in data[pane.key-1].content"  :key="item" label="日程项目" :span="3" >
              {{item}}
            </a-descriptions-item>
          </a-descriptions>


        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
const columns = [
  {
    title: '日程计划单',
    dataIndex: 'schtitle',
    scopedSlots: { customRender: 'schtitle' },
  },
  {
    title: '计划单编号',
    dataIndex: 'titleid',
    scopedSlots: { customRender: 'titleid' },
  },
  {
    title: '计划执行日期',
    dataIndex: 'schdate',
  },
  {
    title: '计划单创建',
    dataIndex: 'createTime',
  },
];

let data=[
  {
    id : '001',
    time:'2022-4-21',
    location:'北京航空航天大学',
    ownerId:'000001',
    ownerNickname:'root2',
    ownerName:'root2',
    startTime:'2022-5-6',
    endTime:'2022-5-6',
    content:'Alpha版本展示',
    isAlert:'需要'
  }
];

export default {
  name: "calenderPassInspect",
  data() {
    const panes = [
      {title: '审核通过' , data:[] , key:"0" , closable : false },
    ]
    panes[0].data=[{
      id:'0001',
      content:'Alpha版本展示',
      ownerId:'000001',
      ownerName:'root2',
      createTime: '2022-4-21'

    }]
    return{
      spinning:false,
      panes,
      columns,
      data,
      activeKey:"0",
      searchType:'id',
      selectedRows:[],
      selectedRowKeys:[],
      refuseVisible:false,
      reason:'您的日程不符合社区日程规范',
      pageNum:1,

    }
  },
  mounted() {
    this.getCalenderList({"forbidden":0,page:1});
  },
  computed:{
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows = selectedRows;
          this.selectedRowKeys = selectedRowKeys;
          console.log(this.selectedRows)
        },
        getCheckboxProps: calender => ({
          props: {
            title: calender.id,
          },
        }),
      };
    },
  },

  methods:{
    schUnionItems(items) {
      let list=[];
      items.forEach(function (item) {
        let ans = "";
        ans += "开始时间：" + item.start_time+" 结束时间："+item.end_time;
        if (item.position!=null) {
          ans += " 地点在："+item.position.name;
        }
        if (item.content!=null){
          ans+= " 内容是："+item.content;
        }
        if (item.budget!=null) {
          ans+=" 预算是："+item.budget;
        }
        if (item.real_consumption!=null) {
          ans += " 实际支出为：" + item.real_consumption;
        }
        list.push(ans);

      })
      return list;
    },
    formatTime(time){
      const arr = time?.split('T');
      let newtime = arr[0] + " " +arr[1].split('+')[0];
      newtime = newtime.split('.')[0];
      return newtime;
    },
    getCalenderList(p) {
      this.spinning = true;
      console.log(p);
      this.$axios({
        method: "get",
        url: "/api/admin/schedule/",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        console.log(res);
        console.log(localStorage.getItem('Authorization'))
        if (this.count === 0) {
          this.data = [];
          this.pageNum = res.data.pages;
          this.panes[0].data = this.data;
          this.spinning = false;
        }
        else {
          this.data = res.data.results;
          this.pageNum = res.data.pages;
          let key = 1;
          this.data.forEach((item) => {
            item.key = key + '';
            key = key + 1;
            item.id = item.id == null ? null : item.id;
            item.schtitle = item.title;
            item.titleid = item.id;
            item.schdate = item.date;
            item.createTime = item.create_time;
            item.createTime = this.formatTime(item.createTime);
            item.owner = item.owner == null? null : item.owner;
            item.content = this.schUnionItems(item.schedule_items);

          })
          this.panes[0].data = this.data;
          this.spinning = false;
        }
      }).catch((error) => {
        alert(error)
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },

    dealCalender(d) {
      this.$axios({
        method: "post",
        url: "api/admin/schedule/forbid/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: d,
      }).then((res) => {
        console.log(res);
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    addSingle(calender){
      const panes = this.panes;
      let flag = 0;
      let item = calender;

      for(let j = 0; j<panes.length;j++){
        if(panes[j].key === item.key){
          flag = 1;
          break;
        }
      }

      if(flag == 0){
        panes.push({ title: item.title, data:item.data, key: item.key });
      }
      this.activeKey = item.key;
      this.panes = panes;
    },
    onEdit(targetKey, action) {this[action](targetKey);},
    remove(targetKey){
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
    handleChange(value){
      this.searchType = value;
      alert(this.searchType)
    },
    onSearch(value){
      alert(this.searchType)
      let params = {page:1,"forbidden":0};
      params[this.searchType] = value;
      this.getCalenderList(params);
    },
    add() {
      const panes = this.panes;
      let i = 0;
      this.selectedRows.forEach((item)=>{
        let flag = 0;
        for(let j = 0; j<panes.length;j++){
          if(panes[j].key === item.key){
            flag = 1;
            break;
          }
        }
        if(flag === 0){
          panes.push({ title: item.title, data:item.data, key: item.key });
          i=item.key;
          this.activeKey = i;
        }
      })
      this.panes = panes;
    },
    refuseHandleOk(){
      this.selectedRows.forEach((item)=>{
        this.dealCalender({"id": item.id, "status": "1", "reason": this.reason});
        this.remove(item.key);
      });
      this.getCalenderList({"page":"1", "forbidden": "0"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.refuseVisible = false;
    },
    refuseHandleCancel(){
      this.refuseVisible = false;
    },
    showModal(){
      this.refuseVisible = true;
    },
    onPageChange(page) {
      for (let i = 1; i < this.panes.length; i++) {
        this.remove(this.panes[i].key);
      }
      this.panes.splice(1, this.panes.length-1);
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.getRecords({"page": page, "forbidden": "0"});
    },

  },
}
</script>

<style scoped>

</style>
