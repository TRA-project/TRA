<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">

        <!--        1. 表格tab-->
        <div v-if="pane.key === '0'">
          <a-button style="margin:0 5px 0 50px" @click="refresh">刷新</a-button>
          <a-button style="margin:0 5px 0 50px" type="primary" @click="add">查看</a-button>
          <a-button style="margin:0 5px" type="primary" @click="approveRequests">通过</a-button>
          <a-button style="margin:0 5px" type="primary" @click="rejectRequests">不通过</a-button>
          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data" :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{ text}}</a>
              <template slot="action" slot-scope="record" >
                <a-button style="margin-right:10px" size="small" type="primary" @click="approveSingle(record.id)">批准</a-button>
                <a-button size="small" @click="rejectSingle(record.id)">不批准</a-button>
              </template>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>

        <!--        2. 详细信息tab-->
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="请求信息" bordered>
            <a-descriptions-item label="审批id" :span="2">
              {{pane.data.id}}
            </a-descriptions-item>
            <a-descriptions-item label="景点名称" :span="2">
              {{pane.data.name}}
            </a-descriptions-item>
            <a-descriptions-item label="景点描述" :span="2">
              {{pane.data.desc}}
            </a-descriptions-item>
            <a-descriptions-item label="景点地址" :span="2">
              {{pane.data.addr}}
            </a-descriptions-item>
            <a-descriptions-item label="景点图片" :span="2">
              <img :src="pane.data.image" />
            </a-descriptions-item>

<!--            添加/修改-->
            <a-descriptions-item label="请求类型" :span="2">
              {{pane.data.type}}
            </a-descriptions-item>

            <a-descriptions-item label="子景点信息" :span="2">
              <li style="list-style-type: decimal" v-for="sight in data.inner_sights" :key="sight.id">
                {{sight.name}}：{{ sight.desc }}
              </li>
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
    title: '审批编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '景点编号',
    dataIndex: 'sceneryId',
  },
  {
    title: '景点名称',
    dataIndex: 'name',
  },
  {
    title: '修改或新建的内容',
    dataIndex: 'content'
  },
  {
    title: '请求类型',
    dataIndex: 'type'
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  }
];

export default {
  name:"sceneryAudit",
  data() {
    const panes = [
      { title: '待审批列表', data:[],  key: '0' ,closable: false },
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
    this.getAudits({
      "page":"1"
    })
  },
  methods: {
    getAudits(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/sights/audit/",
        params: p,
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        this.data = res.data.results;
        this.pageNum = Math.ceil(res.data.count / 10); // 每页固定10条;
        let key = 1;
        let promises = []

        // 对每个元素赋以key，数值递增
        this.data.forEach((item)=>{
          item.key = key + '';
          key = key + 1;

          // 将json中的\u???(utf-8编码)转换为中文格式
          item.content = item.content.replace(/\\u(\w{4})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
          item.sceneryId = JSON.parse(item.content).id

          // 有sceneryId，且没有填入信息
          if (item.sceneryId !== undefined && item.name === undefined) {
            let sceneryId = item.sceneryId
            let promise = this.$axios({
              method: "get",
              url: "api/admin/sights/" + sceneryId + "/",
              params: {},
              headers: {
                Authorization: localStorage.getItem('Authorization')
              },
              data: {},
            }).then((res) => {
              console.log(`getScenery ${sceneryId}`, res);
              // Note: 将返回数据填入this.data中
              this.data.forEach(item => {
                if (item.sceneryId === sceneryId) {
                  item.name = res.data.name
                  // TODO: 填入其他信息
                  console.log(this.data)
                }
              })
            }).catch((error) => {
              alert(`${error}`)
            });
            promises.push(promise)
          } else {
            item.name = "None"
            item.sceneryId = "None"
          }
        })
        Promise.all(promises).then(() => {
          this.panes[0].data = this.data;
          this.spinning = false;
        })
      }).catch((error) => {
        if (error.response.status === 403) {
          this.visible = true;
        }
      });
    },
    refresh() {
      this.getAudits({
        "page":"1"
      })
    },
    approveRequest(requestId) {
      return new Promise((resolve, reject) => {
        this.$axios({
          method: "post",
          url: "api/admin/sights/audit/approve/",
          params: {},
          data: {
            "audit_id": requestId,
          },
          headers: {
            Authorization: localStorage.getItem('Authorization')
          },
        }).then((res) => {
          console.log(`approveRequest ${requestId}`, res);
          resolve();
        }).catch((error) => {
          if (error.response.status === 403) {
            this.visible = true;
          }
          reject();
        })
      })
    },
    approveSingle(requestId) {
      this.approveRequest(requestId).then(() => {
        this.getAudits({"page":"1"});
        this.selectedRows = [];
        this.selectedRowKeys = [];
      })
    },
    approveRequests() {
      let promises = []
      this.selectedRows.forEach((item)=>{
        let promise = this.approveRequest(item.id);
        promises.push(promise);
        this.remove(item.key);
      });
      Promise.all(promises).then(() => {
        this.getAudits({"page":"1"});
        this.selectedRows = [];
        this.selectedRowKeys = [];
      })
    },
    rejectRequest(requestId) {
      return new Promise(((resolve, reject) => {
        this.$axios({
          method: "post",
          url: "api/admin/sights/audit/reject/",
          params: {},
          headers: {
            Authorization: localStorage.getItem('Authorization')
          },
          data: {
            "audit_id": requestId,
          },
        }).then((res) => {
          console.log(`rejectRequest ${requestId}`, res);
          resolve()
        }).catch((error) => {
          if (error.response.status === 403) {
            this.visible = true;
          }
          reject()
        });
      }))
    },
    rejectSingle(requestId) {
      this.rejectRequest(requestId).then(() => {
        this.getAudits({"page":"1"});
        this.selectedRows = [];
        this.selectedRowKeys = [];
      })
    },
    rejectRequests() {
      let promises = []
      this.selectedRows.forEach((item)=>{
        let promise = this.rejectRequest(item.id);
        promises.push(promise);
        this.remove(item.key);
      });
      Promise.all(promises).then(() => {
        this.getAudits({"page":"1"});
        this.selectedRows = [];
        this.selectedRowKeys = [];
      })
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
      this.getAudits(params);
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

      // data就直接是景点的数据了
      // 加入key是为了去重
      panes.push({
        title: item.name,
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
