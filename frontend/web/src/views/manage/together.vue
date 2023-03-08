<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <!-- <a-input-search placeholder="input search text" style="width: 300px;margin:0px 10px 15px 0px"  @search="onSearch" />
          <a-button style="margin:0 5px" type="primary" @click="add">查看</a-button> -->
          <a-button style="margin:0px 10px 15px 0px" type="primary" @click="add">查看</a-button>
          <a-button style="margin:0 5px" @click="deleteTogethers">删除</a-button>
          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data"  :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{ text}}</a>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="同行活动信息" bordered style="word-break: break-all;word-wrap: break-word;">
            <a-descriptions-item label="编号">
              {{data[pane.key-1].id}}
            </a-descriptions-item>
            <a-descriptions-item label="地点">
              {{data[pane.key-1].position.name}}
            </a-descriptions-item>
            <a-descriptions-item label="人数">
              {{data[pane.key-1].capacity}}
            </a-descriptions-item>
            <a-descriptions-item label="发布者编号">
              {{data[pane.key-1].ownerId}}
            </a-descriptions-item>
            <a-descriptions-item label="发布者名称">
              {{data[pane.key-1].ownerName}}
            </a-descriptions-item>
            <a-descriptions-item label="发布者昵称">
              {{data[pane.key-1].ownerNickname}}
            </a-descriptions-item>
            <a-descriptions-item label="活动发布时间" :span="1.5">
              {{data[pane.key-1].createTime}}
            </a-descriptions-item>
            <a-descriptions-item label="报名截止时间" :span="1.5">
              {{data[pane.key-1].deadlineTime}}
            </a-descriptions-item>
            <a-descriptions-item label="活动开始时间" :span="1.5">
              {{data[pane.key-1].startTime}}
            </a-descriptions-item>
            <a-descriptions-item label="活动结束时间" :span="1.5">
              {{data[pane.key-1].endTime}}
            </a-descriptions-item>
            <a-descriptions-item label="活动标题" :span="3">
              {{data[pane.key-1].title}}
            </a-descriptions-item>
            <a-descriptions-item label="活动内容" :span="3">
              {{data[pane.key-1].content}}
            </a-descriptions-item>
            <a-descriptions-item label="活动参与者" :span="3">
              <a-table v-if="data[pane.key-1].fellows.length > 0" class="fellowtlb" style="width: 600px" :pagination="false" :columns="fellowColumns" :data-source="data[pane.key-1].fellows" rowKey="id">
              </a-table>
            </a-descriptions-item>
            <a-descriptions-item label="计划单名称">
              {{data[pane.key-1].schTitle}}
            </a-descriptions-item>
            <a-descriptions-item label="计划单日期">
              {{data[pane.key-1].schDate}}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{data[pane.key-1].schcreateTime}}
            </a-descriptions-item>
            <a-descriptions-item  v-for="item in data[pane.key-1].schContent"  :key="item" label="日程项目" :span="3" >
              {{item}}
            </a-descriptions-item>

          </a-descriptions>
        </div>

      </a-tab-pane>
    </a-tabs>
    <a-modal
        title="提示"
        :visible="visible"
        :confirm-loading="confirmLoading"
        @ok="handleOk"
        @cancel="handleCancel"
      >
      <p>{{ ModalText }}</p>
    </a-modal>
  </div>
</template>
<script>
const columns = [
  {
    title: '同行编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '同行标题',
    dataIndex: 'title',
  },
  {
    title: '用户编号',
    dataIndex: 'ownerId',
  },
  {
    title: '用户名称',
    dataIndex: 'ownerName',
  },
  {
    title: '发布时间',
    dataIndex: 'createTime',
  },
  {
    title: '审核状态',
    dataIndex: 'status',
  },
];
const fellowColumns = [
  {
    title: '用户编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '用户名称',
    dataIndex: 'name'
  },
  {
    title: '用户昵称',
    dataIndex: 'nickname'
  }
]

export default {
  name:"together",
  data() {
    const panes = [
      { title: '同行管理', data:[],  key: '0' ,closable: false },
    ];
    return {
      spinning:true,
      data:[],
      columns,
      fellowColumns,
      activeKey: panes[0].key,
      panes,
      selectedRows:[],
      selectedRowKeys:[],
      newTabIndex: 0,
      page: 1,
      pageNum: 1,
      visible: false,
      confirmLoading: false,
      ModalText: '您的登录信息已过期，请重新登录'
    };
  },
  computed:{
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows = selectedRows;
          this.selectedRowKeys = selectedRowKeys;
        },
        getCheckboxProps: record => ({
          props: {
            title: record.id,
          },
        }),
      };
    },
  },
  mounted(){
    this.getTogethers({"page":"1"});
  },
  methods: {
    formatTime(time){
      const arr = time?.split('T');
      let newtime = arr[0] + " " +arr[1].split('+')[0];
      newtime = newtime.split('.')[0];
      return newtime;
    },
    schUnionItems(items) {
      if (items == null) return [];
      let list=[];
      //console.log('items:')
      ///console.log(items)
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
    getTogethers(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/companions/",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        this.data = res.data.results;
        this.pageNum = res.data.pages;
        let key = 1;
        this.data.forEach((item)=>{
          item.key = key + '';
          key = key + 1;
          item.ownerId = item.owner == null ? null : item.owner.id;
          item.ownerName = item.owner == null ? null : item.owner.name;
          item.ownerNickname = item.owner == null ? null : item.owner.nickname;
          item.positionName = item.position == null ? null : item.position.name;
          let time_array = item.time.split("T");
          item.createTime = time_array[0] + " " + time_array[1].split("+")[0].split(".")[0];
          time_array = item.deadline.split("T");
          item.deadlineTime = time_array[0] + " " + time_array[1].split("+")[0].split(".")[0];
          time_array = item.start_time.split("T");
          item.startTime = time_array[0] + " " + time_array[1].split("+")[0].split(".")[0];
          time_array = item.end_time.split("T");
          item.endTime = time_array[0] + " " + time_array[1].split("+")[0].split(".")[0];

          item.schContent = item.schedule == null ? [] : this.schUnionItems(item.schedule.schedule_items);
          item.schTitle = item.schedule == null ? '空': item.schedule.title;
          item.schDate = item.schedule == null ? '空': item.schedule.date;
          item.schcreateTime = item.schedule == null ? '空': item.schedule.create_time;
          item.schcreateTime = item.schcreateTime == '空' ? '空' :this.formatTime(item.schcreateTime)

          item.status = "审核通过";
          if (item.forbidden == "1") {
            item.status = "人工审核不通过"
          } else if (item.forbidden == "2") {
            item.status = "机器审核不通过"
          }
        })
        this.panes[0].data = this.data;
        this.spinning = false;
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    deleteTogether(togetherId) {
      this.$axios({
        method: "delete",
        url: "api/admin/companions/" + togetherId + "/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        console.log(res);
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    handleOk() {
      this.ModalText = '该对话框将在2秒后关闭';
      this.confirmLoading = true;
      setTimeout(() => {
        this.visible = false;
        this.confirmLoading = false;
        this.$router.push('/login');
      }, 2000);
    },
    handleCancel() {
      this.visible = false;
    },
    onPageChange(page) {
      for (let i = 1; i < this.panes.length; i++) {
        this.remove(this.panes[i].key);
      }
      this.panes.splice(1, this.panes.length-1);
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.getTogethers({"page": page});
    },
    deleteTogethers() {
      this.selectedRows.forEach((item)=>{
        this.deleteTogether(item.id);
        this.remove(item.key);
      });
      this.getTogethers({"page":"1"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
    },
    callback(key) {
      console.log(key);
    },
    onEdit(targetKey, action) {
      this[action](targetKey);
      console.log("targetKey:"+targetKey);
      console.log("action:"+action);
      console.log(this.panes);
    },
    addSingle(record){
      console.log(record);
      const panes = this.panes;
        let flag = 0;
        let item = record;
        console.log(item);
        for(let j = 0; j<panes.length;j++){
          if(panes[j].key == item.key){
            console.log("item.key:"+item.key);
            flag = 1;
            break;
          }
        }
        if(flag == 0){
          panes.push({ title: item.id, data:item.data, key: item.key });

        }
         this.activeKey = item.key;
         this.panes = panes;
    },
    add() {
      const panes = this.panes;
      let i = 0;
      this.selectedRows.forEach((item)=>{
        let flag = 0;
        for(let j = 0; j<panes.length;j++){
          if(panes[j].key == item.key){
            flag = 1;
            break;
          }
        }
        if(flag == 0){
          panes.push({ title: item.id, data:item.data, key: item.key });
          i=item.key;
          this.activeKey = i;
        }
      })
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
  },
};
</script>

<style>
.fellowtlb .ant-table-thead > tr > th {
  background: transparent;
}
</style>
