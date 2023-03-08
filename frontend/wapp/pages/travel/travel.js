const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,

    server_hostname: utils.server_hostname,
    server_imagename: utils.server_imagename,

    author: {
      id: "",
      nickname:"",
      icon: utils.server_imagename + '/male.png',
      cities: "",
      travels: ""
    },
    subscribed:false,
    isMine:false,
    
    travel: {
      id: "",
      images: [],
      position:{
        city:"",
        name:""
      },
      title:"",
      content:"",
      time:"",
      forbidden: 0,
      tagset: []
    },
    liked: false,
    likes: 0,
    comments: 0,

    next_comments:"init",
    comment_content:"",
    reply_id:"",
    reply_nickname:"发表评论",
    focus:"",

    travel_ids:[],
    travel_covers:[],
    travel_names:[],
    travel_titles:[],
    travel_ownerids:[],
    travel_icons:[],
    travel_nicknames:[],
    travel_liked:[],
    travel_liked_now:[],
    travel_likes:[],
    travel_cities:[],
    travel_travels:[],
    travel_tags:[],

    comment_list:[],
    comment_dict:{},
    
    height: 0,
    hideModal: true, //模态框的状态 true-隐藏 false-显示
    animationData: {},
    schedule:null,
    schdata:null,

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
      url: utils.server_hostname + '/api/core/travels/' + that.data.travel.id + '/comments/',
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
      url = utils.server_hostname + '/api/core/travels/' + that.data.travel.id + '/comments/?direct=true'
    } else {
      url = that.data.next_comments
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
        that.setData({
          next_comments: res.data.next
        })

        var list = res.data.results

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

  // 获取相关推荐
  getRelative: function() {
    var that = this

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + '/api/core/travels/' + that.data.travel.id + '/similar/',
      data: {
      },
      method: 'GET',
      header: {
      'content-type': 'application/json',
      'token-auth': token
      },
      success: function(res) {
        // console.log(res);

        var travellist = res.data.data
        // console.log(travellist)

        var travel_ids = that.data.travel_ids
        var travel_covers = that.data.travel_covers
        var travel_names = that.data.travel_names
        var travel_titles = that.data.travel_titles
        var travel_ownerids = that.data.travel_ownerids
        var travel_icons = that.data.travel_icons
        var travel_nicknames = that.data.travel_nicknames
        var travel_likes = that.data.travel_likes
        var travel_cities = that.data.travel_cities
        var travel_travels = that.data.travel_travels
        var travel_liked = that.data.travel_liked
        var travel_liked_now = that.data.travel_liked_now

        var travel_tags = that.data.travel_tags

        for (var i in travellist) {
          var travel = travellist[i]
          // console.log(travel)
          if (travel.forbidden == 1) continue

          var icon
          if (travel.owner.icon == null) icon = utils.server_imagename + "/male.png"
          else icon = utils.server_hostname + "/api/core/images/" + travel.owner.icon + "/data/"

          var cover
          if (travel.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
          else cover = utils.server_hostname + "/api/core/images/" + travel.cover + "/data/"
      
          travel_ids.push(travel.id)
          travel_covers.push(cover)
          if (travel.position == null) travel_names.push('')
          else travel_names.push(travel.position.name)
          
          if (travel.title.length > 9) travel_titles.push(travel.title.substring(0,9) + '...')
          else travel_titles.push(travel.title)

          if (travel.tag.length >= 3) {
            var limit_tag = travel.tag.slice(0,3)
            travel_tags.push(limit_tag)
        } else if (travel.tag.length == 0){
            var blank_tag = ['Travel']
            travel_tags.push(blank_tag)
        } else {
            travel_tags.push(travel.tag)
        }

          travel_ownerids.push(travel.owner.id)
          travel_icons.push(icon)
          travel_nicknames.push(travel.owner.nickname)
          travel_likes.push(travel.likes)
          travel_cities.push(travel.owner.cities)
          travel_travels.push(travel.owner.travels)
          travel_liked.push(travel.liked)
          travel_liked_now.push(travel.liked)
        }

        that.setData({
          travel_ids: travel_ids,
          travel_covers:travel_covers,
          travel_names:travel_names,
          travel_titles:travel_titles,
          travel_ownerids:travel_ownerids,
          travel_icons:travel_icons,
          travel_nicknames:travel_nicknames,
          travel_likes:travel_likes,
          travel_cities:travel_cities,
          travel_liked:travel_liked,
          travel_liked_now:travel_liked_now,
          travel_tags: travel_tags
        })

        // console.log(that.data)
      },
      fail: function(res) { console.log(res); }
    })
  },

  onShow: function() {
    var that = this
    that.setData({
      isMine:(that.data.author.id == parseInt(wx.getStorageSync('id')))
    })

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + "/api/core/users/" + this.data.author.id + "/",
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      success:function(res) {
        var data = res.data
        that.setData({
          subscribed: data.subscribed
        })
      },
      fail: function(res) { console.log(err); }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:show
    })

    // console.log(options)
    var that = this
    wx.getSystemInfo({
      success: (res) => {
        var height = res.screenHeight
        that.setData({
          height: height
        })
      },
    })

    that.setData({
      author: {
        id: options.author_id,
        nickname: options.author_nickname,
        icon: options.author_icon,
        cities: options.author_cities,
        travels: options.author_travels
      },
      isMine:(options.author_id == parseInt(wx.getStorageSync('id')))
    })

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

    wx.request({
      url: utils.server_hostname + "/api/core/users/" + this.data.author.id + "/",
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },

      success:function(res) {
        var data = res.data
        that.setData({
          subscribed: data.subscribed
        })
      },

      fail: function(res) { console.log(err); }
    })

    wx.request({
      url: utils.server_hostname + '/api/core/travels/' + options.travel_id + '/',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      success: function(res) {
         console.log(res)

        var travel = res.data
         console.log(travel.tag)
        var images = []
        if (travel.cover != null) {
          images.push(utils.server_hostname + "/api/core/images/" + travel.cover + "/data/")
        }
        else {
          images.push(utils.server_imagename + "/travelRecordCover/1.jpg")
        }
        for (var i in travel.images) {
          images.push(utils.server_hostname + "/api/core/images/" + travel.images[i] + "/data/")
        }
        that.setData({
          travel: {
            id: travel.id,
            images: images,
            position: (travel.position == null)? that.data.position : travel.position,
            title: travel.title,
            content: travel.content,
            time: travel.time.substring(0, 10) + ' ' + travel.time.substring(11, 16),
            forbidden: (travel.visibility == 1)? 1 : travel.forbidden,
            tagset: travel.tag
          },
          liked:travel.liked,
          likes: travel.likes,
          comments: travel.comments,
          schedule: travel.schedule
        })
        console.log('forbidden',that.data.travel.forbidden)
        console.log(that.data.schedule)
        if (that.data.schedule != null) {
          let schtmp={};
          let schlist=[];
          schtmp.date=that.data.schedule.date;
          console.log(that.data.schedule.schedule_items)
          let len = that.data.schedule.schedule_items.length;
          for (let i = 0;i<len;i++) {
            let tmp ={};
            tmp.time = that.data.schedule.schedule_items[i].start_time + '~'+ that.data.schedule.schedule_items[i].end_time;
            tmp.content = that.data.schedule.schedule_items[i].content;
            schlist.push(tmp);
          }
          schtmp.items = schlist;
          that.setData({
            schdata : schtmp
          })
        }
        console.log("schdata")
        console.log(that.data.schdata)
        if (travel.forbidden == 1) {
          that.setData({
            next_comments: null,
            comments: 0
          })
          return
        }
        that.getComments()
        that.getRelative()
        // console.log(that.data)
      },
      fail: function(res) { console.log(res) }
    })
  },

  navigate2schrelease: function() {
    console.log('on click schrelease')
    console.log('on click schrelease'+this.data.travel.id);
    wx.navigateTo({
      url: '/pages/schRelease/schRelease?option=1&travelid='+this.data.travel.id,
    })
  },

  navigate2Tagsearch: function (e) {
      console.log('on click', e.currentTarget.dataset)
      var inputvalue = '#' + e.currentTarget.dataset.tagname + '#'
      wx.navigateTo({
        url: '/pages/SearchResult/SearchResult?value=' + inputvalue,
      })
  },

  navigate2footprint: function() {
    var author = this.data.author
    utils.navigate2footprint(author.id, author.nickname, author.icon, author.cities, author.travels)
  },

  navigate2OtherZone: function() {
    wx.navigateTo({
      url: '/pages/OtherZone/OtherZone?id=' + this.data.author.id,
    })
  },

  navigate2Replyer: function(event) {
    // console.log(event)
    wx.navigateTo({
      url: '/pages/OtherZone/OtherZone?id=' + event.currentTarget.id,
    })
  },

  navigate2Travel: function(event) {
    // console.log(event)
    var data = this.data
    var index = parseInt(event.currentTarget.id)
    var travel_id = data.travel_ids[index]
    var author_id = data.travel_ownerids[index]
    var author_icon = data.travel_icons[index]
    var author_nickname = data.travel_nicknames[index]
    var author_cities = data.travel_cities[index]
    var author_travels = data.travel_travels[index]
    utils.navigate2Travel(travel_id, author_id, author_icon, author_nickname, author_cities, author_travels)
  },

  subscribe: function(e) {
    var that = this
    var data = {
      id: that.data.author.id,
      cancel: false
    }

    if (that.data.isMine) {
      wx.showToast({
        title: '无法关注自己',
        duration: 1000,
        icon:'error'
      })
    }
    else{
      wx.showLoading({
        title: '加载中'
      })

      wx.request({
        url: utils.server_hostname + '/api/core/users/subscribe/',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'token-auth': wx.getStorageSync('token')
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
  
          if (res.statusCode == 200) {
            wx.showToast({
              title: '关注成功',
              duration: 1000
            })
            that.setData({
              subscribed: true
            })
          }
        },
        fail: function(res) { console.log(res) }
      })
    }
  },

  disSubscribe: function() { 
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      id: that.data.author.id,
      cancel: true
    }
    wx.request({
      url: utils.server_hostname + '/api/core/users/subscribe/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': wx.getStorageSync('token')
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

        if (res.statusCode == 200) {
          wx.showToast({
            title: '取消关注成功',
            duration: 1000
          })
          that.setData({
            subscribed: false
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  thumbsUp: function() { 
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      cancel: false
    }

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    // console.log(token)
    wx.request({
      url: utils.server_hostname + '/api/core/travels/' + that.data.travel.id + '/like/',
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

        if (res.statusCode == 200) {
          wx.showToast({
            title: '点赞成功',
            duration: 1000
          })
          that.setData({
            liked:true
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  disThumbsUp: function() { 
    wx.showLoading({
        title: '加载中'
      })

    var that = this
    var data = {
      cancel: true
    }

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + '/api/core/travels/' + that.data.travel.id + '/like/',
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

        if (res.statusCode == 200) {
          wx.showToast({
            title: '点赞已取消',
            duration: 1000
          })
          that.setData({
            liked:false
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  thumbsUpRelative: function(res) { 
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      cancel: false
    }
    var index = res.currentTarget.id
    var liked = !that.data.travel_liked_now[index]
    var liked_edit = 'travel_liked_now['+index+']'

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + '/api/core/travels/' + that.data.travel_ids[index] + '/like/',
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
          wx.showToast({
            title: '登陆后才能点赞哦',
            icon: 'none',
            duration: 1000
          })
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          that.setData({
            [liked_edit]:liked
          })

          wx.showToast({
            title: '点赞成功',
            duration: 1000
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  disThumbsUpRelative: function(res) { 
    wx.showLoading({
        title: '加载中'
      })

    var that = this
    var data = {
      cancel: true
    }
    var index = res.currentTarget.id
    var liked = !that.data.travel_liked_now[index]
    var liked_edit = 'travel_liked_now['+index+']'

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + '/api/core/travels/' + that.data.travel_ids[index] + '/like/',
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
          wx.showToast({
            title: '登陆后才能取消点赞哦',
            icon: 'none',
            duration: 1000
          })
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          that.setData({
            [liked_edit]:liked
          })

          wx.showToast({
            title: '点赞已取消',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
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

// 隐藏遮罩层
hideModal: function () {
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

//动画集
fadeIn: function () {
  this.animation.translateY(0).step()
  this.setData({
    animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
  })
},

fadeDown: function () {
  var height = this.data.height * 0.6 -36
  this.animation.translateY(height).step()
  this.setData({
    animationData: this.animation.export(),
  })
},


  commentInput: function(e) {
    this.setData({
      comment_content:e.detail.value
    })
  },

  clearReply: function() {
    this.setData({
      reply_id: "",
      reply_nickname: "发表评论"
    })
  },

  catchtouchmove: function() { },

  onShareAppMessage: function (res) {
    var id = this.data.travel.id
    var author = this.data.author
    var imageUrl = this.data.travel.images[0]
    var url = '/pages/travel/travel?'
    url = url + "travel_id=" + id
    url = url + "&" + "author_id=" + author.id
    url = url + "&" + "author_icon=" + author.icon
    url = url + "&" + "author_nickname=" + author.nickname
    url = url + "&" + "author_cities=" + author.cities
    url = url + "&" + "author_travels=" + author.travels
    console.log(url)
    return {
      title: 'Tripal: Find a Nice Trip',
      path: url,
      imageUrl: imageUrl
    }
  },

  preview: function(event) {
    wx.previewImage({
      current: event.currentTarget.id,
      urls: this.data.travel.images
    })
  },

  onPullDownRefresh: function () {
    var data = this.data
    var url = '/pages/travel/travel?'
    url = url + "travel_id=" + data.travel.id
    url = url + "&" + "author_id=" + data.author.id
    url = url + "&" + "author_icon=" + data.author.icon
    url = url + "&" + "author_nickname=" + data.author.nickname
    url = url + "&" + "author_cities=" + data.author.cities
    url = url + "&" + "author_travels=" + data.author.travels
    wx.redirectTo({
      url: url,
    })
  }
})