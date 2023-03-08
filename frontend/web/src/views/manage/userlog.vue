<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <a-spin :spinning="spinning">
            <a-table :columns = "columns" :data-source="pane.data" :pagination="false">
            </a-table>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>

        </div>
        <div v-else>
          用户日志功能正在开发，敬请期待...
<!--          <a-descriptions title="日程信息" bordered style="word-break: break-all;word-wrap: break-word;">-->
<!--            <a-descriptions-item label="编号">-->
<!--              {{data[pane.key-1].id}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="时间">-->
<!--              {{data[pane.key-1].time}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="地点">-->
<!--              {{data[pane.key-1].location}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="发布者编号">-->
<!--              {{data[pane.key-1].ownerId}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="发布者名称">-->
<!--              {{data[pane.key-1].ownerName}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="发布者昵称">-->
<!--              {{data[pane.key-1].ownerNickname}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="日程发布时间">-->
<!--              {{data[pane.key-1].startTime}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="日程结束时间" >-->
<!--              {{data[pane.key-1].endTime}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="日程是否需要提醒" >-->
<!--              {{data[pane.key-1].isAlert}}-->
<!--            </a-descriptions-item>-->
<!--            <a-descriptions-item label="日程内容" :span="3">-->
<!--              {{data[pane.key-1].content}}-->
<!--            </a-descriptions-item>-->
<!--          </a-descriptions>-->


        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
const columns = [
  {
    title: '系统时间',
    dataIndex: 'time',
  },
  {
    title: '用户ID',
    dataIndex: 'user',
  },
  {
    title: '用户操作',
    dataIndex: 'options',
  },
  {
    title: '备注',
    dataIndex: 'remarks',
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
  name: "userlog",
  data() {
    const panes = [
      {title: '系统日志' , data:[] , key:"0" , closable : false }
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
      activeKey:"0",
      searchType:'id',
      selectedRows:[],
      selectedRowKeys:[],
      refuseVisible:false,
      reason:'您的日程不符合社区日程规范',
      pageNum:1,
    }
  },
  mounted() {
    this.getUserLog({page:1});
  },
  computed:{
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows = selectedRows;
          this.selectedRowKeys = selectedRowKeys;
          console.log(this.selectedRows)
        },
        getCheckboxProps: calender => ({
          props: {
            title: calender.id,
          },
        }),
      };
    },
  },

  methods:{
    translateUsersAction(userid,actionCode,targetid){
      let action;
      let targettitle = targetid;
      switch (actionCode){
        case '100':{
          action = '注册了';
          break;
        }
        case '101':{
          action = '登陆了';
          break;
        }
        case '200':{
          action = '创建了游记：' + targettitle;
          break;
        }
        case '201':{
          action = '编辑了游记：'+targettitle;
          break;
        }
        case '202':{
          action = '删除了游记：'+targettitle;
          break;
        }
        case '203':{
          action = '查看了游记：'+targettitle;
          break;
        }
        case '204':{
          action = '对游记：'+targettitle+'点赞';
          break;
        }
        case '205':{
          action = '收藏了游记：'+targettitle;
          break;
        }
        case '215':{
          action = '取消收藏游记：'+targettitle;
          break;
        }
        case '300':{
          action = '创建了同行：'+targettitle;
          break;
        }
        case '301':{
          action = '编辑了同行：'+targettitle;
          break;
        }
        case '302':{
          action = '删除了同行：'+targettitle;
          break;
        }
        case '303':{
          action = '加入了同行：'+targettitle;
          break;
        }
        case '304':{
          action = '退出了了同行：'+targettitle;
          break;
        }
        case '305':{
          action = '查看了同行：'+targettitle;
          break;
        }
        case '400':{
          action ='创建了游记集合' +targettitle;
          break;
        }
        case '401':{
          action = '编辑了游记集合'+targettitle;
          break;
        }
        case '402':{
          action ='删除了游记集合：' +targettitle;
          break;
        }
        case '500':{
          action ='查看了航班：' +targettitle;
          break;
        }
        case '501':{
          action ='收藏了航班：' +targettitle;
          break;
        }
        case '502':{
          action ='取消收藏航班：' +targettitle;
          break;
        }
        case '600':{
          action ='创建了日程：' +targettitle;
          break;
        }
        case '601':{
          action ='编辑了日程：' +targettitle;
          break;
        }
        case '602':{
          action ='删除了日程：' +targettitle;
          break;
        }
        case '603':{
          action ='查看了日程' +targettitle;
          break;
        }
        case '604':{
          action ='拷贝了日程：' +targettitle;
          break;
        }
        case '700':{
          action ='创建了评论：' +targettitle;
          break;
        }
        case '701':{
          action ='编辑了评论' +targettitle;
          break;
        }
        case '702':{
          action = '删除了评论'+targettitle;
          break;
        }





      }
      let username = userid;
      return username + " "+action;
    },
    formatTime(time){
      const arr = time?.split('T');
      let newtime = arr[0] + " " +arr[1].split('+')[0];
      newtime = newtime.split('.')[0];
      return newtime;
    },
    getUserLog(p) {
      this.spinning = true;
      console.log(p);
      this.$axios({
        method: "get",
        url: "/api/admin/log/",
        params: p,
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
            item.time = this.formatTime(item.time);
            //alert(item.action)
            item.options = this.translateUsersAction(item.user,item.action.toString(),item.target_id)
            item.remarks ='无';

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
    dealCalender(d) {
      this.$axios({
        method: "post",
        url: "api/admin/schedule/forbid/",
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
    addSingle(calender){
      const panes = this.panes;
      let flag = 0;
      let item = calender;

      for(let j = 0; j<panes.length;j++){
        if(panes[j].key === item.key){
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
    onEdit(targetKey, action) {this[action](targetKey);},
    remove(targetKey){
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
    handleChange(value){
      this.searchType = value;
      alert(this.searchType)
    },
    onSearch(value){
      alert(this.searchType)
      let params = {page:1,"forbidden":0};
      params[this.searchType] = value;
      this.getCalenderList(params);
    },
    add() {
      const panes = this.panes;
      let i = 0;
      this.selectedRows.forEach((item)=>{
        let flag = 0;
        for(let j = 0; j<panes.length;j++){
          if(panes[j].key === item.key){
            flag = 1;
            break;
          }
        }
        if(flag === 0){
          panes.push({ title: item.title, data:item.data, key: item.key });
          i=item.key;
          this.activeKey = i;
        }
      })
      this.panes = panes;
    },
    refuseHandleOk(){
      this.selectedRows.forEach((item)=>{
        this.dealCalender({"id": item.id, "status": "1", "reason": this.reason});
        this.remove(item.key);
      });
      this.getCalenderList({"page":"1", "forbidden": "0"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.refuseVisible = false;
    },
    refuseHandleCancel(){
      this.refuseVisible = false;
    },
    showModal(){
      this.refuseVisible = true;
    },
    onPageChange(page) {
      for (let i = 1; i < this.panes.length; i++) {
        this.remove(this.panes[i].key);
      }
      this.panes.splice(1, this.panes.length-1);
      this.selectedRows = [];
      this.selectedRowKeys = [];
      this.getUserLog({"page": page});
    },

  },
}
</script>

<style scoped>

</style>
