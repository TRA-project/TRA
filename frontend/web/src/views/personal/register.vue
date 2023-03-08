<template>
  <div class="main">
    <div class="bg-blur"></div>
    <div>
        <div class="title">游迹<br>后台管理系统</div>
        <a-input style="width: 300px; margin-top: 10px" v-model="superusername" placeholder="超级管理员账号" />
        <br>
        <a-input-password style="width: 300px; margin-top: 20px" v-model="superpassword" placeholder="超级管理员密码" />
        <br>
        <a-input style="width: 300px; margin-top: 20px" v-model="username" placeholder="新注册的管理员账号" />
        <br>
        <a-input-password style="width: 300px; margin-top: 20px" v-model="password" placeholder="新注册的管理员密码" />
        <div class="btns">
          <a-button class="btn" type="primary" @click="register">注册</a-button>
          <a-button class="btn" type="default" @click="toHome">返回</a-button>
        </div>
    </div>
  </div>
</template>

<script>
  export default {
    data(){
      return{
        superusername: '',
        superpassword: '',
        username: '',
        password: '',
      }
    },
    methods:{
      register() {
        if (this.superusername == '' || this.superpassword == '') {
          alert('超级管理员账号或密码不能为空')
        } else {
          this.$axios({
            method: "post",
            url: "api/token-auth/",
            params: {},
            headers: {},
            data: {
              username: this.superusername,
              password: this.superpassword
            }
          }).then((res) => {
            console.log(res);
            let superuserToken = 'Bearer ' + res.data.access;
            if (this.username == '' || this.password == '') {
              alert('注册的管理员账号或密码不能为空')
            } else {
              this.$axios({
                method: "post",
                url: "api/user/",
                params: {},
                headers: {
                  Authorization: superuserToken
                },
                data: {
                  username: this.username,
                  password: this.password
                }
              }).then((res) => {
                alert('注册成功');
                console.log(res);
              }).catch(error => {
                alert('该账户已被注册');
                console.log(error);
              })
            }
          }).catch(error => {
            alert('超级管理员账号或密码错误');
            console.log(error);
          })
        }
      },
      toHome(){
        this.$router.push('/');
      },

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
  margin:40px 30px;
}
.btns{
  margin:auto;
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