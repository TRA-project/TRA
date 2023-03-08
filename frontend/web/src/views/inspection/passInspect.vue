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
        <a-button style="margin:0 5px 0 50px" type="primary" @click="add">查看</a-button>
        <a-button  style="margin:0 5px" @click="showModal">不通过</a-button>
        <a-modal v-model="refuseVisible" title="不通过原因" @ok="refuseHandleOk" @cancel="refuseHandleCancel">
          <a-textarea v-model="reason" auto-size />
        </a-modal>
        <a-spin :spinning="spinning">
          <a-table :row-selection="rowSelection" :row-key="pane.data.id" :columns="columns" :data-source="pane.data" :pagination="false">
            <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{ text }} </a>
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
];

export default {
  name:"passInspect",
  data() {
    const panes = [
      { title: '审核通过', data:[],  key: '0' ,closable: false },
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
      reason: "",
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
    this.getRecords({"page": "1", "forbidden": "0"});
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
    showModal() {
      this.refuseVisible = true;
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
        console.log(res)
        this.data = res.data.results;
        this.pageNum = res.data.pages;
        let key = 1;
        this.data.forEach((item)=>{
          item.key = key + '';
          key = key + 1;
          item.ownerId = item.owner == null ? null : item.owner.id;
          item.ownerName = item.owner == null ? null : item.owner.name;
          item.ownerNickname = item.owner == null ? null : item.owner.nickname;
          let time_array = item.time.split("T");
          item.createTime = time_array[0] + " " + time_array[1].split("+")[0].split(".")[0];
          item.positionName = item.position == null ? null : item.position.name;
          item.coverImage = item.cover == null ? "http://114.116.194.214/media/travelRecordCover/1.jpg" : "http://114.116.194.214/api/core/images/" + item.cover + "/data/";
          item.recordImages = []
          item.images.forEach((image) => {
            item.recordImages.push("http://114.116.194.214/api/core/images/" + image + "/data/");
          })

          console.log(item.recordImages)
          item.schContent = item.schedule == null ? [] : this.schUnionItems(item.schedule.schedule_items);
          item.schTitle = item.schedule == null ? '空': item.schedule.title;
          item.schDate = item.schedule == null ? '空': item.schedule.date;
          item.schcreateTime = item.schedule == null ? '空': item.schedule.create_time;
          item.schcreateTime = item.schcreateTime == '空' ? '空' :this.formatTime(item.schcreateTime)
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
    dealRecord(d) {
      this.$axios({
        method: "post",
        url: "api/admin/travels/forbid/",
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
    refuseHandleOk() {
      this.selectedRows.forEach((item)=>{
        this.dealRecord({"id": item.id, "status": "1", "reason": this.reason});
        this.remove(item.key);
      });
      this.getRecords({"page":"1", "forbidden": "0"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.refuseVisible = false;
    },
    refuseHandleCancel() {
      this.refuseVisible = false;
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
      let params = {"page": "1", "forbidden": "0"};
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
      this.getRecords({"page": page, "forbidden": "0"});
    },
    callback(key) {
      console.log(key);
    },
    onEdit(targetKey, action) {
      this[action](targetKey);
    },
    addSingle(record){
      const panes = this.panes;
        let flag = 0;
        let item = record;
        for(let j = 0; j<panes.length;j++){
          if(panes[j].key == item.key){
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





























