<template>
  <!-- 传入内容 插槽内容 会循环多次 有多少节点 就循环多少次 -->
  <!-- 作用域插槽  slot-scope="obj" 接收传递给插槽的数据  data 就是每个节点的数据对象 -->
  <el-row
    slot-scope="{ treeNode }"
    type="flex"
    justify="space-between"
    align="middle"
    style="height: 40px; width: 100%"
  >
    <el-col>
      <!-- 左侧内容 -->
      <span>{{ treeNode.name }}</span>
    </el-col>
    <el-col :span="4">
      <el-row type="flex" justify="end">
        <el-col>{{ treeNode.manager }}</el-col>
        <el-col>
          <!-- 下拉菜单 -->
          <el-dropdown @command="operateDepts">
            <!-- 内容 -->
            <span
              >操作
              <i class="el-icon-arrow-down"></i>
            </span>
            <!-- 具名插槽 -->
            <el-dropdown-menu slot="dropdown">
              <!-- 下拉选项 -->
              <el-dropdown-item command="add" :disabled="!checkPermission('add-dept')">添加子部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="edit">编辑部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="del">删除部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
      <!-- 右侧内容 -->
    </el-col>
  </el-row>
</template>

<script>
import { delDepartments } from '@/api/departments'

export default {
    props: {
        // 定义传入属性
        treeNode: {
            type: Object,
            required: true
        },
        isRoot: {
            type: Boolean,
            default: false
        }
    },
    methods: {
      // 点击 编辑 删除 新增时触发
      operateDepts(type) {
        if (type === 'add') {
          // 添加子部门
          // 在当前点击的部门下  添加子部门 => this.treeNode 就是当前点击的部门
          this.$emit('addDepts', this.treeNode) // 触发自定义事件 显示弹层
        } else if (type === 'edit') {
          // 编辑部门
          this.$emit('editDepts', this.treeNode) // 触发自定义事件 点击谁 编辑谁
        } else {
          // 删除
          this.$confirm('您确定要删除该组织部门吗?').then(() => {
            return delDepartments(this.treeNode.id)
          }).then(() => {
            // 只需要等到成功的时候 调用接口删除 后端数据变化 但前段数据没变
            this.$emit('delDepts') // 触发自定义事件
            this.$message.success('删除部门成功!')
          })
        }
      }
    }
}
</script>

<style>
</style>
