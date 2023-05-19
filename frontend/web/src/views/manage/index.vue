<template>
  <a-layout id="components-layout-demo-top-side-2">
    <a-layout-header class="header">
      <div class="avatar" >
        <a-dropdown>
          <a-avatar icon="user">
          </a-avatar>
          <a-menu slot="overlay" @click="onClick">
            <a-menu-item key="2">
              退出登录
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
      <div class="info">
        <p style="color:white;">管理员：{{username}}</p >
      </div>
      <div class="logo">游迹后台管理系统</div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <a-menu
          mode="inline"
          :default-selected-keys="['5']"
          :default-open-keys="['sub2']"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-sub-menu key="sub2">
            <span slot="title"><a-icon type="laptop" />游记审核</span>
            <a-menu-item key="5">
              待审核
              <router-link to="/underInspect"></router-link>
            </a-menu-item>
            <a-menu-item key="6">
              审核通过
              <router-link to="/passInspect"></router-link>
            </a-menu-item>
            <a-menu-item key="7">
              审核不通过
              <router-link to="/failInspect"></router-link>
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub4">
            <span slot="title"><a-icon type="laptop" />同行审核</span>
            <a-menu-item key="15">
              待审核
              <router-link to="/togetherUnderInspect"></router-link>
            </a-menu-item>
            <a-menu-item key="16">
              审核通过
              <router-link to="/togetherPassInspect"></router-link>
            </a-menu-item>
            <a-menu-item key="17">
              审核不通过
              <router-link to="/togetherFailInspect"></router-link>
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub5">
            <span slot="title"> <a-icon type="carry-out" /> 日程审核</span>
            <a-menu-item key="31">
              待审核
              <router-link to="/calenderUnderInspect"></router-link>
            </a-menu-item>
            <a-menu-item key="32">
              审核通过
              <router-link to="/calenderPassInspect"></router-link>
            </a-menu-item>
            <a-menu-item key="33">
              审核不通过
              <router-link to="/calenderFailInspect"></router-link>
            </a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="sub3">
            <span slot="title"><a-icon type="notification" />信息推送</span>
            <a-menu-item key="9">
              新信息
              <router-link to="/newMsg"></router-link>
            </a-menu-item>
            <a-menu-item key="10">
              已推送
              <router-link to="/oldMsg"></router-link>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item   key="11">
            <a-icon type="user" />用户管理
            <router-link to="/user"></router-link>
          </a-menu-item>
          <a-menu-item key="12">
            <a-icon type="file-image" />游记管理
            <router-link to="/record"></router-link>
          </a-menu-item>
          <a-menu-item key="40">
            <a-icon type="carry-out" />日程管理
            <router-link to="/calender"></router-link>
          </a-menu-item>
          <a-menu-item key="42">
            <a-icon type="rocket" />航班管理
            <router-link to="/flight"></router-link>
          </a-menu-item>
          <a-menu-item key="43">
            <a-icon type="fund" /> 用户日志
            <router-link to="/userlog"></router-link>
          </a-menu-item>
          <a-menu-item key="13">
            <a-icon type="environment" />地点管理
            <router-link to="/place"></router-link>
          </a-menu-item>
          <a-menu-item key="14">
            <a-icon type="team" />同行管理
            <router-link to="/together"></router-link>
          </a-menu-item>
          <a-menu-item key="18">
            <a-icon type="picture" />广告管理
            <router-link to="/ads"></router-link>
          </a-menu-item>
          <a-menu-item key="41">
            <a-icon type="area-chart" /> 数据统计
            <router-link to="/statistics"></router-link>
          </a-menu-item>
          <a-menu-item key="19">
            <a-icon type="info-circle" />问题反馈
            <router-link to="/feedback"></router-link>
          </a-menu-item>
          <a-sub-menu key="sub10">
            <span slot="title"><a-icon type="flag" />景点管理</span>
            <a-menu-item key="20">
              景点信息管理
              <router-link to="/sceneryManage"></router-link>
            </a-menu-item>
            <a-menu-item key="21">
              景点审核
              <router-link to="/sceneryAudit"></router-link>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item key="22">
            <a-icon type="schedule" />旅行计划管理
            <router-link to="/planDisplay"></router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <a-layout style="padding: 0 24px 24px;min-height:600px">
        <router-view style="min-height:600px"></router-view>
      </a-layout>

    </a-layout>
  </a-layout>
</template>
<script>
export default {
  data() {
    return {
      username: "",
      collapsed: false,
    };
  },
  created() {
  },
  mounted() {
    this.username = localStorage.getItem('Username');
  },
  methods:{
    onClick({key}){
      if (key == 1) {
        console.log(key);
      } else if (key == 2){
        localStorage.removeItem('Authorization');
        localStorage.removeItem('Username');
        this.$router.push("/");
      }
    }
  }
};
</script>


<style>
.logo {
  font-size:20px;
  color:white;
  width: 320px;
  line-height: 30px;
  height: 31px;
  margin: 16px 28px 16px 0;
  float: right;
  display:inline-block;
  /* border: white solid 1px; */
}
.avatar{
  float: left;
  display:inline-block;
  /* border: red solid 1px; */
  width:50px
}
.info{
  font-size:16px;
  width:300px;
  height:60px;
  float: left;
  text-align:left;
  margin-top:0px;
  margin: left 20px;
}
</style>
