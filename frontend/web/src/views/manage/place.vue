<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <a-select default-value="id" style="width: 100px; margin:0px 10px 15px 0px" @change="handleChange">
            <a-select-option value="id">
              地点编号
            </a-select-option>
            <a-select-option value="name">
              地点名称
            </a-select-option>
          </a-select>
          <a-input-search placeholder="请输入搜索文本" style="width: 300px; margin:0 5px 0 2px"  @search="onSearch" />
          <a-button style="margin:0 5px 0 50px" type="primary" @click="add">查看</a-button>
          <!-- <a-button style="margin:0 5px" @click="deletePlaces">删除</a-button> -->
          <a-button style="margin:0 5px" type="primary" @click="showAddImgModal">添加图片</a-button>
          <a-modal v-model="addImgModalVisible" title="添加地点图片" @ok="addImgOk" @cancel="addImgCancel">
            <a-form>
              <a-form-item label="地点编号：">
                <a-input placeholder="请输入地点编号" v-model="placeId" />
              </a-form-item>
              <a-form-item label="地点图片：">
                <input id="uploadFile" type="file" multiple ref="placeImgs" @change="imgChange" accept="image/*" >
              </a-form-item>
            </a-form>
          </a-modal>
          <a-button style="margin:0 5px" @click="showUpdateCoverModal">更换封面</a-button>
          <a-modal v-model="updateCoverModalVisible" title="更换地点封面" @ok="updateCoverOk" @cancel="updateCoverCancel">
            <a-form>
              <a-form-item label="地点编号：">
                <a-input placeholder="请输入地点编号" v-model="placeId" />
              </a-form-item>
              <a-form-item label="地点封面：">
                <input type="file" ref="placeCover" @change="coverChange" accept="image/*" >
              </a-form-item>
            </a-form>
          </a-modal>
          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data" :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{ text}}</a>
              <template slot="action" slot-scope="record" >
                <a-button style="margin-right:10px" size="small" type="primary" @click="passSinglePlace(record)">上架</a-button>
                <a-button size="small" @click="failSinglePlace(record)">下架</a-button>
              </template>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="地点信息" bordered>
          <a-descriptions-item label="地点编号" :span="3">
            {{data[pane.key-1].id}}
          </a-descriptions-item>
          <a-descriptions-item label="地点名称" :span="3">
            {{data[pane.key-1].name}}
          </a-descriptions-item>
          <a-descriptions-item label="地点描述" :span="3" :key="descriptionEditable">
            <div v-if="data[pane.key-1].descriptionEditable">
              <a-textarea v-model="data[pane.key-1].description" style="width: 700px" auto-size/>
              <a-button style="margin-left: 40px; width: 64px; height: 32px" type="primary" @click="descriptionSave">保存</a-button>
              <a-button style="margin-left: 20px; width: 64px; height: 32px" @click="descriptionCancel">取消</a-button>
            </div>
            <div v-else >
              {{ data[pane.key-1].description }}
              <a-icon
                type="edit"
                theme="twoTone"
                style="fontSize: 18px;"
                @click="descriptionEdit"
              />
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="地点封面" :span="3">
            <img :src="data[pane.key-1].placeCover" width="200" alt="">
          </a-descriptions-item>
          <a-descriptions-item label="地点图片" :span="3">
            <div v-for="item in data[pane.key-1].placeImages" :key="item">
              <img :src="item" width="200" alt="">
              <a-button style="margin-left: 40px; width: 64px; height: 32px" type="primary" @click="deletePlaceImages(item)">删除</a-button>
            </div>
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
    title: '地点编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '地点名称',
    dataIndex: 'name',
  },
  {
    title: '地点状态',
    dataIndex: 'status',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

export default {
  name:"place",
  data() {
    const panes = [
      { title: '地点管理', data:[],  key: '0' ,closable: false },
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
    this.getPlaces({"page":"1"});
  },
  methods: {
    coverChange() {
      this.placeCover = this.$refs.placeCover[0].files[0];
    },
    updateCoverOk() {
      if (this.placeId == "") {
        alert("地点编号不能为空");
      } else if (this.placeCover == null) {
        alert("地点封面不能为空");
      } else {
        const coverData = new FormData();
        coverData.append("image", this.placeCover);
        this.$axios({
          method: "post",
          url: "/api/admin/position/" + this.placeId + "/cover/",
          params: {},
          headers: {
            Authorization: localStorage.getItem('Authorization')
          },
          data: coverData
        }).then((res) => {
          console.log(res);
          this.placeId = "";
          this.placeCover = null;
          this.updateCoverModalVisible = false;
          this.getPlaces({"page":"1"});
          this.selectedRows = [];
          this.selectedRowKeys = [];
        }).catch((error) => {
          console.log(error);
        });
      }
    },
    updateCoverCancel() {
      this.placeId = "";
      this.placeCover = null;
      this.updateCoverModalVisible = false;
    },
    showUpdateCoverModal() {
      this.updateCoverModalVisible = true;
    },
    imgChange() {
      this.placeImgs = this.$refs.placeImgs[0].files[0];
    },
    addImgOk() {
      console.log(this.placeImgs);
      if (this.placeId == "") {
        alert("地点编号不能为空");
      } else if (this.placeImgs == null) {
        alert("地点图片不能为空");
      } else {
        const imgData = new FormData();
        imgData.append("image", this.placeImgs);
        this.$axios({
          method: "post",
          url: "/api/admin/position/" + this.placeId + "/image/",
          params: {},
          headers: {
            Authorization: localStorage.getItem('Authorization')
          },
          data: imgData
        }).then((res) => {
          console.log(res);
          this.placeId = "";
          this.placeImgs = null;
          document.getElementById('uploadFile').value = null;
          this.addImgModalVisible = false;
          this.getPlaces({"page":"1"});
          this.selectedRows = [];
          this.selectedRowKeys = [];
        }).catch((error) => {
          console.log(error);
        });
      }
    },
    addImgCancel() {
      this.placeId = "";
      this.placeImgs = null;
      this.addImgModalVisible = false;
      document.getElementById('uploadFile').value = null;
    },
    deletePlaceImages(imageUrl) {
      let imageId = imageUrl.split("/")[6];
      this.$axios({
        method: "delete",
        url: "/api/admin/position/" + this.data[this.activeKey-1].id + "/image/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {
          id: [imageId]
        }
      }).then((res) => {
        console.log(res);
        this.getPlaces({"page":"1"});
        this.selectedRows = [];
        this.selectedRowKeys = [];
      }).catch((error) => {
        console.log(error);
      });
    },
    showAddImgModal() {
      this.addImgModalVisible = true;
    },
    descriptionCancel() {
      this.data[this.activeKey-1].description = this.data[this.activeKey-1].preDescription;
      this.data[this.activeKey-1].descriptionEditable = false;
      this.descriptionEditable = this.activeKey - 1 + "" + "false";
    },
    descriptionSave() {
      this.$axios({
        method: "put",
        url: "/api/admin/position/" + this.data[this.activeKey-1].id + "/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {
          "description": this.data[this.activeKey-1].description
        }
      }).then((res) => {
        console.log(res);
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      })
      this.data[this.activeKey-1].descriptionEditable = false;
      this.descriptionEditable = this.activeKey - 1 + "" + "false";
    },
    descriptionEdit() {
      this.data[this.activeKey-1].preDescription = this.data[this.activeKey-1].description;
      this.data[this.activeKey-1].descriptionEditable = true;
      this.descriptionEditable = this.activeKey - 1 + "" + "true";
    },
    getPlaces(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/position/",
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
          item.status = item.visibility == false ? '未上架' : '已上架';
          item.preDescription = item.description;
          item.placeImages = [];
          item.images.forEach((image) => {
            item.placeImages.push("http://114.116.194.214/api/core/images/" + image + "/data/");
          })
          item.placeCover = "http://114.116.194.214/api/core/images/" + item.cover + "/data/";
        })
        this.panes[0].data = this.data;
        this.spinning = false;
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    deletePlace(placeId) {
      this.$axios({
        method: "delete",
        url: "api/admin/position/" + placeId + "/",
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
    dealPlace(id, d) {
      this.$axios({
        method: "put",
        url: "api/admin/position/" + id + "/",
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
    passSinglePlace(record) {
      this.dealPlace(record.id, {"visibility": true});
      this.remove(record.key);
      this.getPlaces({"page": "1"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
    },
    failSinglePlace(record) {
      this.dealPlace(record.id, {"visibility": false});
      this.remove(record.key);
      this.getPlaces({"page": "1"});
      this.selectedRows = [];
      this.selectedRowKeys = [];
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
      this.searchText = value;
      params[this.searchType] = this.searchText;
      this.getPlaces(params);
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
      this.getPlaces(params);
    },
    deletePlaces() {
      this.selectedRows.forEach((item)=>{
        this.deletePlace(item.id);
        this.remove(item.key);
      });
      this.getPlaces({"page":"1"});
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
};
</script>
