<template>
  <div class="main">
    <div class="comment-list">
      <a-comment v-for="comment in commentList" :key="comment.key">
        <template slot="actions">
          <span key="comment-basic-like">
            <a-tooltip title="Like">
              <a-icon type="like" :theme="action === 'liked' ? 'filled' : 'outlined'" @click="like" />
            </a-tooltip>
            <span style="padding-left: '8px';cursor: 'auto'">
              {{ likes }}
            </span>
          </span>
          <span key="comment-basic-dislike">
            <a-tooltip title="Dislike">
              <a-icon
                type="dislike"
                :theme="action === 'disliked' ? 'filled' : 'outlined'"
                @click="dislike"
              />
            </a-tooltip>
            <span style="padding-left: '8px';cursor: 'auto'">
              {{ dislikes }}
            </span>
          </span>
          <span key="comment-basic-reply-to">Reply to</span>
        </template>
        <a slot="author">Han Solo</a>
        <a-avatar
          slot="avatar"
          src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          alt="Han Solo"
        />
        <p slot="content">
          {{comment.content}}
        </p>
        <a-tooltip slot="datetime" :title="moment().format('YYYY-MM-DD HH:mm:ss')">
          <span>{{ moment().fromNow() }}</span>
        </a-tooltip>
      </a-comment>
  </div>
     
    
  </div>
</template>

<script>
import moment from 'moment';
  export default {
    data(){
      return{
        isLogin:false,
        likes: 0,
        dislikes: 0,
        action: null,
        moment,
        commentList:[{
          key:1,
          content:'We supply a series of design principles, practical patterns and high quality design resources'
        },{
          key:2,
          content:'We supply a series of design principles, practical patterns and high quality design resources'
        },{
          key:3,
          content:'We supply a series of design principles, practical patterns and high quality design resources'
        },
        ]
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
    like() {
      this.likes = 1;
      this.dislikes = 0;
      this.action = 'liked';
    },
    dislike() {
      this.likes = 0;
      this.dislikes = 1;
      this.action = 'disliked';
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
  /* border: solid red 1px; */
}
.comment-list{
  text-align: left;
  width:600px;
}
.main{
  padding:30px 150px;
  width:100%;
  height:700px;
  
}

</style>