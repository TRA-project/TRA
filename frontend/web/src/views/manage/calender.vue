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
          <a-button style="margin:0 5px 0 50px; width: 64px; height: 32px" type="primary" @click="add">查看</a-button>
          <a-button style="margin:0 5px; width: 64px; height: 32px" @click="deleteCalendes">删除</a-button>

          <a-spin :spinning="false">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data" :pagination="false">
              <a slot="ctitle" slot-scope="text, calender" @click="addSingle(calender)">{{text}}</a>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="日程信息" bordered style="word-break: break-all;word-wrap: break-word;">
            <a-descriptions-item label="日程标题" :span="3">
              {{data[pane.key-1].title}}
            </a-descriptions-item>
            <a-descriptions-item label="日程编号">
              {{data[pane.key-1].id}}
            </a-descriptions-item>
            <a-descriptions-item label="日程地点">
              {{data[pane.key-1].positionName}}
            </a-descriptions-item>
            <a-descriptions-item label="发布时间">
              {{data[pane.key-1].createTime}}
            </a-descriptions-item>
            <a-descriptions-item label="用户ID">
              {{data[pane.key-1].ownerId}}
            </a-descriptions-item>
            <a-descriptions-item label="用户名称">
              {{data[pane.key-1].ownerName}}
            </a-descriptions-item>
            <a-descriptions-item label="用户昵称">
              {{data[pane.key-1].ownerNickname}}
            </a-descriptions-item>
            <a-descriptions-item label="日程内容" :span="3">
              {{data[pane.key-1].content}}
            </a-descriptions-item>
          </a-descriptions>
          <a-button @click="deleteCalende(data[pane.key-1].id)" > 删除此日程</a-button>
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


export default {
  name:"record",
  data() {
    const panes = [
      { title: '日程管理', data:[],  key: '0' ,closable: false },
    ];
    panes[0].data=[{
      id:'0001',
      content:'Alpha版本展示',
      ownerId:'000001',
      ownerName:'root2',
      createTime: '2022-4-21',
      time:'2022-5-06',
      status:'审核通过'

    }];
    return {
      spinning:true,
      data:[],
      searchType: "id",
      columns,
      commentSelectedNum: "",
      activeKey: panes[0].key,
      panes,
      selectedRows:[],
      selectedRowKeys:[],
      newTabIndex: 0,
      page: 1,
      pageNum: 1,
      commentPage: "page" + 1,
      commentPageNum: {},
      visible: false,
      confirmLoading: false,
      ModalText: '您的登录信息已过期，请重新登录',
      commentReplyDict: {},
    };
  },
  computed:{
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
    this.getCalendes({"page":"1"});
  },
  methods: {
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
    getCalendes(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "/api/admin/schedule/",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
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

          if (item.forbidden == "1") {
            item.status = "人工审核不通过"
          } else if (item.forbidden == "2") {
            item.status = "机器审核不通过"
          }

        })
        this.panes[0].data = this.data;
        this.spinning = false;
      }).catch((error) => {
        alert(error)
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
      this.page = page;
      this.spinning = true;
      this.getRecords({"page": page});
    },
    getComments(p) {
      console.log(p);
      this.$axios({
        method: "get",
        url: "api/admin/comments/",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        let commentData = res.data.results;
        commentData.forEach((comment) => {
          comment.status = comment.deleted == false ? "保留" : "已删除";
          comment.commentId = comment.reply == null ? comment.id : comment.id + " 回复 " + comment.reply;
        });
        this.data[this.activeKey-1].commentData = commentData;
        this.commentPage = p["page"] - 1;
        this.commentPage = this.activeKey-1 + "page" + this.commentPage;
        this.data[this.activeKey - 1].commentSelectedRows = [];
        this.data[this.activeKey - 1].commentSelectedRowKeys = [];
        this.data[this.activeKey - 1].commentSelected = false;
        this.commentSelectedNum = this.activeKey - 1 + "";
      }).catch((error) => {
        console.log(error);
      })
    },
    onCommentPageChange(commentPage) {
      this.$axios({
        method: "get",
        url: "api/admin/comments/",
        params: {
          "travel": this.data[this.activeKey-1].id,
          "page": commentPage
        },
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        let commentData = res.data.results;
        commentData.forEach((comment) => {
          comment.status = comment.deleted == false ? "保留" : "已删除";
          comment.commentId = comment.reply == null ? comment.id : comment.id + " 回复 " + comment.reply;
        });
        this.data[this.activeKey-1].commentData = commentData;
        this.commentPage = this.activeKey-1 + "page" + commentPage;
        this.data[this.activeKey - 1].commentSelectedRows = [];
        this.data[this.activeKey - 1].commentSelectedRowKeys = [];
        this.data[this.activeKey - 1].commentSelected = false;
        this.commentSelectedNum = this.activeKey - 1 + "";
      }).catch((error) => {
        console.log(error);
      })
      // this.getComments({"travel": this.data[this.activeKey-1].id, "page": commentPage})
    },
    deleteRecords() {
      this.selectedRows.forEach((item)=>{
        this.deleteRecord(item.id);
        this.remove(item.key);
      });
      this.page = 1;
      this.getRecords({"page":"1"});
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
    addSingle(calender){
      console.log(calender);
      const panes = this.panes;
      let flag = 0;
      let item = calender;
      console.log(item);

      for(let j = 0; j<panes.length;j++){
        if(panes[j].key == item.key){
          console.log("item.key:"+item.key);
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
    deleteCalende(canlendeId) {
      let deleteId = canlendeId;
      //alert(deleteId);
      this.$axios({
        method: "delete",
        url: "/api/admin/schedule/"+deleteId+"/",
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      })
      this.getCalendes({"page":"1"});
      this.activeKey = '0';
    },
    deleteCalendes(){
      this.selectedRows.forEach((item)=>{
        this.deleteCalende(item.id);
        this.remove(item.key);
      });
      this.page = 1;
      this.getCalendes({"page":"1"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
    },
    handleChange(value) {
      this.searchType = value;
    },
    onSearch(value){
      this.page = 1;
      let params = {page:1};
      params[this.searchType] = value;
      console.log('params:');
      console.log(params)
      this.getCalendes(params);
    },

  },
};
</script>

<style scoped>

</style>
