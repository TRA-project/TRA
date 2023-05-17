
// const { decode } = require("XrFrame/core/utils");
const util = require("../../utils/util");
const { server_hostname } = require("../../utils/util");

Page({
  data: {
    inputValue: '',  // 输入的内容
    chat_id: '',
    outputValue: '', // ai输出的内容 
    chatContent: [],
    toView: '',
    query1: '我附近有哪些好玩的',
    query2: '我附近的美食有哪些',
    query3: '当下季节适合去哪',
    hidden: false,
    animation: {}, // 初始动画为空
    imageUrl: '../../images/up.png',
    showMask: true,
    height: '400',
    marginTop: '400',
    scrollHeight: '700',
    latitude: '',   // 当前位置的纬度
    longitude: '', // 当前位置的精度
    address: '',
    socket: null,
    isOperationAllowed: true,
    showDialoge: false
  },

  onReady: function(){
    this.setData({
      toView: 'chatContent-' + this.data.chatContent.length
    })
  },

  onLoad() {
    
  },

  toggleCard: function(){
    var that = this;
    var hidden = !that.data.hidden;  // 切换卡片状态
    var showMask = !that.data.showMask; // 关闭蒙层
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    if(hidden){
      // 隐藏卡片
      animation.height(0).opacity(0).step();
      var imageUrl = '../../images/down.png';
      var height =  '130';
      var marginTop = '130';
      var scrollHeight = '970'
    }else {
      // 显示卡片
      animation.height('auto').opacity(1).step();
      var imageUrl = '../../images/up.png'
      var height =  '400';
      var marginTop = '400';
      var scrollHeight = '700'
    }
    // 更新卡片状态和动画
    that.setData({
      hidden: hidden,
      animation: animation.export(),
      imageUrl: imageUrl,
      showMask: showMask,
      height : height,
      marginTop : marginTop,
      scrollHeight: scrollHeight
    })
  },

  getLocation: function (callback){
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
     let that = this
     wx.getLocation({
       type: 'wgs84',  // GPS坐标
       isHighAccuracy: true,   // 高精度
       success (res) {
         that.setData({
           latitude: res.latitude,   // 纬度
           longitude: res.longitude  // 经度
         })
          wx.request({
            url:'https://apis.map.qq.com/ws/geocoder/v1/?location='+ res.latitude + ',' + res.longitude + '&key=BLPBZ-OJ5KW-FIYR3-3U5PS-HENY2-TAFOT',
            method: 'GET',
            data: {
              location: res.latitude + ',' + res.longitude,
              key: 'BLPBZ-OJ5KW-FIYR3-3U5PS-HENY2-TAFOT'
            },
            header: {
              'content-type': 'application/json',
              "token-auth": token
            },
            success(res){
                console.log(res.data)
                that.setData({
                  address: res.data.address
                })
            },
            fail(res){
                console.log(res.data)
            }
          })
         },
       fail (res) {
         console.log(`获取位置信息失败：${res}`)
       }
      })
  },

  onInput: function(event) {   // 输入之后将输入值更新到inputValue里
    this.setData({
      inputValue: event.detail.value,
    });
  },

  query1: function() {
    this.setData ({
      inputValue: this.data.query1
    })
    this.sendMessage();
  },

  query2: function() {
    this.setData({
      inputValue: this.data.query2
    })
    this.sendMessage();
  },

  query3: function() {
    this.setData ({
      inputValue: this.data.query3
    })
    this.sendMessage();
  },

  sendMessage: function() {   // 点击发送按钮发送消息
    var outputValue = this.data.outputValue;
    var inputValue = this.data.inputValue;
    var address = this.data.address;
    var chatContent = this.data.chatContent;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');

    // 等待一分钟后发送消息
    if (!this.data.isOperationAllowed) {
      // 如果操作不允许，则显示弹窗
      this.setData({
        showDialog: true
      });
      return;
    }

    // 将操作状态设为不允许
    this.setData({
      isOperationAllowed: false
    });

    // 等待1分钟后重新允许操作
    setTimeout(() => {
      this.setData({
        isOperationAllowed: true
      });
    }, 60000); // 1分钟等于60000毫秒

    // 显示用户输入
    chatContent.push({
      id: 'chatContent-' + (chatContent.length + 1),
      message: inputValue,
      sender: 'user'
    });
    // console.log(chatContent.length)

    this.setData({   // 更新数据
      chatContent: chatContent,
      inputValue: '',
      toView: 'chatContent-' + chatContent.length
    });
    // console.log(this.data.toView)
    
    this.getLocation()

    var formData = {
      chat_id: this.data.chat_id,
      current_time: new Date().getTime(),
      // position: address,
      position: '北京航空航天大学',
      query: inputValue
    }

    console.log(formData)

    wx.showLoading({
      title: '作答中...'
      // customClass: 'custom-loading'
    })
    

    // 创建 WebSocket 连接
    this.data.socket = wx.connectSocket({
      url: 'ws://8.130.84.81/chat' // WebSocket 服务器地址
    });

    // 监听 WebSocket 连接成功事件
    wx.onSocketOpen(() => {
      console.log('WebSocket 连接已打开');
      // 发送数据到后端
      const data = {
        chat_id: this.data.chat_id,
        current_time: '',
        position: '北京航空航天大学',
        query: this.data.inputValue
      };
      this.data.socket.send({
        data: JSON.stringify(data)
      });
    });

    let question_count = 1; 
    chatContent.push({
      id: 'chatContent-' + (chatContent.length + 1),
      message: '',
      sender: 'ai'
    });
    const finalAnswer = this.data.chatContent[chatContent.length - 1];
    // 监听 WebSocket 接收到消息事件
    var that = this;
    wx.onSocketMessage((res) => {
      
      const utf8Data = res.data;
      const obj = JSON.parse(utf8Data);
      console.log(obj);
      
      // 将消息添加到页面数据中，实现流式输出
      if(obj.action == "Final Answer") {
        wx.hideLoading();
        const token = obj.action_input;
        finalAnswer.message += token; 
        that.setData({
          chatContent: chatContent,
          toView: 'chatContent-' + chatContent.length
        })
      } else if(obj.action == "New Question"){
        wx.hideLoading();
        if(question_count >= 3)  {
          question_count = question_count - 3;
        } else if (question_count == 1) {
          that.setData({
            query1: obj.action_input
          })
          question_count = question_count + 1;
        } else if (question_count == 2) {
          that.setData({
            query2: obj.action_input
          })
          question_count = question_count + 1;
        } else if (question_count == 3) {
          that.setData({
            query3: obj.action_input
          })
          question_count = question_count + 1;
        }
      } else if(obj.action == 'chat_id'){
        that.setData({
          chat_id: obj.action_input
        })
      } else {
        // 步骤
      }
    });

    // 监听 WebSocket 错误事件
    wx.onSocketError((error) => {
      console.error('WebSocket 错误:', error);
    });

    // 监听 WebSocket 连接关闭事件
    wx.onSocketClose(() => {
      console.log('WebSocket 连接已关闭');
    });

    // 更新数据
    this.setData({   
      chatContent: chatContent,
      inputValue: '',
      toView: 'chatContent-' + chatContent.length
    });
  },

  confirmDialog: function() {
    // 用户点击弹窗的确认按钮时触发的事件
    this.setData({
      showDialog: false
    });
  },

  onUnload(){
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');

    // console.log("unload")
    wx.request({
      url: util.server_hostname + '/chat',
      // url: 'http://127.0.0.1:8000/del_chat',
      method: 'DELETE',
      data: {
        chat_id: this.data.chat_id
      },
      header: {
        'content-type': 'application/json',
        "token-auth": token
      },
      success(res) {
        this.setData({
          chat_id: ''
        })
      }
    })
  },

  goWeather: function() {
    wx.navigateTo({
      url: '../weather/weather'
    })
  },

  // 关闭 WebSocket 连接
  closeConnection() {
    wx.closeSocket();
  }
})