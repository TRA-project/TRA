<template>
  <div class="main">
    <div class="bg-blur"></div>
    <div>
        <div class="title">游迹<br>后台管理系统</div>
        <div class="btns">
          <a-button class="btn" type="primary" @click="toLogin">登录</a-button>
          <a-button class="btn" type="default" @click="toRegister">注册</a-button>
        </div>
    </div>
  </div>
</template>

<script>
  export default {
    data(){
      return{
        isLogin:false,
      }
    },
    methods:{
      toLogin(){
        this.$router.push({
          name:"login"
        });
      },toRegister(){
        this.$router.push({
          name:"register"
        });
      },
    },
  }
</script>

<style scoped>
.title {
  padding-top: 150px;
  margin:auto;
  width:500px;
  height:250px;
  font-size:30px;
  color: white;
  /* border: solid red 1px; */
}
.main {
  width:100%;
  height:700px;
  background-color: transparent;
}
.btn {
  font-size:18px;
  height:50px;
  width:100px;
  margin:50px 30px;
}
.btns {
  margin:auto;
  width:500px;
  height:100px;
  /* border: solid red 1px; */
}
.bg-blur {
  background: url('../assets/home_background.png');
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

/* .bottom {
  width: 600px;
  height: 400px;
  padding-top: 100px;
  background-color: rgba(255, 255, 255, 0.2);
} */
</style>
