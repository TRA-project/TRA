<template>
  <div style="text-align:left;margin:10px 0">
    <a-tabs v-model="activeKey" type="editable-card" @edit="onEdit" hide-add>
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <div v-if="pane.key === '0'">
          <a-button style="margin:0 10px 15px 0px" type="primary" @click="add">查看</a-button>
          <a-button  style="margin:0 5px" @click="deleteAds">删除</a-button>
          <a-button  style="margin:0 5px" type="primary" @click="showCreateAdModal">创建广告</a-button>
          <a-modal v-model="createAdModalVisible" title="创建新广告" @ok="createAdOk" @cancel="createAdCancel">
            <a-form>
              <a-form-item label="广告标题：">
                <a-input placeholder="请输入广告标题" v-model="newAdTitle" />
              </a-form-item>
              <a-form-item label="广告描述：">
                <a-textarea placeholder="请输入广告描述" :rows="3" v-model="newAdContent"/>
              </a-form-item>
              <a-form-item label="广告链接：">
                <a-input placeholder="请输入广告链接" v-model="newAdUrl" />
              </a-form-item>
              <a-form-item label="广告图片：">
                <input type="file" ref="newAdCover" @change="newCoverChange" accept="image/*"/>
              </a-form-item>
            </a-form>
          </a-modal>
          <a-button  style="margin:0 5px" @click="showUpdateCoverModal">更换封面</a-button>
          <a-modal v-model="updateCoverModalVisible" title="更换广告封面" @ok="updateCoverOk" @cancel="updateCoverCancel">
            <a-form>
              <a-form-item label="广告编号：">
                <a-input placeholder="请输入广告编号" v-model="adId" />
              </a-form-item>
              <a-form-item label="广告图片：">
                <input type="file" ref="adCover" @change="coverChange" accept="image/*">
              </a-form-item>
            </a-form>
          </a-modal>
          <a-spin :spinning="spinning">
            <a-table :row-selection="rowSelection" :columns="columns" :data-source="pane.data" :pagination="false">
              <a slot="id" slot-scope="text, record" @click="addSingle(record)">{{ text}}</a>
              <template slot="action" slot-scope="record" >
                <a-button style="margin-right:10px" size="small" type="primary" @click="passSingleAd(record)">上架</a-button>
                <a-button size="small" @click="failSingleAd(record)">下架</a-button>
              </template>
            </a-table>
            <br>
            <a-pagination show-quick-jumper :page-size="1" :total="pageNum" @change="onPageChange" />
          </a-spin>
        </div>
        <div v-else style="margin:10px 0 10px 15px;">
          <a-descriptions title="广告信息">
          <a-descriptions-item label="广告编号" :span="3">
            {{data[pane.key-1].id}}
          </a-descriptions-item>
          <a-descriptions-item label="广告标题" :span="3" :key="titleEditable">
            <div v-if="data[pane.key-1].titleEditable">
              <a-textarea v-model="data[pane.key-1].title" style="width: 700px" auto-size/>
              <a-button style="margin-left: 40px; width: 64px; height: 32px" type="primary" @click="titleSave">保存</a-button>
              <a-button style="margin-left: 20px; width: 64px; height: 32px" @click="titleCancel">取消</a-button>
            </div>
            <div v-else >
              {{ data[pane.key-1].title }}
              <a-icon
                type="edit"
                theme="twoTone"
                style="fontSize: 18px;"
                @click="titleEdit"
              />
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="广告内容" :span="3" :key="contentEditable">
            <div v-if="data[pane.key-1].contentEditable">
              <a-textarea v-model="data[pane.key-1].content" style="width: 700px" auto-size/>
              <a-button style="margin-left: 40px; width: 64px; height: 32px" type="primary" @click="contentSave">保存</a-button>
              <a-button style="margin-left: 20px; width: 64px; height: 32px" @click="contentCancel">取消</a-button>
            </div>
            <div v-else >
              {{ data[pane.key-1].content }}
              <a-icon
                type="edit"
                theme="twoTone"
                style="fontSize: 18px;"
                @click="contentEdit"
              />
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="广告链接" :span="3" :key="urlEditable">
            <div v-if="data[pane.key-1].urlEditable">
              <a-textarea v-model="data[pane.key-1].url" style="width: 700px" auto-size/>
              <a-button style="margin-left: 40px; width: 64px; height: 32px" type="primary" @click="urlSave">保存</a-button>
              <a-button style="margin-left: 20px; width: 64px; height: 32px" @click="urlCancel">取消</a-button>
            </div>
            <div v-else >
              {{ data[pane.key-1].url }}
              <a-icon
                type="edit"
                theme="twoTone"
                style="fontSize: 18px;"
                @click="urlEdit"
              />
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="阅读次数" :span="3">
            {{data[pane.key-1].read}}
          </a-descriptions-item>
          <a-descriptions-item label="广告封面" :span="3">
            <img :src="data[pane.key-1].coverImage" width="200" alt="">
              <!-- <a-upload
                name="cover"
                :multiple="false"
                :before-upload="beforeUpload"
                list-type="picture-card"
                @preview="handlePreview"
                :default-file-list="data[pane.key-1].fileList"
                @change="handlePhotoChange"
                style="margin-left: 30px"
              >
                <a-button> <a-icon type="upload"  /> 更换封面 </a-button>
              </a-upload>
              <a-modal :visible="previewVisible" :footer="null" @cancel="handlePhotoCancel">
                <img alt="example" style="width: 100%" :src="previewImage" />
              </a-modal> -->
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
    title: '广告编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'id' },
  },
  {
    title: '广告标题',
    dataIndex: 'title',
  },
  {
    title: '广告状态',
    dataIndex: 'status',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];
// function getBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = error => reject(error);
//   });
// }
export default {
  name:"ads",
  data() {
    const panes = [
      { title: '广告管理', data:[],  key: '0' ,closable: false },
    ];
    return {
      previewVisible: false,
      previewImage: '',
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
      titleEditable: "",
      contentEditable: "",
      urlEditable: "",
      createAdModalVisible: false,
      newAdTitle: "",
      newAdContent: "",
      newAdUrl: "",
      newAdCover: null,
      updateCoverModalVisible: false,
      adId: "",
      adCover: null,
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
            title: record.id,
          },
        }),
      };
    },
  },
  mounted(){
    this.getAds({"page":"1"});
  },
  methods: {
    // beforeUpload: (file) => {
    //   const reader = new FileReader();
    //   reader.readAsDataURL(file);
    //   console.log(this);
    //   reader.onload = function() {
    //     file.url = this.result;
    //     console.log(file.url);
    //   };
    //   this.uploadPhoto(file.url);
    //   console.log(this.data);
    //   this.data[this.activeKey-1].fileList.push(file);
    //   console.log(this.data[this.activeKey-1].fileList);
    //   return false;
    // },
    // handlePhotoCancel() {
    //   this.previewVisible = false;
    // },
    // async handlePreview(file) {
    //   if (!file.url && !file.preview) {
    //     file.preview = await getBase64(file.originFileObj);
    //   }
    //   this.previewImage = file.url || file.preview;
    //   this.previewVisible = true;
    // },
    // handlePhotoChange({ fileList }) {
    //   console.log(fileList);
    //   this.fileList = fileList;
    // },
    // uploadPhoto(url){
    //   console.log("start upload");
    //   this.$axios({
    //     method: "post",
    //     url: "/api/admin/images/",
    //     params: {},
    //     headers: {
    //       Authorization: localStorage.getItem('Authorization')
    //     },
    //     data: {
    //       "image":url
    //     }
    //   }).then((res) => {
    //     console.log(res);
    //     let id = res.id;
    //     console.log(id);
    //     this.uploadAdPhoto(id);

    //   }).catch((error) => {
    //     console.log(error);
    //   });
    // },
    // uploadCoverCancel() {
    //   this.coverModalVisible = false;
    //   this.coverRecord = null;
    //   this.cover = null;
    // },
    // uploadAdCover(id){
    //    this.$axios({
    //     method: "put",
    //     url: "/api/admin/ads/"+ this.coverRecord.id + "/",
    //     params: {},
    //     headers: {
    //       Authorization: localStorage.getItem('Authorization')
    //     },
    //     data: {
    //       "cover":id
    //     }
    //   }).then((res) => {
    //     console.log(res);
    //     this.remove(this.coverRecord.key);
    //     this.getAds({"page":"1"})
    //     this.selectedRows = [];
    //     this.selectedRowKeys = [];
    //     this.coverModalVisible = false;
    //     this.coverRecord = null;
    //     this.cover = null;
    //   }).catch((error) => {
    //    console.log(error);
    //   });
    // },
    // uploadCover() {
    //   const image = new FormData();
    //   image.append('image', this.cover);
    //   this.$axios({
    //     method: "post",
    //     url: "/api/admin/images/",
    //     params: {},
    //     headers: {
    //       Authorization: localStorage.getItem('Authorization')
    //     },
    //     data: image
    //   }).then((res) => {
    //     console.log(res);
    //     this.uploadAdCover(res.data.id);
    //   }).catch((error) => {
    //     console.log(error);
    //   });
    // },
    // coverChange() {
    //   this.cover = this.$refs.adCover[this.coverRecord.key].files[0];
    //   console.log(this.cover);
    // },
    // showCoverModal(record) {
    //   this.coverRecord = record;
    //   this.coverModalVisible = true;
    // },
    coverChange() {
      this.adCover = this.$refs.adCover[0].files[0];
      console.log(this.adCover);
    },
    updateCoverOk() {
      if (this.adId == "") {
        alert("广告编号不能为空");
      } else if (this.adCover == null) {
        alert("广告封面不能为空");
      } else {
        const coverData = new FormData();
        coverData.append("image", this.adCover);
        this.$axios({
          method: "post",
          url: "/api/admin/images/",
          params: {},
          headers: {
            Authorization: localStorage.getItem('Authorization')
          },
          data: coverData
        }).then((res) => {
          console.log(res);
          let coverId = res.data.id;
          this.$axios({
            method: "put",
            url: "/api/admin/ads/"+ this.adId + "/",
            params: {},
            headers: {
              Authorization: localStorage.getItem('Authorization')
            },
            data: {
              "cover": coverId
            }
          }).then((res) => {
            console.log(res);
            this.adId = "";
            this.adCover = null;
            this.updateCoverModalVisible = false;
            this.getAds({"page":"1"});
            this.selectedRows = [];
            this.selectedRowKeys = [];
          }).catch((error) => {
            console.log(error);
            if (error.response.status == 404) {
              alert("广告编号不存在")
            }
          });
        }).catch((error) => {
          console.log(error);
        });
      }
    },
    updateCoverCancel() {
      this.adId = "";
      this.adCover = null;
      this.updateCoverModalVisible = false;
    },
    showUpdateCoverModal() {
      this.updateCoverModalVisible = true;
    },
    newCoverChange() {
      this.newAdCover = this.$refs.newAdCover[0].files[0];
      console.log(this.newAdCover);
    },
    createAdOk() {
      if (this.newAdTitle == "") {
        alert("广告标题不能为空");
      } else if (this.newAdUrl == "") {
        alert("广告链接不能为空");
      } else if (this.newAdCover == null) {
        alert("广告封面不能为空");
      } else if (this.newAdContent == "") {
        alert("广告内容不能为空");
      } else {
        const newAdData = new FormData();
        newAdData.append('title', this.newAdTitle);
        newAdData.append('content', this.newAdContent);
        newAdData.append('cover', this.newAdCover);
        newAdData.append('url', this.newAdUrl);
        this.$axios({
          method: "post",
          url: "/api/admin/ads/",
          params: {},
          headers: {
            Authorization: localStorage.getItem('Authorization')
          },
          data: newAdData
        }).then((res) => {
          console.log(res);
          this.newAdTitle = "";
          this.newAdContent = "";
          this.newAdUrl = "";
          this.newAdCover = null;
          this.createAdModalVisible = false;
          this.getAds({"page": "1"});
          this.selectedRows = [];
          this.selectedRowKeys = [];
        }).catch((error) => {
          if (error.response.status == 403) {
            this.visible = true;
          }
        });
      }
    },
    createAdCancel() {
      this.newAdTitle = "";
      this.newAdContent = "";
      this.newAdUrl = "";
      this.newAdCover = null;
      this.createAdModalVisible = false;
    },
    showCreateAdModal() {
      this.createAdModalVisible = true;
    },
    titleCancel() {
      this.data[this.activeKey-1].title = this.data[this.activeKey-1].preTitle;
      this.data[this.activeKey-1].titleEditable = false;
      this.titleEditable = this.activeKey - 1 + "" + "false";
    },
    titleSave() {
      this.$axios({
        method: "put",
        url: "/api/admin/ads/" + this.data[this.activeKey-1].id + "/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {
          "title": this.data[this.activeKey-1].title
        }
      }).then((res) => {
        console.log(res);
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
      this.data[this.activeKey-1].titleEditable = false;
      this.titleEditable = this.activeKey - 1 + "" + "false";
    },
    titleEdit() {
      this.data[this.activeKey-1].preTitle = this.data[this.activeKey-1].title;
      this.data[this.activeKey-1].titleEditable = true;
      this.titleEditable = this.activeKey - 1 + "" + "true";
    },
    contentCancel() {
      this.data[this.activeKey-1].content = this.data[this.activeKey-1].preContent;
      this.data[this.activeKey-1].contentEditable = false;
      this.contentEditable = this.activeKey - 1 + "" + "false";
    },
    contentSave() {
      this.$axios({
        method: "put",
        url: "/api/admin/ads/" + this.data[this.activeKey-1].id + "/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {
          "content": this.data[this.activeKey-1].content
        }
      }).then((res) => {
        console.log(res);
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
      this.data[this.activeKey-1].contentEditable = false;
      this.contentEditable = this.activeKey - 1 + "" + "false";
    },
    contentEdit() {
      this.data[this.activeKey-1].preContent = this.data[this.activeKey-1].content;
      this.data[this.activeKey-1].contentEditable = true;
      this.contentEditable = this.activeKey - 1 + "" + "true";
    },
    urlCancel() {
      this.data[this.activeKey-1].url = this.data[this.activeKey-1].preUrl;
      this.data[this.activeKey-1].urlEditable = false;
      this.urlEditable = this.activeKey - 1 + "" + "false";
    },
    urlSave() {
      this.$axios({
        method: "put",
        url: "/api/admin/ads/" + this.data[this.activeKey-1].id + "/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: {
          "url": this.data[this.activeKey-1].url
        }
      }).then((res) => {
        console.log(res);
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
      this.data[this.activeKey-1].urlEditable = false;
      this.urlEditable = this.activeKey - 1 + "" + "false";
    },
    urlEdit() {
      this.data[this.activeKey-1].preUrl = this.data[this.activeKey-1].url;
      this.data[this.activeKey-1].urlEditable = true;
      this.urlEditable = this.activeKey - 1 + "" + "true";
    },
    getAds(p) {
      this.spinning = true;
      this.$axios({
        method: "get",
        url: "api/admin/ads/",
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
          item.status = item.visible == false ? '未上架' : '已上架';
          item.preTitle = item.title;
          item.preContent = item.content;
          item.preUrl = item.url;
          item.coverImage = item.cover == null ? null : "https://tra-fr-2.zhouyc.cc/api/core/images/" + item.cover.id + "/data/";
        //   item.fileList = [{
        //   uid: '-1',
        //   name: 'xxx.png',
        //   status: 'done',
        //   url: item.coverImage
        //  },]
        })
        this.panes[0].data = this.data;
        this.spinning = false;
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    deleteAd(adId) {
      this.$axios({
        method: "delete",
        url: "api/admin/ads/" + adId + "/",
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
    dealAd(id, d) {
      this.$axios({
        method: "put",
        url: "api/admin/ads/" + id + "/",
        params: {},
        headers: {
          Authorization: localStorage.getItem('Authorization')
        },
        data: d,
      }).then((res) => {
        console.log(res);
        this.getAds({"page": "1"});
        this.selectedRows = [];
        this.selectedRowKeys = [];
      }).catch((error) => {
        if (error.response.status == 403) {
          this.visible = true;
        }
      });
    },
    passSingleAd(record) {
      this.dealAd(record.id, {"visible": true});
      this.remove(record.key);
      // this.getAds({"page": "1"});
      // this.selectedRows = [];
      // this.selectedRowKeys = [];
    },
    failSingleAd(record) {
      this.dealAd(record.id, {"visible": false});
      this.remove(record.key);
      // this.getAds({"page": "1"});
      // this.selectedRows = [];
      // this.selectedRowKeys = [];
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
      this.getAds(params);
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
      this.getAds(params);
    },
    deleteAds() {
      this.selectedRows.forEach((item)=>{
        this.deleteAd(item.id);
        this.remove(item.key);
      });
      this.getAds({"page":"1"});
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