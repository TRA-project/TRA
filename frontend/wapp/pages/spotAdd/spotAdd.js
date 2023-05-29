// pages/spotAdd/spotAdd.js
const util = require("../../utils/util");
const { server_hostname } = require("../../utils/util");

Page({
      data: {
        pickerHidden: true,
        chosen: '',
        imgs: [],   // 景点图片
        spots: [],  // 景点游览点
        count: 3,
        spotnameInput: '',
        spotaddrInput: '',
        address: {
          name:'',
          longitude:'',
          latitude:''          
        },
        spotdescInput: '',
        spotopentimeInput: '',
        spotplaytimeInput: '',
        prices : {
          name:'',
          price:''
        },
        spottypeInput: ''
      },

      spotnameInput: function(e) {
        this.setData({
          spotnameInput: e.detail.value,
        })
      },

      spotaddrInput: function(e) {
        this.setData({
          'address.name': e.detail.value,
        })
      },

      spotdescInput: function(e) {
        this.setData({
          spotdescInput: e.detail.value
        })
      },

      spotopentimeInput: function(e) {
        this.setData({
          spotopentimeInput: e.detail.value
        })
      },

      spotplaytimeInput: function(e) {
        this.setData({
          spotplaytimeInput: e.detail.value
        })
      },

      spottickettypeInput: function(e) {
        this.setData({
          'prices.name': e.detail.value
        })
      },

      spotticketInput: function(e) {
        this.setData({
          'prices.type': e.detail.value
        })
      },

      spottypeInput: function(e) {
        this.setData({
          spottypeInput: e.detail.value
        })
      },

    /**
     * 页面的初始数据
     */
    // onShareAppMessage() {
    //   return {
    //     title: 'form',
    //     path: 'page/component/pages/form/form'
    //   }
    // },

      // bindUpload: function (e) {
      //   switch (this.data.imgs.length) {
      //     case 0:
      //       this.data.count = 3
      //       break
      //     case 1:
      //       this.data.count = 2
      //       break
      //     case 2:
      //       this.data.count = 1
      //       break
      //   }
      //   var that = this
      //   wx.chooseImage({
      //     count: that.data.count, // 默认3
      //     sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
      //     sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
      //     success: function (res) {
      //       // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      //       var tempFilePaths = res.tempFilePaths
      //       for (var i = 0; i < tempFilePaths.length; i++) {
      //         wx.uploadFile({
      //           url: 'https://graph.baidu.com/upload',
      //           filePath: tempFilePaths[i],
      //           name: "file",
      //           header: {
      //             "content-type": "multipart/form-data"
      //           },
      //           success: function (res) {
      //             if (res.statusCode == 200) {
      //               wx.showToast({
      //                 title: "上传成功",
      //                 icon: "none",
      //                 duration: 1500
      //               })
      
      //               that.data.imgs.push(JSON.parse(res.data).data)
      
      //               that.setData({
      //                 imgs: that.data.imgs
      //               })
      //             }
      //           },
      //           fail: function (err) {
      //             wx.showToast({
      //               title: "上传失败",
      //               icon: "none",
      //               duration: 2000
      //             })
      //           },
      //           complete: function (result) {
      //             console.log(result.errMsg)
      //           }
      //         })
      //       }
      //     }
      //   })
      // },
      // 删除图片
      // deleteImg: function (e) {
      //   var that = this
      //   wx.showModal({
      //     title: "提示",
      //     content: "是否删除",
      //     success: function (res) {
      //       if (res.confirm) {
      //         for (var i = 0; i < that.data.imgs.length; i++) {
      //           if (i == e.currentTarget.dataset.index) that.data.imgs.splice(i, 1)
      //         }
      //         that.setData({
      //           imgs: that.data.imgs
      //         })
      //       } else if (res.cancel) {
      //         console.log("用户点击取消")
      //       }
      //     }
      //   })
      // },
    
      // pickerConfirm(e) {
      //   this.setData({
      //     pickerHidden: true
      //   })
      //   this.setData({
      //     chosen: e.detail.value
      //   })
      // },
    
      // pickerCancel() {
      //   this.setData({
      //     pickerHidden: true
      //   })
      // },
    
      // pickerShow() {
      //   this.setData({
      //     pickerHidden: false
      //   })
      // },

      onclick(e) {
        var formData = {
          name: this.data.spotnameInput,
          address: this.data.address,
          desc: this.data.spotdescInput,
          open_time: this.data.spotopentimeInput,
          playtime: this.data.spotplaytimeInput,
          prices: this.data.prices,
          type: this.data.type
        }
        console.log("the data of formData is ", formData)
        if(formData.name === '' || formData.address.name === '') {
          wx.showToast({
            title: '必填项不能为空',
            icon: 'none'
          });
          return;
        } else {
          wx.showToast({ // 显示Toast
            title: '已向管理员发送',
            icon: 'success',
            duration: 1500
          })
          wx.request({
            url: util.server_hostname + "/api/admin/sight/",
            method: 'POST',
            data:{
              name: this.data.spotnameInput,
              address: this.data.address,
              desc: this.data.spotdescInput,
              open_time: this.data.spotopentimeInput,
              playtime: this.data.spotplaytimeInput,
              prices: this.data.prices,
              type: this.data.type
            },
            success: function(res){
              console.log(res.data)
            },
            fail: function(error) {
              console.log(error);
            } 
          })
        } 
      },

      formSubmit(e) {
        console.log('form发生了submit事件，携带数据为：', e.detail.value) // console.log 用于在console窗口输出信息
      },
    
      formReset(e) {
        console.log('form发生了reset事件，携带数据为：', e.detail.value)
        this.setData({
          chosen: ''
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