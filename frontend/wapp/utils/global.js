var app = getApp()

const px2rpx = (pxLen) => {
  return pxLen * (750 / app.globalData.windowW)
}

module.exports = {
  px2rpx,
}