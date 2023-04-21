// pages/travelButlerChat/travelButlerChat.js
Page({
  data: {
    messages: [], // 聊天消息列表
    inputValue: '', // 发送消息表单的输入值
    toView: '' // 滚动到聊天消息列表的最底部
  },
  // 发送消息表单输入事件
  inputMessage: function(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  // 发送消息表单提交事件
  sendMessage: function(e) {
    // 获取发送的消息内容
    let content = e.detail.value.content
    if (content) {
      // 添加消息到聊天消息列表
      let messages = this.data.messages
      messages.push({ content: content, isMe: true })
      this.setData({
        messages: messages,
        inputValue: '',
        toView: 'bottom'
      })
    }
  }
})