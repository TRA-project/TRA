import Vue from 'vue'
import VueRouter from 'vue-router'
//装插件
Vue.use(VueRouter)



const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/personal/login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/personal/register.vue')
  },
  {
    path: '/index',
    name: 'index',
    component: () => import('../views/manage/index.vue'),
    redirect:"/underInspect",
    children: [
      {
        path: "/underInspect",
        name: "underInspect",
        component: () => import("../views/inspection/underInspect.vue"),
      },
      {
        path: "/passInspect",
        name: "passInspect",
        component: () => import("../views/inspection/passInspect.vue"),
      },
      {
        path: "/failInspect",
        name: "failInspect",
        component: () => import("../views/inspection/failInspect.vue"),
      },
      {
        path: "/togetherUnderInspect",
        name: "togetherUnderInspect",
        component: () => import("../views/togetherInspection/togetherUnderInspect.vue"),
      },
      {
        path: "/togetherPassInspect",
        name: "togetherPassInspect",
        component: () => import("../views/togetherInspection/togetherPassInspect.vue"),
      },
      {
        path: "/togetherFailInspect",
        name: "togetherFailInspect",
        component: () => import("../views/togetherInspection/togetherFailInspect.vue"),
      },
      {
        path: "/calenderUnderInspect",
        name: "calenderUnderInspect",
        component: () => import("../views/calenderInspect/calenderUnderInspect"),
      },
      {
        path: "/calenderPassInspect",
        name: "calenderPassInspect",
        component: () => import("../views/calenderInspect/calenderPassInspect"),
      },
      {
        path: "/calenderFailInspect",
        name: "calenderFailInspect",
        component: () => import("../views/calenderInspect/calenderFailInspect"),
      },
      {
        path: "/newMsg",
        name: "newMsg",
        component: () => import("../views/message/newMsg.vue"),
      },
      {
        path: "/oldMsg",
        name: "oldMsg",
        component: () => import("../views/message/oldMsg.vue"),
      },
      {
        path: "/user",
        name: "user",
        component: () => import("../views/manage/user.vue"),
      },
      {
        path: "/record",
        name: "record",
        component: () => import("../views/manage/record.vue"),
      },
      {
        path: "/calender",
        name: "calender",
        component: () => import("../views/manage/calender"),
      },
      {
        path: "/place",
        name: "place",
        component: () => import("../views/manage/place.vue"),
      },
      {
        path: "/together",
        name: "together",
        component: () => import("../views/manage/together.vue"),
      },
      {
        path: "/feedback",
        name: "feedback",
        component: () => import("../views/manage/feedback.vue"),
      },
      {
        path: "/ads",
        name: "ads",
        component: () => import("../views/manage/ads.vue"),
      },
      {
        path:"/statistics",
        name:"statistics",
        component: ()=>import ("../views/manage/statistics")
      },
      {
        path:"/flight",
        name:'flight',
        component:()=>import("../views/manage/flight")
      },
      {
        path:"/userlog",
        name:"userlog",
        component:()=>import("../views/manage/userlog")
      },
      {
        path:"/sceneryManage",
        name:"sceneryManage",
        component:()=>import("../views/scenery/sceneryManage")
      },
      {
        path:"/sceneryAudit",
        name:"sceneryAudit",
        component:()=>import("../views/scenery/sceneryAudit")
      },
      {
        path:"/travelCreateLog",
        name:"travelCreateLog",
        component:()=>import("../views/travel/travelCreateLog")
      }
    ]
  },
]

const router = new VueRouter({
  //mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login' || to.path === '/' || to.path === '/register') {
    localStorage.removeItem('Authorization');
    localStorage.removeItem('Username');
    next();
  } else {
    let token = localStorage.getItem('Authorization');
    if (token === null || token === '') {
      next('/login');
    } else {
      next();
    }
  }
});

export default router
