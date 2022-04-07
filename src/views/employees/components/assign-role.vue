<template>
  <el-dialog title="分配角色" :visible="showRoleDialog" @close="btnCancel">
      <!-- 多选框组  v-model双向绑定 -->
      <el-checkbox-group v-model="roleIds">
          <!-- 要循环的选项 -->
          <!-- 要显示角色名称 存储 角色id  label表示要存储的值 -->
          <el-checkbox v-for="item in list" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
      </el-checkbox-group>
      <!-- 定义footer 插槽 -->
      <el-row slot="footer" type="flex" justify="center">
          <el-col :span="6">
              <el-button size="small" type="primary" @click="btnOK">确定</el-button>
              <el-button size="small" @click="btnCancel">取消</el-button>
          </el-col>
      </el-row>
  </el-dialog>
</template>

<script>
import { getRoleList } from '@/api/setting'
import { getUserDetailById } from '@/api/user'
import { assignRoles } from '@/api/employees'

export default {
  data () {
        return {
            list: [], // 负责存储当前所有的角色 id
            roleIds: [] // 该数组负责存储  当前用户所拥有的角色 id
        }
    },
  props: {
      showRoleDialog: {
          type: Boolean,
          default: false
      },
      userId: {
          // 用户的id  当前要处理的该用户id
          type: String,
          default: null,
        //   required: true
      }
  },
  created () {
      // 获取所有角色
      this.getRoleList()
  },
  methods: {
      async getRoleList() {
          const { rows } = await getRoleList({ page: 1, pagesize: 20 }) // 不传值 默认只取10条数据   角色数量不会太多
          // rows是要循环的记录 生成多个checkbox
          this.list = rows
      },
      // 该方法什么时候调用?    props传值是异步的  所以这里不能用 this.userId
      // 该方法是给父组件调用的
      async getUserDetailById(id) {
          const { roleIds } = await getUserDetailById(id) // 将用户所拥有的角色赋值给 当前的用户对象
          this.roleIds = roleIds
      },
      async btnOK() {
          await assignRoles({ id: this.userId, roleIds: this.roleIds})
          // 关闭弹层
          this.$emit('update:showRoleDialog', false)
        //   this.$parent.showRoleDialog = false
      },
      btnCancel() {
          // 取消
          this.roleIds = [] // 重置数组  将它还原成一个空
          this.$emit('update:showRoleDialog', false)
      }
  }
}
</script>

<style>

</style>