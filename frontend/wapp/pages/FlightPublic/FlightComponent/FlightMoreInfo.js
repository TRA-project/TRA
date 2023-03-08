// pages/FlightPublic/FlightComponent/FlightMoreInfo.js
const {
    formatDate,
    formatTime
} = require('../../../utils/util');
const utils = require('../../../utils/util');
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        city: {
            type: String,
            value: "",
        },
        endcity: {
            type: String,
            value: "",
        },
        depatureDate: {
            type: String,
            value: ""
        },
        arrivalDate: {
            type: String,
            value: ""
        },
        depatureTime: {
            type: String,
            value: ""
        },
        arrivalTime: {
            type: String,
            value: ""
        },
        flightno: {
            type: String,
            value: ""
        },
        flightno2:{
            type:String,
            value:""
        },
        cabinprice: {
            type: Number,
            value: 0
        },
        ecoprice: {
            type: Number,
            value: 0
        },
        cabincount: {
            type: String,
            value: 0
        },
        ecocount: {
            type: String,
            value: 0
        },
        food: {
            type: Boolean,
            value: true,
        },
        food2:{
            type:Boolean,
            value:true,
        },
        costtime: {
            type: String,
            value: ""
        },
        depatureport: {
            type: String,
            value: ""
        },
        arrivalport: {
            type: String,
            value: ""
        },
        airline: {
            type: String,
            value: ""
        },
        airline:{
            type:String,
            value:""
        },
        flightid: {
            type: Number,
            value: undefined
        },
        isTransit:{
            type:String,
            value:"false"
        },
        depatTransitTime:{
            type:String,
            value:""
        },
        arrivalTransitTime:{
            type:String,
            value:""
        },
        depatureTransitDate:{
            type:String,
            value:""
        },
        arrivalTransitDate:{
            type:String,
            value:""
        },
        transport:{
            type:String,
            value:""
        },
        transcity:{
            type:String,
            value:undefined,
        },
        deltaTime:{
            type:String,
            value:undefined
        },
        flightid2:{
            type:Number,
            value:undefined
        },
        totalTime:{
            type:String,
            value:undefined
        },
        show: {
            type: Boolean,
            value: false,
            observer: function (newVal) {
               
                // 监听curPath属性变化，若这个值存在，且与即将附在data中的值不同，就满足我们的要求可以进行后续操作啦
                if (newVal && newVal == true && this.properties.isTransit=='false') {
                    var that = this;
                    var url;
                    url = utils.server_hostname + "/api/core/flight/" + this.properties.flightid
                    var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
                    wx.request({
                        url: url,
                        data: {},
                        method: 'GET',
                        header: {
                            'content-type': 'application/json',
                            'token-auth': token
                        },
                        success: function (res) {
                            console.log(res)
                            that.setData({
                                city: res.data.city.name,
                                endcity: res.data.endcity.name,
                                flightno: res.data.flight_no,
                                food: res.data.food,
                                depatureport: res.data.departport.name,
                                arrivalport: res.data.arrivalport.name,
                                ecoprice: res.data.economy_minprice,
                                ecocount: parseInt(res.data.economy_discount * 100),
                                cabinprice: res.data.bussiness_minprice,
                                cabincount: parseInt(res.data.bussiness_discount * 100),
                                arrivalTime: utils.formatHour(res.data.arrival_time),
                                depatureTime: utils.formatHour(res.data.depart_time),
                                arrivalDate: utils.formatDate(res.data.arrival_time),
                                depatureDate: utils.formatDate(res.data.depart_time),
                                costtime: utils.formatCost(res.data.cost_time),
                                airline: res.data.airline
                            })
                        }
                    })
                }
                if (newVal && newVal == true && this.properties.isTransit=='true') {
                    var that = this;
                    var url;
                    url = utils.server_hostname + "/api/core/flight/" + this.properties.flightid
                    var token = (wx.getStorageSync('token') == '') ? "notoken" : wx.getStorageSync('token')
                    wx.request({
                        url: url,
                        data: {},
                        method: 'GET',
                        header: {
                            'content-type': 'application/json',
                            'token-auth': token
                        },
                        success: function (res) {
                         
                            that.setData({
                                city: res.data.city.name,
                                transcity: res.data.endcity.name,
                                flightno: res.data.flight_no,
                                food: res.data.food,
                                depatureport: res.data.departport.name,
                                transport: res.data.arrivalport.name,
                                ecoprice: res.data.economy_minprice,
                                cabinprice: res.data.bussiness_minprice,
                                arrivalTransitTime: utils.formatHour(res.data.arrival_time),
                                depatureTime: utils.formatHour(res.data.depart_time),
                                arrivalTransitDate: utils.formatDate(res.data.arrival_time).slice(5),
                                depatureDate: utils.formatDate(res.data.depart_time),
                                airline: res.data.airline
                            })
                        }
                    })
                    url = utils.server_hostname + "/api/core/flight/" + this.properties.flightid2
                    wx.request({
                        url: url,
                        data: {},
                        method: 'GET',
                        header: {
                            'content-type': 'application/json',
                            'token-auth': token
                        },
                        success: function (res) {
                            that.setData({
                                endcity: res.data.endcity.name,
                                flightno2: res.data.flight_no,
                                food2: res.data.food,
                                arrivalport: res.data.arrivalport.name,
                                ecoprice: that.properties.ecoprice+res.data.economy_minprice,
                                cabinprice: that.properties.cabinprice+res.data.bussiness_minprice,
                                depatureTransitTime: utils.formatHour(res.data.depart_time),
                                arrivalTime: utils.formatHour(res.data.arrival_time),
                                depatureTransitDate: utils.formatDate(res.data.depart_time).slice(5),
                                arrivalDate: utils.formatDate(res.data.arrival_time),
                                airline2: res.data.airline
                            })
                
                        }
                    })
                }else if(!newVal){
                  
                    this.setData({
                        endity: "",
                        flightno2: "",
                        food2: false,
                        arrivalport: "",
                        ecoprice: 0,
                        cabinprice: 0,
                        depatureTransitTime: "",
                        arrivalTime: "",
                        depatureTransitDate:"",
                        arrivalDate: "",
                        airline2: "",
                        city: "",
                        transcity: "",
                        flightno: "",
                        food: false,
                        depatureport: "",
                        transport: "",
                        ecoprice: 0,
                        cabinprice: 0,
                        arrivalTransitTime: "",
                        depatureTime:"",
                        arrivalTransitDate: "",
                        depatureDate:"",
                        airline: "",
                        isTransit:"false"
                    })
                }
            }
        },

    },

    /**
     * 组件的初始数据
     */
    data: {
        icon: [utils.server_imagename + '/flight/arrow1.png',
            utils.server_imagename + '/flight/iconPlane1.png',
            utils.server_imagename + '/flight/iconPort.png',
            utils.server_imagename + '/flight/iconTime.png',
            utils.server_imagename + '/flight/iconPurse.png',
            utils.server_imagename + '/flight/iconBusiness.png',
            utils.server_imagename + '/flight/icon_food.png',
            utils.server_imagename + '/flight/background.png',
            utils.server_imagename + '/flight/plane.png'
        ]
    },

    /**
     * 组件的方法列表
     */
    methods: {
        close() {
            this.triggerEvent('cancle')
        },

    }
})