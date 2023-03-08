<template>
  <div style="text-align: left; margin: 10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <a-button style="margin: 0px 10px 15px 0px" type="primary" @click="add">查看</a-button>
          <a-button style="margin: 0 5px" type="primary" @click="passTogethers">通过</a-button>
          <a-button  style="margin: 0 5px" @click="showModal">不通过</a-button>

          <a-modal v-model="refuseVisible" title="不通过原因" @ok="refuseHandleOk" @cancel="refuseHandleCancel">
            <a-textarea v-model="reason" auto-size />
          </a-modal>

          <a-modal v-model="refuseSingleVisible" title="不通过原因" @ok="refuseSingleHandleOk" @cancel="refuseSingleHandleCancel">
            <a-textarea v-model="singleReason" auto-size />
          </a-modal>

          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data" :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{ text }} </a>
              <template slot="action" slot-scope="record" >
                <a-button style="margin-right:10px" size="small" type="primary" @click="passSingleTogether(record)">通过</a-button>
                <a-button size="small" @click="showSingleModal(record)">不通过</a-button>
              </template>
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
              {{data[pane.key-1].owneNickname}}
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
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

export default {
  name:"togetherUnderInspect",
  data() {
    const panes = [
      { title: '待审核', data:[],  key: '0' ,closable: false },
    ];
    return {
      spinning:true,
      data:[],
      searchType: "id",
      columns,
      activeKey: panes[0].key,
      panes,
      selectedRows:[],
      selectedRowKeys:[],
      page: 1,
      pageNum: 1,
      refuseVisible: false,
      refuseSingleVisible: false,
      reason: "",
      singleReason: "",
      singleRecord: null,
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
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
    this.getTogethers({"page": "1", "forbidden": "2"});
  },
  methods: {
    showSingleModal(record) {
      this.singleRecord = record;
      this.refuseSingleVisible = true;
    },
    showModal() {
      this.refuseVisible = true;
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
        })
        this.panes[0].data = this.data;
        this.spinning = false;
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    dealTogether(d) {
      this.$axios({
        method: "post",
        url: "api/admin/companions/forbid/",
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
    handleChange(value) {
      this.searchType = value;
    },
    onSearch(value){
      let params = {"page": "1", "forbidden": "2"};
      params[this.searchType] = value;
      this.getTogethers(params);
    },
    onPageChange(page) {
      for (let i = 1; i < this.panes.length; i++) {
        this.remove(this.panes[i].key);
      }
      this.panes.splice(1, this.panes.length-1);
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.getTogethers({"page": page, "forbidden": "2"});
    },
    passSingleTogether(record) {
      this.dealTogether({"id": record.id, "status": "0"});
      this.remove(record.key);
      this.getTogethers({"page": "1", "forbidden": "2"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
    },
    passTogethers() {
      this.selectedRows.forEach((item)=>{
        this.dealTogether({"id": item.id, "status": "0"});
        this.remove(item.key);
      });
      this.getTogethers({"page":"1", "forbidden": "2"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
    },
    refuseSingleHandleOk() {
      this.dealTogether({"id": this.singleRecord.id, "status": "1", "reason": this.singleReason});
      this.remove(this.singleRecord.key);
      this.getTogethers({"page":"1", "forbidden": "2"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.refuseSingleVisible = false;
    },
    refuseHandleOk() {
      this.selectedRows.forEach((item)=>{
        this.dealTogether({"id": item.id, "status": "1", "reason": this.reason});
        this.remove(item.key);
      });
      this.getTogethers({"page":"1", "forbidden": "2"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.refuseVisible = false;
    },
    refuseSingleHandleCancel() {
      this.refuseSingleVisible = false;
    },
    refuseHandleCancel() {
      this.refuseVisible = false;
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
      const panes = this.panes;
        let flag = 0;
        let item = record;
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
      // const activeKey = `newTab${this.newTabIndex++}`;
      let i = 0;
      this.selectedRows.forEach((item)=>{
        let flag = 0;
        for(let j = 0; j<panes.length;j++){
          if(panes[j].key == item.key){
            console.log("item.key:"+item.key);
            flag = 1;
            break;
          }
        }
        console.log("flag:"+flag);
        if(flag == 0){
          panes.push({ title: item.id, data:item.data, key: item.key });
          i=item.key;
          console.log(i);
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
