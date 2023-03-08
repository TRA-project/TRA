<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <a-select default-value="id" style="width: 100px; margin:0px 10px 15px 0px" @change="handleChange">
            <a-select-option value="id">
              游记编号
            </a-select-option>
            <a-select-option value="content">
              游记内容
            </a-select-option>
            <a-select-option value="position">
              游记地点
            </a-select-option>
            <a-select-option value="owner">
              用户编号
            </a-select-option>
          </a-select>
          <a-input-search placeholder="请输入搜索文本" style="width: 300px; margin:0 5px 0 2px"  @search="onSearch" />
          <a-button style="margin:0 5px 0 50px; width: 64px; height: 32px" type="primary" @click="add">查看</a-button>
          <a-button style="margin:0 5px; width: 64px; height: 32px" @click="deleteRecords">删除</a-button>
          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data" :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{text}}</a>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="游记信息" bordered style="word-break: break-all;word-wrap: break-word;">
            <a-descriptions-item label="游记标题" :span="3">
              {{data[pane.key-1].title}}
            </a-descriptions-item>
            <a-descriptions-item label="游记编号">
              {{data[pane.key-1].id}}
            </a-descriptions-item>
            <a-descriptions-item label="游记地点">
              {{data[pane.key-1].positionName}}
            </a-descriptions-item>
            <a-descriptions-item label="发布时间">
              {{data[pane.key-1].createTime}}
            </a-descriptions-item>
            <a-descriptions-item label="用户编号">
              {{data[pane.key-1].ownerId}}
            </a-descriptions-item>
            <a-descriptions-item label="用户名称">
              {{data[pane.key-1].ownerName}}
            </a-descriptions-item>
            <a-descriptions-item label="用户昵称">
              {{data[pane.key-1].ownerNickname}}
            </a-descriptions-item>
            <a-descriptions-item label="阅读数">
              {{data[pane.key-1].read_total}}
            </a-descriptions-item>
            <a-descriptions-item label="评论数">
              {{data[pane.key-1].commentLength}}
            </a-descriptions-item>
            <a-descriptions-item label="点赞数">
              {{data[pane.key-1].likes}}
            </a-descriptions-item>
            <a-descriptions-item label="游记内容" :span="3">
              {{data[pane.key-1].content}}
            </a-descriptions-item>
            <a-descriptions-item label="游记封面" :span="3">
              <img :src="data[pane.key-1].coverImage" width="500" alt="">
            </a-descriptions-item>
            <a-descriptions-item label="游记图片" :span="3">
              <div v-for="item in data[pane.key-1].recordImages" :key="item">
                <img :src="item" width="500" alt="">
              </div>
            </a-descriptions-item>
          </a-descriptions>
          <a-descriptions title="游记评论" style="margin-top: 20px">
          </a-descriptions>
          <div style="margin-bottom: 16px" :key="commentSelectedNum">
            <a-button type="primary" :disabled="!data[pane.key-1].commentSelected" @click="deleteComments">
              删除
            </a-button>
            <span style="margin-left: 8px">
              <template v-if="data[pane.key-1].commentSelected">
                {{ `已选中 ${data[pane.key-1].commentSelectedRowKeys.length} 条评论` }}
              </template>
            </span>
          </div>
          <a-table
            :row-selection="{ selectedRowKeys: data[pane.key-1].commentSelectedRowKeys, onChange: commentRowSelection}"
            :columns="commentColumns"
            :data-source="data[pane.key-1].commentData"
            :pagination="false"
            :key="commentPage"
            rowKey="id"
          >
          </a-table>
          <br>
          <a-pagination show-quick-jumper :page-size="1" :total="data[pane.key-1].commentPageNum" @change="onCommentPageChange" />
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
    title: '游记编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '游记标题',
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
    title: '游记地点',
    dataIndex: 'positionName',
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

const commentColumns = [
  {
    title: '编号',
    dataIndex: 'commentId',
    width: '150px'
  },
  {
    title: '内容',
    dataIndex: 'content',
    width: '800px'
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '80px'
  },
];

export default {
  name:"record",
  data() {
    const panes = [
      { title: '游记管理', data:[],  key: '0' ,closable: false },
    ];
    return {
      spinning:true,
      data:[],
      searchType: "id",
      columns,
      commentColumns,
      commentSelectedNum: "",
      // commentSelectedRows:[],
      // commentSelectedRowKeys: [],
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
    // commentHasSelected() {
    //   return this.data[this.activeKey - 1].commentSelectedRowKeys.length > 0;
    // },
    // commentRowSelection() {
    //   return {
    //     onChange: (commentSelectedRowKeys, commentSelectedRows) => {
    //       console.log(`selectedRowKeys: ${commentSelectedRowKeys}`, 'selectedRows: ', commentSelectedRows);
    //       this.data[this.activeKey-1].commentSelectedRows = commentSelectedRows;
    //       this.data[this.activeKey-1].commentSelectedRowKeys = commentSelectedRowKeys;
    //       this.data[this.activeKey-1].commentSelected = commentSelectedRowKeys.length > 0;
    //       this.commentSelectedNum = this.activeKey - 1 + "" + this.data[this.activeKey-1].commentSelectedRowKeys.length;
    //     },
    //   }
    // },
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
    this.getRecords({"page":"1"});
  },
  methods: {
    commentRowSelection(commentSelectedRowKeys, commentSelectedRows) {
      console.log(`selectedRowKeys: ${commentSelectedRowKeys}`, 'selectedRows: ', commentSelectedRows);
      this.data[this.activeKey-1].commentSelectedRows = commentSelectedRows;
      this.data[this.activeKey-1].commentSelectedRowKeys = commentSelectedRowKeys;
      this.data[this.activeKey-1].commentSelected = commentSelectedRowKeys.length > 0;
      this.commentSelectedNum = this.activeKey - 1 + "" + this.data[this.activeKey-1].commentSelectedRowKeys.length;
    },
    deleteComments() {
      this.$axios({
        method: "post",
        url: "api/admin/comments/delete/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {
          id: this.data[this.activeKey - 1].commentSelectedRowKeys
        },
      }).then((res) => {
        console.log(res);
        this.data[this.activeKey - 1].commentSelectedRows = [];
        this.data[this.activeKey - 1].commentSelectedRowKeys = [];
        this.data[this.activeKey - 1].commentSelected = false;
        this.commentSelectedNum = this.activeKey - 1 + "";
        this.getComments({"travel": this.data[this.activeKey-1].id, "page": "1"},)
      }).catch((error) => {
        console.log(error);
        if (error.response.status == 403) {
          this.visible = true;
        }
      })
    },
    getRecords(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/travels/",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        this.data = res.data.results;
        this.pageNum = res.data.pages;
        let dataLength = this.data.length;
        this.data.forEach((item, index) => {
          item.key = index + 1 + '';
          item.ownerId = item.owner == null ? null : item.owner.id;
          item.ownerName = item.owner == null ? null : item.owner.name;
          item.ownerNickname = item.owner == null ? null : item.owner.nickname;
          let time_array = item.time.split("T");
          item.createTime = time_array[0] + " " + time_array[1].split("+")[0].split(".")[0];
          item.positionName = item.position == null ? null : item.position.name;
          item.coverImage = item.cover == null ? null : "https://tra-fr-2.zhouyc.cc/api/core/images/" + item.cover + "/data/";
          item.recordImages = []
          item.images.forEach((image) => {
            item.recordImages.push("https://tra-fr-2.zhouyc.cc/api/core/images/" + image + "/data/");
          })
          item.status = "审核通过";
          if (item.forbidden == "1") {
            item.status = "人工审核不通过"
          } else if (item.forbidden == "2") {
            item.status = "机器审核不通过"
          }
          this.$axios({
            method: "get",
            url: "api/admin/comments/",
            params: {
              "travel": item.id,
              "page": 1,
            },
            headers: {
              Authorization: localStorage.getItem('Authorization')
            },
            data: {},
          }).then((res) => {
            item.commentLength = res.data.count;
            item.commentPage = "page" + 1;
            item.commentPageNum = res.data.pages;
            item.commentData = res.data.results;
            item.commentData.forEach((comment) => {
              comment.status = comment.deleted == false ? "保留" : "已删除";
              comment.commentId = comment.reply == null ? comment.id : comment.id + " 回复 " + comment.reply;
            })

            item.commentSelectedRows = [];
            item.commentSelectedRowKeys = [];
            item.commentSelected = false;
            if (index + 1 == dataLength) {
              this.panes = [this.panes[0]]
              this.panes[0].data = this.data;
              this.spinning = false;
            }
          }).catch((error) => {
            console.log(error);
          })
        })
        // this.panes = [this.panes[0]]
        // this.panes[0].data = this.data;
        // this.spinning = false;
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    deleteRecord(recordId) {
      this.$axios({
        method: "delete",
        url: "api/admin/travels/" + recordId + "/",
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
    handleChange(value) {
      this.searchType = value;
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
