// pages/sceneryShow/sceneryShow.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 以下是景点方面的数据
        curImage: 0,
        images: ["../../images/guozhibeiyuan.jpg", "../../images/logo.png"],
        name: "国家植物馆北园",
        remark: "4.8",
        intro: "国家植物园包括南园（中国科学院植物研究所）和北园（北京市植物园）两个园区。南园建有15个特色专类园，拥有展览温室、康熙御碑等人文景观和菩提树等国礼植物，有亚洲最大的植物标本馆、中国古植物馆等 ...",
        position: "海淀区香山路",
        distance: "3",
        open_time: "3月16号~11月15号 9：00到18：00",
        "price": [
            {
              "name": "成人票",
              "price": "5"
            },
            {
              "name": "学生票",
              "price": "2.5"
            }
          ],
        // 需要对景点数据进行预处理，当长度超过某个值时，将其截断
        "inner_spot": [
          {
            "name": "曹雪芹纪念馆",
            "summary": "这是曹雪芹纪念馆"
          },
          {
            "name": "卧佛寺",
            "summary": "commodo tempor mollit veniam"
          },
          {
            "name": "蜜蜂博物馆",
            "summary": "aute consectetur commodo exercitation"
          },
          {
            "name": "植物园温室",
            "summary": "consequat exercitation est"
          },
          {
            "name": "樱桃沟",
            "summary": "reprehenderit"
          }
        ],

        
        // 以下是弹窗部分的数据
        showDialog: false,
        editText: "",
        dialogTitle: "",
        dialogMode: "intro", // 标识当前弹窗编辑的类型

        // 添加内部游览点的数据
        add_elm: false,
        editSpotName: "",
        editSpotIntro: "",

        hideComment: true,
    },

    // 随着滑动顶部图片，自动更新图片所在的序号
    onSwiperChange(e) {
        console.log(e.detail.current);
        this.setData({
            curImage: e.detail.current
        })
    },

    onAddSpot(e) {
      this.setData({
        add_elm: !this.data.add_elm
      })
    },

    onEditIntro(e) {
      this.setData({
        showDialog: true,
        dialogTitle: "编辑景点介绍",
        editText: this.data.intro,
        dialogMode: "intro"
      })
    },

    onEditTime(e) {
      this.setData({
        showDialog: true,
        dialogTitle: "编辑开放时间",
        editText: this.data.open_time,
        dialogMode: "open_time"
      })
    },

    onClose(e) {
      this.setData({
        showDialog: false,
      })
    },

    onConfirm(e) {
      this.setData({
        showDialog: false,
      })
      console.log("confirm")
    },

    // 确认添加某个游览点
    onConfirmSpot(e) {
      this.setData({
        editSpotName: "",
        editSpotIntro: "",
        add_elm: false
      })
    },

    onExitSpot(e) {
      this.setData({
        editSpotName: "",
        editSpotIntro: "",
        add_elm: false
      })
    },

    onComment(e) {
      this.setData({
        hideComment: false,
      })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})