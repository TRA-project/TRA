module.exports = {
    //publicPath: '/admin/',
	publicPath: './',
    devServer: {
          open: true,
          host: 'localhost',
          port: 80,
          //https: false,
        //以上的ip和端口是我们本机的;下面为需要跨域的
        // before:{
        //       before: require('./mock/index')
        // },
        //proxy:"http://127.0.0.1:8000";
        proxy: {  //配置跨域
            '/api': {
                target: 'http://127.0.0.1:8000/api',  //这里后台的地址模拟的;应该填写你们真实的后台接口
                //ws: true,
                //target: 'http://39.106.249.212:80/api',
                //target: 'http://114.116.194.214/api/',
                secure:false,
                changOrigin: true,  //允许跨域
                pathRewrite: {
                    '^/api': ''  //请求的时候使用这个api就可以
                }
            }
        },
    },
}
