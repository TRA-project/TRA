const util = require("../../utils/util");
const { server_hostname } = require("../../utils/util");

Page({
  data: {
    inputValue: '',  // 输入的内容
    chat_id: '',
    outputValue: '', // ai输出的内容 
    chatContent: [],
    toView: '',
    query1: '附近有哪些好玩的',
    query2: '推荐一些附近的美食',
    query3: '当下季节适合去哪',
    hidden: false,
    animation: {}, // 初始动画为空
    imageUrl: '../../images/up.png',
    showMask: true,
    height: '400',
    marginTop: '400'
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
    }else {
      // 显示卡片
      animation.height('auto').opacity(1).step();
      var imageUrl = '../../images/up.png'
      var height =  '400';
      var marginTop = '400';
    }
    // 更新卡片状态和动画
    that.setData({
      hidden: hidden,
      animation: animation.export(),
      imageUrl: imageUrl,
      showMask: showMask,
      height : height,
      marginTop : marginTop
    })
  },

  getLocation: function(){
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        wx.request({
          url: 'https://api.map.baidu.com/reverse_geocoding/v3/',
          data: {
            ak: 'Your Baidu Map API Key',
            location: latitude + ',' + longitude,
            output: 'json',
            coordtype: 'wgs84ll',
            pois: 0
          },
          success: function(res) {
            console.log(res.data.result.formatted_address);
          },
          fail: function(res) {
            console.log('逆地址解析失败', res);
          }
        })
      },
      fail: function(res) {
        console.log('获取位置失败', res);
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
      inputValue: '附近有哪些好玩的'
    })
    this.sendMessage();
  },

  query2: function() {
    this.setData({
      inputValue: '推荐一些附近的美食'
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
    var chatContent = this.data.chatContent;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
    
    chatContent.push({
      message: inputValue,
      sender: 'user'
    });

    console.log(new Date().getTime());
    console.log(this.getLocation());

    var formData = {
      chat_id: this.data.chat_id,
      current_time: new Date().getTime(),
      position: this.getLocation(),
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
          that.setData({
            chat_id: res.data.chat_id
          })
          outputValue = res.data.content,
          console.log("outputValue:",outputValue)
          chatContent.push({
            message: outputValue,
            sender: 'ai'
          })
          that.setData({
            chatContent: chatContent
          })
        } else {
          wx.hideLoading();
          that.setData({
            outputValue: "error"
          })
          chatContent.push({
            message: outputValue,
            sender: 'ai'
          })
        }
      },
      fail(err){
        console.log(err)
        that.setData({
          outputValue : 'sorry'
        })
      }
    });

    this.setData({   // 更新数据
      chatContent: chatContent,
      inputValue: '',
      toView: 'chatContent-' + (chatContent.length - 1)
    });
  },

  onUnload(){
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
    // console.log("unload")
    wx.request({
      url: util.server_hostname + '/del_chat',
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
  }
})