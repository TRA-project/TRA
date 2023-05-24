<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">

        <!--        1. 表格tab-->
        <div v-if="pane.key === '0'">
          <a-button style="margin:0 5px 0 50px" type="primary" @click="add">查看</a-button>
          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data" :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{ text}}</a>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>

        <!--        2. 详细信息tab-->
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="旅行计划生成日志" bordered>
            <a-descriptions-item label="日志编号" :span="2">
              {{pane.data.id}}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间" :span="2">
              {{pane.data.create_time}}
            </a-descriptions-item>
            <a-descriptions-item label="开始时间" :span="2">
              {{pane.data.start_time}}
            </a-descriptions-item>
            <a-descriptions-item label="结束时间" :span="2">
              {{pane.data.end_time}}
            </a-descriptions-item>
            <a-descriptions-item label="目标城市" :span="2">
              {{pane.data.target_city}}
            </a-descriptions-item>
            <a-descriptions-item label="生成需求" :span="2">
              {{pane.data.desc}}
            </a-descriptions-item>
            <a-descriptions-item label="所属用户" :span="2">
              {{pane.data.owner}}
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
    title: '日志编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
  },
  {
    title: '目标城市',
    dataIndex: 'target_city',
  },
  {
    title: '需求描述',
    dataIndex: 'desc'
  },
  {
    title: "所属用户",
    dataIndex: "owner"
  }
]

export default {
  name:"sceneryManage",
  data() {
    const panes = [
      { title: '出行计划生成日志', data:[],  key: '0' ,closable: false },
    ];
    return {
      spinning:true,
      data:[],
      searchType: "id",
      searchText: "",
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
      ModalText: '您的登录信息已过期，请重新登录',
      descriptionEditable: "",
      addImgModalVisible: false,
      updateCoverModalVisible: false,
      placeId: "",
      placeImgs: null,
      placeCover: null
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
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
          },
        }),
      };
    },
  },
  mounted(){
    // 默认加载全部景点
    this.getLogs({
      "page":"1"
    })
  },
  methods: {
    getLogs(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/plan/logs/",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        this.data = res.data.results;
        this.pageNum = Math.ceil(res.data.count / 10); // 每页固定10条
        let key = 1;

        // 对每个元素赋以key，数值递增
        this.data.forEach((item)=>{
          item.key = key + '';
          key = key + 1;

          // TODO: 时间戳转时间
          item.create_time = new Date(item.create_time * 1000).toLocaleString()
          item.start_time = new Date(item.start_time * 1000).toLocaleString()
          item.end_time = new Date(item.end_time * 1000).toLocaleString()
        })

        this.panes[0].data = this.data;
        this.spinning = false;
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
    onPageChange(page) {
      for (let i = 1; i < this.panes.length; i++) {
        this.remove(this.panes[i].key);
      }
      this.panes.splice(1, this.panes.length-1);
      this.selectedRows = [];
      this.selectedRowKeys = [];
      let params = {"page": page};
      params[this.searchType] = this.searchText;
      this.getLogs(params);
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

    // 逐个查看景点的信息
    addSingle(record){
      console.log(record);
      const panes = this.panes;
      let item = record;
      console.log("addSinge:", item);

      let flag = 0
      // 检测tab中是否已经有了该景点的信息，如果有了，就直接跳过
      for(let j = 0; j<panes.length;j++){
        if(panes[j].id === item.id){
          console.log("item.id:"+item.id);
          flag = 1;
          break;
        }
      }
      if (flag === 1) return

      panes.push({
        title: item.id,
        data: item,
        id: item.id,
        key: item.key
      })

      this.activeKey = item.key;
      this.panes = panes;
    },

    // 批量查看景点的信息
    add() {
      this.selectedRows.forEach(item => {
        this.addSingle(item)
      })
      /* const panes = this.panes;
      // const activeKey = `newTab${this.newTabIndex++}`;
      let i = 0;
      this.selectedRows.forEach((item)=>{
        let flag = 0;
        for(let j = 0; j<panes.length;j++){
          if(panes[j].id == item.id){
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
      this.panes = panes; */
    },

    // 删除指定key的tab
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
