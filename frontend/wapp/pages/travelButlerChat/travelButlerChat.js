// pages/travelButlerChat/travelButlerChat.js
Page({
  data: {
    inputValue: '',  // 输入的内容
    outputValue: 'sorry', // ai输出的内容
    chatContent: [], 
    toView: ''  // 每次都滚动到最底部
  },

  onInput: function(event) {   // 输入之后将输入值更新到inputValue里
    this.setData({
      inputValue: event.detail.value
    });
  },

  sendMessage: function() {   // 点击发送按钮发送消息
    var inputValue = this.data.inputValue;
    var outputValue = this.data.outputValue;
    var chatContent = this.data.chatContent;
    chatContent.push({
      message: inputValue,
      sender: 'user'
    });
    chatContent.push({
      message: outputValue,
      sender: 'ai'
    });
    this.setData({   // 更新数据
      chatContent: chatContent,
      inputValue: '',
      toView: 'chat-view-' + (chatContent.length - 1)
    });
  }
})