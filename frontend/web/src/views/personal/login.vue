<template>
  <div class="main">
    <div class="bg-blur"></div>
    <div>

        <div class="title">游迹<br>后台管理系统</div>
        <a-input style="width: 300px; margin-top: 10px" v-model="username" placeholder="用户名" />
        <br>
        <a-input-password style="width: 300px; margin-top: 20px" v-model="password" placeholder="密码" />
        <p style="color: white; font-size: 14px; line-height: 14px; margin-top: 10px">若无账号，请联系超级管理员<a-button style="padding: 0" type="link" @click="toRegister">注册账户</a-button></p>
        <div class="btns">
          <a-button class="btn" type="primary" @click="logIn">登录</a-button>
          <a-button class="btn" type="default" @click="toHome">返回</a-button>
        </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  export default {
    data(){
      return{
        isLogin:false,
        username: '',
        password: '',
        userToken: '',
      }
    },
    methods:{
      ...mapMutations(['changeLogin']),
      logIn(){
        if (this.username == '' || this.password == '') {
            alert('账号或密码不能为空')
        } else {
            console.log(this);
            this.$axios({
                method: "post",
                url: "api/token-auth/",
                params: {},
                headers: {},
                data: {
                    username: this.username,
                    password: this.password
                },
            }).then((res) => {
                this.userToken = 'Bearer ' + res.data.access;
                this.changeLogin({Authorization: this.userToken, Username: this.username});
                this.$router.push(({
                    name: "index",
                }));
            }).catch(error => {
                alert('账号或密码错误');
                console.log(this.$axios);
                console.log(error);
            });
        }
      },
      toHome(){
        this.$router.push('/');
      },
      toRegister() {
        this.$router.push('/register');
      }
    },

  }
</script>
<style scoped>
.title{
  padding-top: 150px;
  margin:auto;
  width:500px;
  height:250px;
  font-size:30px;
  color: white;
  /* border: solid red 1px; */
}
.main{
  width:100%;
  height:700px;
  /* background-color: antiquewhite; */
  background-color: transparent;
}
.btn{
  font-size:18px;
  height:50px;
  width:100px;
  margin:0px 30px;
}
.btns{
  margin: 15px auto;
  width:500px;
  height:100px;
  /* border: solid red 1px; */
}
.bg-blur {
  background: url('../../assets/home_background.png');
  height: 100%;
  width: 100%;
  float: left;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(4px);
  z-index: -1;
  position: absolute;
}
</style>
