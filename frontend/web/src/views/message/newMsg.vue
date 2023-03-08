<template>
  <div class="main">
    <div class="header">
    </div>
    <div class="editor-body">
      <div>
        <p class="title">发送系统信息</p>
        <div style="text-align: left; width: 100%; height: 40px;">
          <span style="width: 70px; display: inline-block">收件人：</span>
          <a-select mode="tags" v-model="msgUsers" :disabled="selectDisabled" style="width: 500px; height: 40px;" :placeholder="placeholder">
          
          <!-- <a-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
            {{ (i + 9).toString(36) + i }}
          </a-select-option> -->
          </a-select>
          <a-button v-if="notAllUsers" style="margin-left: 20px; width: 100px; height: 35px" type="default" @click="allUsersChange">
            所有用户
          </a-button>
          <a-button v-else style="margin-left: 20px; width: 100px; height: 35px" type="primary" @click="allUsersChange">
            取消全选
          </a-button>
        </div>
        <br>
        <div style="text-align: left; width: 100%; height: 40px;">
          <span style="width: 70px; display: inline-block">标题：</span>
          <a-input v-model="msgTitle" style="width: 500px; line-height: 40px" />
        </div>
        <br>
        <div style="text-align: left; width: 100%;;">
          <span style="width: 70px; display: inline-block; vertical-align: top">内容：</span>
          <a-textarea v-model="msgContent" style="width: 700px; resize: none" :rows='10' />
        </div>
        <br>
        <div style="text-align: left; width: 100%; height: 40px;">
          <a-button type="primary" style="margin-left: 650px; width: 100px; height: 40px;" @click="send">
            发送
          </a-button>
        </div>
        <!-- <editor :content="content" @Edit="Edit" style=""></editor> -->
      </div>
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
  </div>
</template>

<script>
// import editor from "../../components/editorTool.vue";
export default {
  components: {
    // editor,
  },
  data(){
    return{
      selectDisabled: false,
      notAllUsers: true,
      placeholder: '',
      msgUsers: [],
      msgTitle: '',
      msgContent: '',
      visible: false,
      confirmLoading: false,
      ModalText: '您的登录信息已过期，请重新登录'
      // content:"",
      // isEdit:true
    }
  },
  methods:{
    openNotificationWithIcon(type) {
      this.$notification[type]({
        message: '发送成功',
      });
    },
    openNotificationWithIcon400(type) {
      this.$notification[type]({
        message: '信息内容不能超过400字',
      });
    },
    allUsersChange() {
      this.notAllUsers = ! this.notAllUsers;
      this.selectDisabled = ! this.notAllUsers;
      if (this.notAllUsers == false) {
        this.msgUsers = [];
        this.placeholder = "所有用户"
      } else {
        this.placeholder = ''
      }
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
    send() {
      if (this.msgTitle == '') {
        alert('信息标题不能为空');
      } else {
        console.log(localStorage.getItem('Authorization'));
        this.$axios({
          method: "post",
          url: "api/admin/messages/",
          params: {},
          headers: {
            Authorization: localStorage.getItem('Authorization')
          },
          data: {
            content: this.msgTitle + '\n' + this.msgContent,
          },
        }).then((res) => {
          let messageId = res.data.id;
          let d = {};
          if (this.msgUsers != []) {
            d["id"] = this.msgUsers;
          }
          this.$axios({
            method: "post",
            url: "api/admin/messages/" + messageId + "/send/",
            params: {},
            headers: {
              Authorization: localStorage.getItem('Authorization')
            },
            data: d
          }).then((res) => {
            console.log(res);
            this.openNotificationWithIcon('success');
            this.selectDisabled = false;
            this.notAllUsers = true;
            this.msgUsers = [];
            this.msgTitle = '';
            this.msgContent = '';
          }).catch((error) => {
            if (error.response.status == 403) {
              this.visible = true;
            }
          });
        }).catch((error) => {
          console.log(error);
          if (error.response.status == 403) {
            this.visible = true;
          } else if (error.response.status == 400) {
            this.openNotificationWithIcon400('error')
          }
        });
      }
    },
    // Edit(data) {
    //     console.log(data);
    //   this.content = data;
    //   this.isEdit=false;
    // },
  }
}
</script>

<style>
.title {
  padding-top: 20px;
  font-size: 24px;
  line-height: 24px;
  text-align: left;
}
</style>
