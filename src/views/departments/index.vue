<template>
  <div v-loading="loading" class="dashboard-container">
    <div class="app-container">
      <!-- 组织架构内容 -头部 -->
      <el-card class="tree-card">
        <!-- 放置结构内容 -->
        <tree-tools :tree-node="company" :is-root="true" @addDepts="addDepts" />
        <!-- 放置一个 el-tree -->
        <el-tree
          :data="departs"
          :props="defaultProps"
          :default-expand-all="true"
        >
          <!-- 传入内容 插槽内容 会循环多次 有多少节点 就循环多少次 -->
          <!-- 作用域插槽  slot-scope="obj" 接收传递给插槽的数据  data 就是每个节点的数据对象 -->
        <tree-tools slot-scope="{ data }" :tree-node="data" @addDepts="addDepts" @editDepts="editDepts" @delDepts="getDepartments" />
        </el-tree>
      </el-card>
    </div>
    <!-- 放置新增弹层组件 -->
    <add-dept ref="addDept" :showDialog.sync="showDialog" :tree-node="node" @addDepts="getDepartments"></add-dept>
  </div>
</template>

<script>
import TreeTools from './components/tree-tools'
import AddDept from './components/add-dept'
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils'

export default {
  data() {
    return {
      company: {}, // 头部数据结构
      departs: [
        /* {
          name: "总裁办",
          manager: "曹操",
          children: [{ name: "董事会", manager: "曹丕" }],
        },
        { name: "行政部", manager: "刘备" },
        { name: "人事部", manager: "孙权" }, */
      ],
      defaultProps: {
        label: "name", // 表示这个属性显示内容
      },
      showDialog: false, // 默认不显示弹层
      node: null, // 记录当前点击的 node 节点
      loading: false // 用来控制进度弹层的显示和隐藏
    }
  },
  components: {
    TreeTools,
    AddDept
  },
  created () {
    this.getDepartments()
  },
  methods: {
    async getDepartments () {
      this.loading = true
      const result = await getDepartments()
      this.company = { name: result.companyName, manager: '负责人', id: '' }
      this.departs = tranListToTreeData(result.depts, '') // 需将其转化为树形结构
      // console.log(result)
      this.loading = false
    },
    // 监听 tree-tools中触发的点击添加子部门事件
    // node 就是我们当前点击的部门
    addDepts(node) {
      this.showDialog = true // 显示弹层
      this.node = node
    },
    editDepts(node) {
      this.showDialog = true // 弹出层
      this.node = node
      // 应该在这里调用获取部门详情的方法
      // console.log(this.$refs.addDept)
      this.$refs.addDept.getDepartDetail(node.id)
    }
  }
}
</script>

<style scoped>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>
