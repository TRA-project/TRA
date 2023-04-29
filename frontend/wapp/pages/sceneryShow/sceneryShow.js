const util = require("../../utils/util");
const token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast.js';

// pages/sceneryShow/sceneryShow.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 以下是景点方面的数据
        id: 0,
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
        inner_sights: [
          {
            "name": "曹雪芹纪念馆",
            "desc": "这是曹雪芹纪念馆"
          },
          {
            "name": "卧佛寺",
            "desc": "commodo tempor mollit veniam"
          },
          {
            "name": "蜜蜂博物馆",
            "desc": "aute consectetur commodo exercitation"
          },
          {
            "name": "植物园温室",
            "desc": "consequat exercitation est"
          },
          {
            "name": "樱桃沟",
            "desc": "reprehenderit"
          }
        ],
        isCollect: false,

        
        // 以下是弹窗部分的数据
        showDialog: false,
        editText: "",
        dialogTitle: "",
        dialogMode: "intro", // 标识当前弹窗编辑的类型

        // 添加内部游览点的数据
        add_elm: false,
        editSpotName: "",
        editSpotIntro: "",
        
        // 评论相关的数据
        hideComment: true,
        numComment: 23,
        focusAddElm: false,

        // 用户当前的位置
        latitude: "",
        longitude: ""
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
      if (this.data.add_elm) {
        wx.pageScrollTo({
          selector: ".newelm",
          duration: 300,
        })
        this.setData({
          focusAddElm: true,
        })
      }
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
      let data
      if (this.dialogMode === "intro") {
        data = {"desc": this.data.editText}
      } else {
        data = {"desc": this.data.open_time}
      }
      wx.request({
        url: util.server_hostname + "/api/core/sights/" + this.data.id + "/edit",
        method: "POST",
        data: data,
        success(res) {
          Toast("编辑成功，待审核")
        },
        fail(res) {
          Toast.fail(`提交修改失败！${res}`)
        }
      })
    },

    // 确认添加某个游览点
    onConfirmSpot(e) {
      let data = [{name: this.data.editSpotName, desc: this.data.editSpotIntro}]
      this.setData({
        editSpotName: "",
        editSpotIntro: "",
        add_elm: false
      })
      wx.request({
        url: util.server_hostname + "/api/core/sights/" + this.data.id + "/edit",
        method: "POST",
        data: data,
        success(res) {
          Toast("推荐游览点成功，待审核")
        },
        fail(res) {
          Toast.fail(`提交修改失败！${res}`)
        }
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

    update_numComment(e) {
      this.setData({
        numComment: e.detail
      })
    },

    onCollect(e) {
      if (this.data.isCollect === false) {
        wx.request({
          url: util.server_hostname + "/api/core/users/collect_sight/",
          method: "POST",
          data: {
            id: this.data.id,
          },
          header: {
            "token-auth": token
          },
          success: res => {
            if (res.data.error_code === 200) {
              this.setData({
                isCollect: true,
              })
            }
          }
        })
      } else {
        wx.request({
          url: util.server_hostname + "/api/core/users/collect_sight/",
          method: "DELETE",
          data: {
            id: this.data.id,
          },
          header: {
            "token-auth": token
          },
          success: res => {
            if (res.data.error_code === 200) {
              this.setData({
                isCollect: false,
              })
            }
          }
        })
      }
    },

    getLoc (callback) {
      let that = this
      wx.getLocation({
        type: 'wgs84',
        isHighAccuracy: true,
        success (res) {
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude
          })
          callback()
        },
        fail (res) {
          console.log(`获取位置信息失败：${res}`)
        }
      })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      console.log("选项:", options);
      let sightId = options.scenery_id;
      this.setData({
        id: sightId
      })
      wx.request({
        url: util.server_hostname + "/api/core/sights/" + sightId + "/",
        header: {
          'token-auth': token
        },
        success: (res) => {
          console.log(res.data)
          let data = res.data
          this.getLoc(() => {
            let dist = util.GetDistance(data.address.latitude, data.address.longitude, this.data.latitude, this.data.longitude)
            this.setData({
              distance: Number(dist).toFixed(2)
            })
          })
          this.setData({
            id: data.id,
            images: data.images,
            name: data.name,
            remark: data.grade,
            intro: data.desc,
            position: data.address.name,
            open_time: data.open_time,
            price: data.prices,
            inner_sights: data.inner_sights,
            isCollect: data.collected
          })
        },
        fail: (err) => {
          Toast.fail("加载失败");
          console.log(`${err.errMsg}, ${err.errno}`)
        }
      })
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