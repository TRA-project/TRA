const travelPlan = [
  {
    id: 1,
    name: "景点1",
    desc: "景点介绍1",
    address: {
      positon: '景点位置信息1',
      longitude: 116.46,
      latitude: 39.90,
    },
    time: new Date().getTime(),
  },
  {
    id: 2,
    name: "景点2",
    desc: "景点介绍2",
    address: {
      positon: '景点位置信息2',
      longitude: 116.36,
      latitude: 39.92,
    },
    time: new Date().getTime(),
  },
  {
    id: 3,
    name: "景点3",
    desc: "景点介绍3",
    address: {
      positon: '景点位置信息3',
      longitude: 116.50,
      latitude: 39.91,
    },
    time: new Date().getTime(),
  },
]

const activeIcon = {
  iconPath: "/images/locate-marker-focus-double.png",
  width: "49.5rpx",
  height: "144rpx",
}

const normalIcon = {
  iconPath: "/images/locate-marker-double.png",
  width: "42rpx",
  height: "120rpx",
}

const mapMarkers = [
  {
    iconPath: "/images/locate-marker-double.png",
    width: "42rpx",
    height: "120rpx",
    longitude: 116.46,
    latitude: 39.92,
  },
]

const mapPolyLines = [
  {
    points: [
      {longitude: 116.46, latitude:39.92},
      {longitude: 116.45, latitude:39.91},
    ],
    color: "#00ff00", // green
    width: 6,
    borderColor: "#11ff11",
    borderWidth: 2,
  },
]

const steps = [
  {
    text: '步骤一',
    desc: '描述信息1',
  },
  {
    text: '步骤二',
    desc: '描述信息2',
  },
  {
    text: '步骤三',
    desc: '描述信息3',
  },
]

module.exports = {
  travelPlan,
  activeIcon,
  normalIcon,
  mapMarkers,
  mapPolyLines,
  steps,
}