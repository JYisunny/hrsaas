// 导出员工路由规则

import Layout from '@/layout'

export default {
  path: '/departments', // 路由地址
  name: 'departments', // 给模块的一级路由加一个name 属性  这个属性  我们后面会在做权限的时候用到
  component: Layout,
  children: [{
    // 二级路由的path 不写，此时表示二级路由的默认路由
    path: '', // 这里不用写  什么都不写表示  /employees  不但有布局  layout =>  员工主页
    component: () =>
      import ('@/views/departments'),
    name: 'departments',
    // 路由元信息 其实就是一个存储数据的地方  可以放任何内容
    meta: { title: '组织架构', icon: 'tree' } //  Why use title?  Cause 左侧导航读取这里的 title
  }]
}