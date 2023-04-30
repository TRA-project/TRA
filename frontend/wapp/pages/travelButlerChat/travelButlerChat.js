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
    query3: '当下季节适合去哪'
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

    var formData = {
      chat_id: this.data.chat_id,
      current_time: new Date().getTime(),
      position: "",
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