// 导出员工路由规则

import Layout from '@/layout'

export default {
  path: '/employees', // 路由地址
  name: 'employees', // 给模块的一级路由加一个name 属性  这个属性  我们后面会在做权限的时候用到
  component: Layout,
  children: [{
    // 二级路由的path 不写，此时表示二级路由的默认路由
    path: '', // 这里不用写  什么都不写表示  /employees  不但有布局  layout =>  员工主页
    component: () =>
      import ('@/views/employees'),
    name: 'employees',
    // 路由元信息 其实就是一个存储数据的地方  可以放任何内容
    meta: { title: '员工管理', icon: 'people' } //  Why use title?  Cause 左侧导航读取这里的 title
  }, {
    path: 'detail/:id?', // ?含义表示参数可传可不传 动态路由参数 /employees/detail/123 || /employees/detail
    component: () =>
      import ('@/views/employees/detail'),
    hidden: true, // 不在左侧边栏显示
    meta: { title: '员工详情' }
  }, {
    path: 'print/:id',
    component: () =>
      import ('@/views/employees/print'),
    hidden: true, // 不在左侧边栏显示
    meta: { title: '员工打印' }
  }]
}