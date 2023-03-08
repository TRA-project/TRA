<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs  v-model="activeKey" type="editable-card" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <a-button style="margin: 0px 10px 15px 0px" type="primary">查看</a-button>
          <a-button style="margin: 0 5px" type="primary" >通过</a-button>
          <a-button  style="margin: 0 5px">不通过</a-button>

          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns = "columns" :data-source="pane.data" >
              <a slot="id" slot-scope="text"> {{text}}</a>
              <template slot="action" >
                <a-button style="margin-right:10px" size="small" type="primary" >通过</a-button>
                <a-button size="small" >不通过</a-button>
              </template>
            </a-table>
          </a-spin>

        </div>
        <div v-else>
          <a-descriptions title="日程信息" bordered style="word-break: break-all;word-wrap: break-word;">
            <a-descriptions-item label="编号">
              {{data[pane.key-1].id}}
            </a-descriptions-item>
            <a-descriptions-item label="时间">
              {{data[pane.key-1].time}}
            </a-descriptions-item>
            <a-descriptions-item label="地点">
              {{data[pane.key-1].location}}
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
            <a-descriptions-item label="日程发布时间">
              {{data[pane.key-1].startTime}}
            </a-descriptions-item>
            <a-descriptions-item label="日程结束时间" >
              {{data[pane.key-1].endTime}}
            </a-descriptions-item>
            <a-descriptions-item label="日程是否需要提醒" >
              {{data[pane.key-1].isAlert}}
            </a-descriptions-item>
            <a-descriptions-item label="日程内容" :span="3">
              {{data[pane.key-1].content}}
            </a-descriptions-item>
          </a-descriptions>


        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
const columns = [
  {
    title: '日程编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '日程内容',
    dataIndex: 'content',
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
let data=[
    {
      id : '001',
      time:'2022-4-21',
      location:'北京航空航天大学',
      ownerId:'000001',
      ownerNickname:'root2',
      ownerName:'root2',
      startTime:'2022-5-6',
      endTime:'2022-5-6',
      content:'Alpha版本展示',
      isAlert:'需要'
    }
];
export default {
  name: "calenderUnderInspect",
  data() {
    const panes = [
      {title: '待审核' , data:[] , key:"0" , closable : false },
    ]
    panes[0].data=[{
      id:'0001',
      content:'Alpha版本展示',
      ownerId:'000001',
      ownerName:'root2',
      createTime: '2022-4-21'

    }]
    return{
      spinning:false,
      panes,
      columns,
      data,
      activeKey: panes[0].key,
      selectedRowKeys:[],
    }
  },
  computed : {
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
  mounted() {
    this.getCalenderList();
  },
  methods:{
    getCalenderList() {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "/api/admin/schedule/",
        params:{"forbidden":2},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {},
      }).then((res) => {
        if (this.count === 0) {
          this.data = [];
          this.pageNum = res.data.pages;
          this.panes[0].data = this.data;
          this.spinning = false;
        }else {
          this.data = res.data.results;
          this.pageNum = res.data.pages;
          let key = 1;
          this.data.forEach((item) => {
            item.key = key + '';
            key = key + 1;
            item.id = item.id == null ? null : item.id;
            item.time = item.creat_time == null ? null : item.creat_time;
            item.location = item.position == null ? '未知' : item.position;
            item.ownerId = item.owner.id == null ? null : item.owner.id;
            item.ownerNickname = item.owner.nickname == null ? null : item.owner.nickname;
            item.ownerName = item.owner == null ? null : item.owner.name;
            item.startTime = item.start_time == null ? null : item.start_time;
            item.endTime = item.end_time == null ? null : item.end_time;
            item.content = item.content == null ? null : item.content;
            item.isAlert = '需要';
          })
          this.panes[0].data = this.data;
          this.spinning = false;
        }
      }).catch((error) => {
        alert(error)
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
  }
}
</script>

<style scoped>

</style>
