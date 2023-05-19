<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
<!--        1. 表格tab-->
        <div v-if="pane.key === '0'">
<!--          选择搜索文本按照什么来搜索-->
          <a-select default-value="id" style="width: 140px; margin:0px 10px 15px 0px" @change="handleChange">
            <a-select-option value="id">
              旅行计划编号
            </a-select-option>
            <a-select-option value="owner">
              用户编号
            </a-select-option>
          </a-select>
          <!-- <a-input-search placeholder="请输入搜索文本" style="width: 300px; margin:0 5px 0 2px"  @search="onSearch" /> -->
          <!-- <a-button style="margin:0 5px 0 50px" type="primary" @click="add">查看</a-button> -->
          <!-- <a-button style="margin:0 5px" type="danger" @click="deletePlaces">删除</a-button> -->

<!--          表格的主体-->
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
          <a-descriptions-items title="旅行计划信息" bordered>
            <a-descriptions-item label="旅行计划编号" :span="2">
              {{pane.data.id}}
            </a-descriptions-item>
            <a-descriptions-item label="旅行计划名称" :span="2">
              {{pane.data.name}}
            </a-descriptions-item>
            <a-descriptions-item label="旅行计划详情" :span="2">
              {{pane.data.plan_items}}
            </a-descriptions-item>
          </a-descriptions-items>
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
    title: '旅行计划编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '旅行计划名称',
    dataIndex: 'name',
  },
  {
    title: '用户编号',
    dataIndex: 'owner',
  }
];

export default {
  name:"planDisplay",
  data() {
    const panes = [
      { title: '旅行计划管理', data:[],  key: '0' ,closable: false },
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
    this.getPlans({
      "page":"1"
    })
  },
  methods: {
    getPlans(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/plan",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        this.data = res.data.results;
        this.pageNum = res.data.pages;
        let key = 1;

        // 对每个元素赋以key，数值递增
        this.data.forEach((item)=>{
          item.key = key + '';
          key = key + 1;
        })

        this.panes[0].data = this.data;
        this.spinning = false;
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    // deletePlace(sceneryId) {
    //   this.$axios({
    //     method: "delete",
    //     url: "api/admin/sights/" + sceneryId + "/",
    //     params: {},
    //     headers: {
    //       "token-auth": localStorage.getItem('Authorization')
    //     },
    //     data: {},
    //   }).then((res) => {
    //     console.log(`deleteScenery ${sceneryId}`, res);
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
    handleChange(value) {
      this.searchType = value;
    },
    onSearch(value){
      let params = {"page":"1"};
      this.searchText = value;
      if (this.searchType === "id") {
        if (isNaN(Number(value))) {
          alert("输入的旅行计划id不是数字！")
        }
        else {
          params[this.searchType] = parseInt(value);
        }
      } else {
        params[this.searchType] = value;
      }
      this.getPlans(params);
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
      this.getPlans(params);
    },
    // deletePlaces() {
    //   this.selectedRows.forEach((item)=>{
    //     this.deletePlace(item.id);
    //     this.remove(item.key);
    //   });
    //   this.getPlans({"page":"1"});
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

    // 逐个查看计划的信息
    addSingle(record){
      console.log(record);
      const panes = this.panes;
      let item = record;
      console.log("addSinge:", item);

      let flag = 0
      // 检测tab中是否已经有了该旅行计划的信息，如果有了，就直接跳过
      for(let j = 0; j<panes.length;j++){
        if(panes[j].id === item.id){
          console.log("item.id:"+item.id);
          flag = 1;
          break;
        }
      }
      if (flag === 1) return

      // Note: 这里调用接口获取旅行计划的详细信息，在新的tab中展示
      let planId = item.id
      this.$axios({
        method: "get",
        url: "api/admin/plan/" + planId + "/",
        params: { },
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        console.log(`getPlan ${planId}`, res);

        // data就直接是旅行计划的数据了
        // 加入key是为了去重
        panes.push({
          title: item.name,
          data: res.data,
          id: item.id,
          key: item.key
        })

        this.activeKey = item.key;
        this.panes = panes;
      }).catch((error) => {
        if (error.response.status === 403) {
          this.visible = true;
        }
      });
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
