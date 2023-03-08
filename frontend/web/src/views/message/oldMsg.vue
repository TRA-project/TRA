<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <!-- <a-input-search placeholder="input search text" style="width: 300px;margin:0px 10px 15px 0px"  @search="onSearch" />
          <a-button style="margin:0 5px" type="primary" @click="add">查看</a-button> -->
          <a-button style="margin:0px 10px 15px 0px" type="primary" @click="add">查看</a-button>
          <!-- <a-button style="margin:0 5px" @click="deleteMsgs">删除</a-button> -->
          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data"  :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{ text}}</a>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="系统信息" bordered style="word-break: break-all;word-wrap: break-word;">
            <a-descriptions-item label="信息编号" :span="1">
              {{data[pane.key-1].id}}
            </a-descriptions-item>
            <a-descriptions-item label="发送时间" :span="2">
              {{data[pane.key-1].createTime}}
            </a-descriptions-item>
            <a-descriptions-item label="信息内容" :span="3">
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
    title: '信息编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
    width: '80px',
  },
  {
    title: '发送时间',
    dataIndex: 'createTime',
    width: '160px',
  },
  {
    title: '信息内容',
    dataIndex: 'content',
    width: '300px',
    ellipsis: true,
  }
];

export default {
  name:"oldMsg",
  data() {
    const panes = [
      { title: '信息管理', data:[],  key: '0' ,closable: false },
    ];
    return {
      spinning:true,
      data:[],
      columns,
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
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          this.selectedRows = selectedRows;
          this.selectedRowKeys = selectedRowKeys;
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.id === 'Disabled User', // Column configuration not to be checked
            title: record.id,
          },
        }),
      };
    },
  },
  mounted(){
    this.getMsgs({"page":"1", "type": "0"});
  },
  methods: {
    getMsgs(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/messages/",
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
          let time_array = item.time.split("T");
          item.createTime = time_array[0] + " " + time_array[1].split("+")[0].split(".")[0];
        })
        this.panes[0].data = this.data;
        this.spinning = false;
      }).catch((error) => {
        console.log(error);
        if (error.response.status == 403) {
          console.log(localStorage.getItem('Authorization'))
          this.visible = true;
        }
      });
    },
    // deleteMsgs(msgId) {
    //   this.$axios({
    //     method: "delete",
    //     url: "api/admin/messages/" + msgId + "/",
    //     params: {},
    //     headers: {
    //       Authorization: localStorage.getItem('Authorization')
    //     },
    //     data: {},
    //   }).then((res) => {
    //     console.log(res);
    //   }).catch((error) => {
    //     if (error.response.status == 403) {
    //       this.visible = true;
    //     }
    //   });
    // },
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
    // handleChange(value) {
    //   this.searchType = value;
    // },
    // onSearch(value){
    //   console.log(value);
    // },
    onPageChange(page) {
      for (let i = 1; i < this.panes.length; i++) {
        this.remove(this.panes[i].key);
      }
      this.panes.splice(1, this.panes.length-1);
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.getMsgs({"page": page, "type": 0});
    },
    // deleteMsgs() {
    //   this.selectedRows.forEach((item)=>{
    //     this.deleteMsgs(item.id);
    //     this.remove(item.key);
    //   });
    //   this.getMsgs({"page":"1"});
    //   this.selectedRows = [];
    //   this.selectedRowKeys = [];
    // },
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
