<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <a-select default-value="id" style="width: 100px; margin:0px 10px 15px 0px" @change="handleChange">
            <a-select-option value="id">
              用户编号
            </a-select-option>
            <a-select-option value="name">
              用户名称
            </a-select-option>
            <a-select-option value="nickname">
              用户昵称
            </a-select-option>
          </a-select>
          <a-input-search placeholder="请输入搜索文本" style="width: 300px; margin:0 5px 0 2px"  @search="onSearch" />
          <a-button style="margin:0 5px 0 50px" type="primary" @click="add">查看</a-button>
          <a-button  style="margin:0 5px" @click="deleteUsers">删除</a-button>
          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data" :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{text}}</a>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="用户信息" bordered>
            <a-descriptions-item label="编号">
              {{data[pane.key-1].id}}
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{data[pane.key-1].name}}
            </a-descriptions-item>
            <a-descriptions-item label="昵称">
              {{data[pane.key-1].nickname}}
            </a-descriptions-item>
            <a-descriptions-item label="性别">
              {{data[pane.key-1].gender}}
            </a-descriptions-item>
            <a-descriptions-item label="生日">
              {{data[pane.key-1].birthday}}
            </a-descriptions-item>
            <a-descriptions-item label="常用地理位置">
              {{data[pane.key-1].positionName}}
            </a-descriptions-item>
            <a-descriptions-item label="联系方式">
              {{data[pane.key-1].phone}}
            </a-descriptions-item>
            <a-descriptions-item label="邮箱">
              {{data[pane.key-1].email}}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{data[pane.key-1].createTime}}
            </a-descriptions-item>
            <a-descriptions-item label="个性签名" :span="3">
              {{data[pane.key-1].sign}}
            </a-descriptions-item>
            <a-descriptions-item label="去过的城市数量" :span="1.5">
              {{data[pane.key-1].cities}}
            </a-descriptions-item>
            <a-descriptions-item label="发表的游记数量" :span="1.5">
              {{data[pane.key-1].travels}}
            </a-descriptions-item>
            <a-descriptions-item label="关注数">
              {{data[pane.key-1].subscription}}
            </a-descriptions-item>
            <a-descriptions-item label="粉丝数">
              {{data[pane.key-1].subscribers}}
            </a-descriptions-item>
            <a-descriptions-item label="点赞数">
              {{data[pane.key-1].likes}}
            </a-descriptions-item>
            <a-descriptions-item label="用户头像" :span="3">
              <img :src="data[pane.key-1].iconImage" width="300px">
            </a-descriptions-item>
          </a-descriptions>

        <user-personas :userid = "data[pane.key-1].id" :username="data[pane.key-1].name" ></user-personas>
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
import userPersonas from '@/views/manage/userPersonas'

const columns = [
  {
    title: '用户编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '用户名称',
    dataIndex: 'name',
  },
  {
    title: '用户昵称',
    dataIndex: 'nickname'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
];

export default {
  name:"user",
  data() {
    const panes = [
      { title: '用户管理', data:[],  key: '0' ,closable: false },
    ];
    return {
      spinning: true,
      data:[],
      searchType:"id",
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
            disabled: record.name === 'Disabled User',
            title: record.id,
          },
        }),
      };
    },
  },
  mounted(){
    this.getUsers({"page":"1"});
  },
  methods: {
    getUsers(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/users/",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        console.log(localStorage.getItem('Authorization'))
        this.data = res.data.results;
        this.pageNum = res.data.pages;
        let key = 1;
        this.data.forEach((item)=>{
          item.key = key + '';
          key = key + 1;
          let time_array = item.time.split("T")
          item.createTime = time_array[0] + " " + time_array[1].split("+")[0].split(".")[0];
          item.positionName = item.position == null ? null : item.position.name;
          item.gender = item.gender == '0' ? '男' : '女';
          item.iconImage = item.icon == null ? null : "/api/core/images/" + item.icon + "/data/";
        })
        this.panes[0].data = this.data;
        this.spinning = false;
        console.log( this.panes[0].data)
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    deleteUser(userId) {
      this.$axios({
        method: "delete",
        url: "api/admin/users/" + userId + "/",
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
      let params = {"page":"1"};
      params[this.searchType] = value;
      this.getUsers(params);
    },
    onPageChange(page) {
      for (let i = 1; i < this.panes.length; i++) {
        this.remove(this.panes[i].key);
      }
      this.panes.splice(1, this.panes.length-1);
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.getUsers({"page": page});
    },
    deleteUsers() {
      this.selectedRows.forEach((item)=>{
        this.deleteUser(item.id);
        this.remove(item.key);
      });
      this.getUsers({"page":"1"});
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
        panes.push({ title: item.name, data:item.data, key: item.key });
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
          panes.push({ title: item.name, data:item.data, key: item.key });
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
  components: {
    userPersonas
  }
};
</script>
