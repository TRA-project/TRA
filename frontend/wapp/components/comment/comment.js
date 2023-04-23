// components/comment/comment.js
const utils = require("../../utils/util.js")
const token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    toHideModal: {
      type: Boolean,
      value: true,
    },
    sightId: {
      type: Number,
      value: 15,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height: 600,
    comment_list:[],
    comment_dict:{},
    animationData: {},
    animation: {},
    hideModal: true,

    comments: 0,
    next_comments:"init",
    comment_content:"",
    reply_id:"",
    reply_nickname:"发表评论",
    focus:"",
  },

  // 数据监听器
  observers: {
    "toHideModal": function(toHideModal) {
      console.log(`toHideModal = ${toHideModal}`);
      if (toHideModal === false && this.data.hideModal === true) {
        this.showModal()
        console.log("toHideModal === false")
      } else if (toHideModal === true && this.data.hideModal === false) {
        this.hideModal()
        console.log("toHideModel === true")
      }
    }
  },

  lifetimes: {
    attached() {
      this.getComments()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 隐藏遮罩层
    hideModal() {
      var that = this;
      var animation = wx.createAnimation({
        duration: 800,//动画的持续时间 默认400ms 数值越大，动画越慢 数值越小，动画越快
        timingFunction: 'ease-in-out',//动画的效果 默认值是linear
      })
      this.animation = animation
      that.fadeDown();//调用隐藏动画 
      setTimeout(function () {
        that.setData({
          hideModal: true
        })
      }, 800)//先执行下滑动画，再隐藏模块
    },

    // 显示遮罩层
    showModal: function () {
      var that = this;
      that.setData({
        hideModal: false
      })
      var animation = wx.createAnimation({
        duration: 500,//动画的持续时间 默认400ms 数值越大，动画越慢 数值越小，动画越快
        timingFunction: 'ease',//动画的效果 默认值是linear
      })
      this.animation = animation
      
      setTimeout(function () {
        that.fadeIn();//调用显示动画
      }, 200)
    },

    fadeDown: function () {
      var height = this.data.height * 0.6 -36
      this.animation.translateY(height).step()
      this.setData({
        animationData: this.animation.export(),
      })
    },

    fadeIn: function () {
      this.animation.translateY(0).step()
      this.setData({
        animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
      })
    },

    commentInput: function(e) {
      this.setData({
        comment_content:e.detail.value
      })
    },

    reply: function(event) {
      // console.log(event)
      var reply_id = event.currentTarget.id
      this.setData({
        reply_id: reply_id,
        reply_nickname: "回复：" + this.data.comment_dict[reply_id].owner.nickname,
        focus: true
      })
    },
  
    deleteReply: function(event) {
      // console.log(event)
      var that = this
  
      var reply_id = event.currentTarget.id
      var reply = that.data.comment_dict[reply_id]
      console.log(reply)
  
      if (reply.owner.id != wx.getStorageSync('id')) return
      else if (reply.deleted == true) {
        wx.showToast({
          title: '该评论已删除',
          icon: 'none',
          duration: 1000
        })
        return
      }
  
      wx.showModal({
        content: '只能删除自己发表的评论哦',
        title: '是否确认删除该评论？',
        success: function(choose) {
          if (choose.confirm) {
            wx.request({
              url: utils.server_hostname + '/api/core/comments/' + reply_id + '/',
              method: "DELETE",
              header: {
                'content-type': 'application/json',
                'token-auth': wx.getStorageSync('token')
              },
              success: function(res) {
                console.log(res)
                // loginExpired?
                if (res.statusCode == 403) {
                  wx.showToast({
                    title: '不能删除别人的评论',
                    icon: 'none',
                    duration: 1000
                  })
                }
                else if (res.statusCode == 204) {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'none',
                    duration: 1000
                  })
  
                  that.setData({
                    comment_list:[],
                    comment_dict: {},
                    next_comments: "init"
                  })
                  that.getComments()
                }
              }
            })
          }
        }
      })
    },
  
    sendComment: function() {
      var that = this
      if (that.data.comment_content == '') {
        wx.showToast({
          title: '请输入评论内容',
          icon: 'error',
          duration: 1000
        })
        return
      }
  
      wx.showLoading({
        title: '发送中'
      })
  
      var data
      if (that.data.reply_id == '') data = { content: that.data.comment_content }
      else data = {
        content: that.data.comment_content,
        reply: that.data.reply_id
      }
      // console.log(data)
  
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: utils.server_hostname + '/api/core/sights/' + that.data.sightId + '/comment/',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        data: data,
        success: function(res) {
          // console.log(res)
          wx.hideLoading({
            success: (res) => {},
          })
  
          if (res.statusCode == 403 || res.data.error_code == 605) {
            utils.unLogin()
            return
          }
          //unlogin?
  
          if (res.statusCode == 201) {
            wx.showToast({
              title: '评论成功',
              duration: 1000
            })
            that.setData({
              comment_list:[],
              comment_dict: {},
              next_comments: "init"
            })
            that.getComments()
  
            wx.request({
              url: utils.server_hostname + '/api/core/travels/' + that.data.travel.id + '/',
              method: 'GET',
              header: {
                'content-type': 'application/json',
                'token-auth': token
              },
              success: function(res) {
                // console.log(res)
        
                var travel = res.data
                // console.log(travel)
  
                that.clearReply()
                that.setData({
                  comment_content: "",
                  comments: travel.comments
                })
              },
              fail: function(res) { console.log(res) }
            })
          }
        },
        fail: function(res) { console.log(res) }
      })
    },
  
    // 获取根评论及其回复
    getComments: function() {
      var that = this
      var url
      if (that.data.next_comments == "init") {
        url = utils.server_hostname + '/api/core/sights/' + that.data.sightId + '/comment/'
      } else {
        url = that.data.next_comments
      }
  
      if (url == null) return
  
      wx.request({
        url: url,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'token-auth': token,
        },
        success: function(res) {
          console.log(res)
          that.setData({
            next_comments: res.data.next
          })
  
          var list = res.data.results
          that.triggerEvent("numComment", list.length)
  
          for (var i in list) {
            var item = list[i]
            // console.log(item)
  
            item["time"] = item["time"].substring(0,10) + " " + item["time"].substring(11,16)
  
            var comment_dict = that.data.comment_dict
            // 在comment_dict中插入item，并添加reply_list字段
            item["reply_list"] = []
            comment_dict[item.id] = item
            // 在comment_list中插入item.id
            var comment_list = that.data.comment_list
            comment_list.push(item.id)
            that.setData({
              comment_dict: comment_dict,
              comment_list: comment_list
            })
            that.getReply(item.id,true)
          }
          
          // console.log(that.data)
        },
        fail: function(res) { console.log(res) }
      })
    },
  
    // 获取回复
    getReply: function(father_id,init=false) {
      var that = this
      var father = that.data.comment_dict[father_id]
      var url
      if (init) {
        url = utils.server_hostname + '/api/core/comments/' + father.id + '/responses/?direct=false'
      } else {
        url = father.next
      }
  
      if (url == null) return
  
      wx.request({
        url: url,
        method: 'GET',
        header: {
          'content-type': 'application/json',
        },
        success: function(res) {
          // console.log(res)
          
          father.next = res.data.next
  
          var list = res.data.results
          var comment_dict = that.data.comment_dict
          for (var i in list) {
            var item = list[i]
            // console.log(item)
            item["time"] = item["time"].substring(0,10) + " " + item["time"].substring(11,16)
  
            // 在comment_dict中father的reply_list字段插入item.id
            var reply_list = father["reply_list"]
            reply_list.push(item.id)
            father["reply_list"] = reply_list
            comment_dict[father_id] = father
            // 在comment_dict中插入item
            comment_dict[item.id] = item
          }
  
          that.setData({
            comment_dict: comment_dict
          })
          
          // console.log(that.data)
        },
        fail: function(res) { console.log(res) }
      })
    },
  
    moreReply: function(event) {
      // console.log(event)
      // console.log(this.data.comment_dict[event.currentTarget.id].next)
      this.getReply(event.currentTarget.id)
    },
  }
})
