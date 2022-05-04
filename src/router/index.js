import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/register',
    component: () => import('@/views/login/register'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  // 用户管理
  {
    path: '/user-manager',
    component: Layout,
    redirect: '/user-manager/user',
    name: 'UserManager',
    meta: {
      title: '用户管理',
      icon: 'nested',
      roles: ['admin', 'student']
    },
    children: [
      {
        path: 'persion-info',
        name: 'persionInfo',
        component: () => import('@/views/user-manager/person-info/index'),
        meta: {
          title: '个人信息',
          icon: 'form',
          roles: ['admin', 'student'],
          noCache: true
        }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user-manager/user/list'),
        meta: {
          title: '用户管理',
          icon: 'form',
          roles: ['admin'],
          noCache: true
        }
      }
    ]
  },
  // 考试管理
  {
    path: '/exam-manager',
    component: Layout,
    redirect: '/exam-manager/repo',
    name: 'ExamManager',
    meta: {
      title: '考试管理',
      icon: 'nested',
      roles: ['admin']
    },
    children: [
      {
        path: 'repo',
        name: 'Repo',
        component: () => import('@/views/exam-manager/repo/list'), // Parent router-view
        meta: {
          title: '题库管理',
          icon: 'form',
          roles: ['admin'],
          noCache: true
        }
      },
      {
        path: 'question',
        name: 'Question',
        component: () => import('@/views/exam-manager/question/list'), // Parent router-view
        meta: {
          title: '题目管理',
          icon: 'form',
          roles: ['admin'],
          noCache: true
        }
      },
      {
        path: 'paper',
        name: 'Paper',
        component: () => import('@/views/exam-manager/paper/list'), // Parent router-view
        meta: {
          title: '试卷管理',
          icon: 'form',
          roles: ['admin'],
          noCache: true
        }
      },
      {
        path: 'paperForm',
        name: 'PaperForm',
        component: () => import('@/views/exam-manager/paper/paperForm'), // Parent router-view
        meta: {
          title: '试卷表单',
          roles: ['admin'],
          noCache: true
        },
        hidden: true
      },
      {
        path: 'exam',
        name: 'Exam',
        component: () => import('@/views/exam-manager/exam/list'), // Parent router-view
        meta: {
          title: '考试管理',
          icon: 'form',
          roles: ['admin'],
          noCache: true
        }
      }
    ]
  },
  // 在线考试
  {
    path: '/online-exam',
    component: Layout,
    redirect: '/online-exam/exam',
    name: 'OnlineExamDir',
    meta: {
      title: '在线考试',
      icon: 'nested',
      roles: ['admin', 'student']
    },
    children: [
      {
        path: 'exam-list',
        name: 'ExamList',
        component: () => import('@/views/online-exam/online-exam/list'), // Parent router-view
        meta: {
          title: '考试列表',
          icon: 'form',
          roles: ['admin', 'student'],
          noCache: true
        }
      },
      {
        path: 'exam-record',
        name: 'ExamRecord',
        component: () => import('@/views/online-exam/exam-grade/record'), // Parent router-view
        meta: {
          title: '考试记录',
          icon: 'form',
          roles: ['admin', 'student'],
          noCache: true
        }
      },
      // 考试信息
      {
        path: 'info',
        name: 'ExamInfo',
        component: () => import('@/views/online-exam/online-exam/info'),
        meta: {
          title: '考试信息',
          icon: 'form',
          roles: ['admin', 'student'],
          noCache: true
        },
        hidden: true
      },
      // 考试详细情况
      {
        path: 'detail',
        name: 'ExamDetail',
        component: () => import('@/views/online-exam/online-exam/detail'),
        meta: {
          title: '考试详情',
          icon: 'form',
          roles: ['admin', 'student'],
          noCache: true
        },
        hidden: true
      }
    ]
  },
  // 正在考试
  {
    path: 'online-exam/run',
    name: 'RunExam',
    component: () => import('@/views/online-exam/online-exam/run'),
    meta: {
      title: '开始考试',
      roles: ['admin', 'student'],
      noCache: true
    },
    hidden: true
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
