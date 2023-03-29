const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}
const getNowDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month,day].map(formatNumber).join('-')}`
}
const getNowDateLine = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month,day].map(formatNumber).join('/')}`
}
const getMonthDate = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[month,day].map(formatNumber).join('-')}`
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
const formatDate = string => {
  const temp = string.split(/:|-|T/)
  return temp[0] + '-' + temp[1] + '-' + temp[2]
}

const formatHour = string => {
  const temp = string.split(/:|-|T/)
  return temp[3] + ':' + temp[4]
}
const ChineseWeek = date => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  var week = new Date(year, month, day).getDay();
  var weeks = new Array("日", "一", "二", "三", "四", "五", "六");
  return `${weeks[week]}`
}
const formatCost = string => {
  const temp = string.split(/:|-|T/)
  return temp[0] + '时' + temp[1] + '分'
}
const noZeroDate = string => {
  const temp = string.split(/-/)
  const m = parseInt(temp[1])
  const d = parseInt(temp[2])
  return temp[0] + '-' + m.toString() + '-' + d.toString()
}
const noSecond = string => {
  const temp = string.split(/:/)
  return temp[0] + ':' + temp[1]
}
const server_hostname = {
  //url: "http://114.116.194.214"
  // url:"http://114.116.53.144"
  url: "http://10.128.55.86:8000"
//   url:"http://localhost:8000"
}
// 测试账号：test， 密码：12345678
const timeLag =string=>{
  const before = string.substring(0,10)
  const end = string.substring(25,35)
  let b = new Date(before)
  let a = new Date(end)
  let day = parseInt((a.getTime() - b.getTime()) / (1000*60*60*24))
  return day

}
const flightImage = string => {
  return server_hostname.url + '/media/flight/' + string
}
module.exports = {
  noSecond,
  noZeroDate,
  getNowDateLine,
  flightImage,
  formatCost,
  formatTime,
  getNowDate,
  formatHour,
  getMonthDate,
  timeLag,
  ChineseWeek,
  server_hostname: server_hostname.url,
  formatDate,
  server_imagename: server_hostname.url + '/media',
  subkey: 'UMABZ-NKAKX-ILH4J-TFRB2-5EVZV-PWBIJ',

  loginExpired: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    })

    wx.showToast({
      title: '登陆已过期',
      icon: 'error',
      duration: 1000
    })
  },

  unLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    })

    wx.showToast({
      title: '未登陆',
      icon: 'error',
      duration: 1000
    })
  },

  positionTransform: function (position) { // 将后端 position 格式转换为前端格式
    var location = {
      latitude: position.latitude,
      longitude: position.longitude,
      name: position.name,
      address: {
        city: position.city,
        district: position.district,
        nation: position.nation,
        province: position.province,
        street: position.street,
        street_number: position.street_number
      }
    }
    return location
  },

  navigate2footprint: function (id, nickname, icon, cities, travels) {
    var url = '/pages/footprint/footprint?'
    url = url + "id=" + id
    url = url + "&" + "nickname=" + nickname
    url = url + "&" + "icon=" + icon
    url = url + "&" + "cities=" + cities
    url = url + "&" + "travels=" + travels
    wx.navigateTo({
      url: url,
    });
  },

  navigate2Travel: function (travel_id, author_id, author_icon, author_nickname, author_cities, author_travels) {
    var url = '/pages/travel/travel?'
    url = url + "travel_id=" + travel_id
    url = url + "&" + "author_id=" + author_id
    url = url + "&" + "author_icon=" + author_icon
    url = url + "&" + "author_nickname=" + author_nickname
    url = url + "&" + "author_cities=" + author_cities
    url = url + "&" + "author_travels=" + author_travels
    wx.navigateTo({
      url: url,
    });
  },

  navigate2Schedule: function (schedule_id, author_id, author_icon, author_nickname, author_cities, author_travels) {
    var url = '/pages/Schedule/Schedule?'
    url = url + "schedule_id=" + schedule_id
    url = url + "&" + "author_id=" + author_id
    url = url + "&" + "author_icon=" + author_icon
    url = url + "&" + "author_nickname=" + author_nickname
    url = url + "&" + "author_cities=" + author_cities
    url = url + "&" + "author_travels=" + author_travels
    wx.navigateTo({
      url: url,
    });
  },

  navigate2Pal: function (pal_id, author_id, author_icon, author_nickname, author_cities, author_travels) {
    var url = '/pages/Pal/Pal?'
    url = url + "pal_id=" + pal_id
    url = url + "&" + "author_id=" + author_id
    url = url + "&" + "author_icon=" + author_icon
    url = url + "&" + "author_nickname=" + author_nickname
    url = url + "&" + "author_cities=" + author_cities
    url = url + "&" + "author_travels=" + author_travels
    wx.navigateTo({
      url: url,
    });
  },

  navigate2Loc: function (loc_id, loc_name, loc_images, loc_description, loc_cover) {
    var url = '/pages/Location/Location?'
    url = url + "loc_id=" + loc_id
    url = url + "&" + "loc_name=" + loc_name
    url = url + "&" + "loc_images=" + loc_images
    url = url + "&" + "loc_description=" + loc_description
    url = url + "&" + "loc_cover=" + loc_cover
    wx.navigateTo({
      url: url,
    });
  },
  navigate2calendar: function () {
    var url = '/pages/newSchedule/newSchedule'

    wx.navigateTo({
      url: url,
    });
  },

  navigate2Release: function () {
    var token = wx.getStorageSync('token')
    var id = wx.getStorageSync('id')
    // console.log(token)
    // console.log(id)

    wx.request({
      url: server_hostname.url + "/api/core/users/" + id + "/",
      data: {},
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      success: function (res) {
        if (res.statusCode == 404) {
          wx.navigateTo({
            url: '/pages/login/login',
          })

          wx.showToast({
            title: '未登陆',
            icon: 'error',
            duration: 1000
          })
          return
        }

        // wx.showActionSheet({
        //   alertText:"请选择发布种类",
        //   itemList: ['游记', '同行', '取消'],
        //   itemColor:'#007aff',
        //   success (res) {
        //     console.log(res.tapIndex)
        //     if(res.tapIndex == 0){
        //       wx.navigateTo({
        //         url: '/pages/ReleasePal/ReleasePal',
        //       })
        //     }else if(res.tapIndex == 1){
        //       wx.navigateTo({
        //         url: '/pages/Release/Release',
        //       })
        //     }else{

        //     }
        //   },
        //   fail (res) {
        //     console.log(res.errMsg)
        //   }
        // })
        wx.showModal({
          title: "请选择发布种类",
          cancelText: "游记",
          confirmText: "同行",
          cancelColor: '#576B95',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/ReleasePal/ReleasePal',
              })
            } else if (res.cancel) {
              wx.navigateTo({
                url: '/pages/Release/Release',
              })
            }
          }
        })
      }
    })
  },

  /*函数节流*/
  throttle: function (fn, interval) {
    var enterTime = 0; //触发的时间
    var gapTime = interval || 100; //间隔时间，如果interval不传，则默认100ms
    return function () {
      var context = this;
      var backTime = new Date(); //第一次函数return即触发的时间
      if (backTime - enterTime > gapTime) {
        fn.call(context, arguments);
        enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
      }
    };
  },

  /*函数防抖*/
  debounce: function (fn, interval) {
    var timer;
    var gapTime = interval || 10; //间隔时间，如果interval不传，则默认1000ms
    return function () {
      clearTimeout(timer);
      var context = this;
      var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
      timer = setTimeout(function () {
        fn.call(context, args);
      }, gapTime);
    };
  },

  authorize: function () {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
          })
        }
      }
    })
  }
}