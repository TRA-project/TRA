
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
    address: ''
  },

  OnReady: function(){
    this.setData({
      toView: 'chatContent-' + this.data.chatContent.length
    })
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
      inputValue: '我附近有哪些好玩的'
    })
    this.sendMessage();
  },

  query2: function() {
    this.setData({
      inputValue: '我附近的美食有哪些'
    })
    this.sendMessage();
  },

  query3: function() {
    this.setData ({
      inputValue: '当下季节适合去哪'
    })
    this.sendMessage();
  },

  sendMessage: function() {   // 点击发送按钮发送消息
    var outputValue = this.data.outputValue;
    var inputValue = this.data.inputValue;
    var address = this.data.address;
    var chatContent = this.data.chatContent;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
    
    console.log(chatContent.length)

    chatContent.push({
      id: 'chatContent-' + (chatContent.length + 1),
      message: inputValue,
      sender: 'user'
    });

    console.log(chatContent.length)

    this.setData({   // 更新数据
      chatContent: chatContent,
      inputValue: '',
      toView: 'chatContent-' + chatContent.length
    });

    console.log(this.data.toView)

    this.getLocation()

    var formData = {
      chat_id: this.data.chat_id,
      current_time: new Date().getTime(),
      // position: address,
      position: '',
      query: inputValue
    }

    console.log(formData)

    wx.showLoading({
      title: '作答中...'
      // customClass: 'custom-loading'
    })
    
    var that = this
    wx.request({
      url: util.server_hostname + "/chat",
      // url: "http://127.0.0.1:8000" + "/chat",
      method: 'POST',
      data: formData,
      header: {
        'content-type': 'application/json',
        "token-auth": token
      },
      success(res){
        if(res.statusCode == 200) {
          wx.hideLoading();
          console.log("get reponse:", res.data)
          var field = `${res.data}`
          // const arr = JSON.parse(`[${str.replace(/}\s*{/g, '},{')}]`);
          // const actionInputs = arr.filter(obj => obj.action_input).map(obj => obj.action_input);
          const arr = field.split("}").map(str => {
            if (str.startsWith("{")) {
                str = str + "}";
            } else if (str.endsWith("{")) {
                str = "{" + str;
            } else {
                str = "{" + str + "}";
            }
            return JSON.parse(str);
        });
        
        const actionInputs = arr.filter(obj => obj.action_input).map(obj => obj.action_input);
        const sentence = actionInputs.join(" ");
          console.log(sentence,'提取的str_test');

          that.setData({
            chat_id: res.data.chat_id
          })
          // outputValue = res.data.content,
          outputValue = sentence
          console.log("outputValue:",outputValue)
          chatContent.push({
            id: 'chatContent-' + (chatContent.length + 1),
            message: outputValue,
            sender: 'ai'
          })
          that.setData({
            chatContent: chatContent,
            toView: 'chatContent-' + chatContent.length
          })
        } else {
          wx.hideLoading();
          chatContent.push({
            id: 'chatContent-' + (chatContent.length + 1),
            message: "sorry",
            sender: 'ai'
          })
          that.setData({
            chatContent: chatContent,
            toView: 'chatContent-' + chatContent.length
          })
        }
      },
      fail(err){
        wx.hideLoading();
        console.log(err)
        chatContent.push({
          id: 'chatContent-' + (chatContent.length + 1),
          message: "error",
          sender: 'ai'
        })
        that.setData({
          chatContent: chatContent,
          toView: 'chatContent-' + chatContent.length
        })
      }
    });
    
    this.setData({   // 更新数据
      chatContent: chatContent,
      inputValue: '',
      toView: 'chatContent-' + chatContent.length
    });
  },

  onUnload(){
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');

    // console.log("unload")
    wx.request({
      url: util.server_hostname + '/del_chat',
      // url: 'http://127.0.0.1:8000/del_chat',
      method: 'POST',
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
  }
})