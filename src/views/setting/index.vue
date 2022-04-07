<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 放置内容 -->
      <el-card>
        <el-tabs>
          <el-tab-pane label="角色管理">
            <!-- 左侧内容 -->
            <el-row style="height:60px">
              <el-button icon="el-icon-plus" type="primary" size="small" @click="showDialog = true">新增角色</el-button>
            </el-row>
            <el-table border :data="list">
              <el-table-column type="index" align="center" label="序号" width="120"></el-table-column>
              <el-table-column align="center" prop="name" label="名称" width="240"></el-table-column>
              <el-table-column align="center" prop="description" label="描述"></el-table-column>
              <el-table-column align="center" label="操作">
                <!-- 作用域插槽 -->
                <template slot-scope="{ row }">
                  <el-button size="small" type="success" @click="assignPerm(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="eidtRole(row.id)">修改</el-button>
                  <el-button size="small" type="danger" @click="deleteRole(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 放置分页组件 -->
            <el-row type="flex" justify="center" align="middle" style="height:60px">
              <el-pagination
               :total="page.total" 
               :page-size="page.pagesize" 
               :current-page="page.page" 
               @current-change="changePage"
               layout="prev, pager, next">
              </el-pagination>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="公司信息">
            <el-alert type="info" :show-icon="true" :closable="false" title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改" />
            <!-- 右侧内容 -->
            <el-form label-width="120px" style="margin-top:50px">
              <el-form-item label="企业名称">
                <el-input v-model="formData.name" disabled style="width:400px"></el-input>
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input v-model="formData.companyAddress" disabled style="width:400px"></el-input>
              </el-form-item>
              <el-form-item label="公司电话">
                <el-input  v-model="formData.companyPhone" disabled style="width:400px"></el-input>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="formData.mailbox" disabled style="width:400px"></el-input>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="formData.remarks" type="textarea" :rows="3" disabled style="width:400px"></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 放置新增/修改弹层组件 -->
    <!-- close事件  在点击确定的时候会触发 -->
    <el-dialog :title="showText" :visible="showDialog" @close="btnCancel">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="120px">
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <!-- 放置footer插槽 -->
      <el-row type="flex" justify="center" slot="footer">
        <el-col :span="6">
          <el-button size="samll" @click="btnCancel">取消</el-button>
          <el-button size="samll" @click="btnOK" type="primary">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <!-- 放置一个分配权限弹层 -->
    <el-dialog
     title="分配权限" 
     :visible="showPermDialog"
     @close="btnPermCancel"
    >
      <!-- 分配权限 => 是一棵树型 -->
      <!-- 将数据绑定到组件上 -->
      <!-- check-strictly 如果为true  表示父子勾选时  不互相关联  如果为false就互相关联 -->
      <!-- node-key => id 作为唯一标识 -->
      <el-tree
       :data="permData" 
       :props="defaultProps" 
       show-checkbox 
       :check-strictly="true"
       :default-expand-all="true"
       :default-checked-keys="selectCheck"
       node-key="id"
       ref="permTree"
      />
      <el-row type="flex" justify="center" slot="footer">
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnPermOK">确定</el-button>
          <el-button size="small" @click="btnPermCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, deleteRole, getRoleDetail, updateRole, addRole, assignPerm } from '@/api/setting'
import { mapGetters } from 'vuex'
import { getPermissionList } from '@/api/permission'
import { tranListToTreeData } from '@/utils'

export default {
  data () {
    return {
      list: [], // 承接数组
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 10  ,
        total: 0 // 记录总数
      },
      formData: {
        // 公司信息
      },
      showDialog: false, // 控制弹层显示
      showPermDialog: false, // 分配权限弹层
      roleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空!', trigger: 'blur' }]
      },
      permData: [], // 接受权限数据
      defaultProps: {
        label: 'name'
      }, // 定义显示字段的名称 和 子属性的名称
      roleId: null, // 用来记录当前分配权限的id
      selectCheck: [] // 用来记录当前权限点的标识
    }
  },
  computed: {
    ...mapGetters(['companyId']),
    showText() {
      return this.roleForm.id ? '编辑角色' : '新增角色'
    }
  },
  created () {
    this.getRoleList(), // 获取角色列表
    this.getCompanyInfo()
  },
  methods: {
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page)
      this.page.total = total
      this.list = rows
    },
    changePage(newPage) {
      // newPage 当前点击的页码
      this.page.page = newPage // 将当前页码赋值给当前的最新页码
      this.getRoleList()
    },
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId) // 直接赋值给formData
    },
    async deleteRole(id) {
      // 提示
      try {
        await this.$confirm('确认删除该角色吗?')
        await deleteRole(id) // 调用删除接口
        this.getRoleList() // 重新加载数据
        this.$message.success('删除角色成功!')
      } catch (error) {
        console.log(error)
      }
    },
     async eidtRole(id) {
      this.roleForm = await getRoleDetail(id) // 实现数据的回写
      this.showDialog = true // 显示弹层
    },
    btnCancel() {
      this.roleForm = {
        name: '',
        description: ''
      }
      // 移除校验
      this.$refs.roleForm.resetFields()
      this.showDialog = false
    },
    async btnOK() {
      try {
        await this.$refs.roleForm.validate()
        // 只有校验通过的情况下 才会执行await的下方内容  
        // roleForm 这个对象有 id就是编辑   没有就是新增
        if (this.roleForm.id) {
          // 编辑角色业务
          await updateRole(this.roleForm)
        } else {
          // 新增角色业务
          await addRole(this.roleForm)
        }
        // 重新拉去数据
        this.getRoleList()
        this.$message.success('操作成功')
        this.showDialog = false // 关闭弹层  => 触发 el-dialog的事件 close
      } catch (error) {
        console.log(error)
      }
    },
    // 弹出分配权限层
    // 获取权限数据  在点击的时候调用  获取权限点数据
    async assignPerm(id) {
      this.permData = tranListToTreeData(await getPermissionList(), '0') // 转化list到树形数据
      // 有id 就可以获取该角色详情(里有permIds)  id应该先记录下来(保存更新也需要该id)
      this.roleId = id
      // 应该去获取 这个id的 权限点
      const { permIds } = await getRoleDetail(id) // permIds是当前角色所拥有的权限点数据
      // console.log(permIds)
      this.selectCheck = permIds // 将当前角色所有的权限id 赋值
      this.showPermDialog = true
    },
    async btnPermOK() {
      // 调用el-tree中方法 getCheckedKeys() => 若节点可被选择，则返回目前被选中的节点的 key所组成的数组
      // console.log(this.$refs.permTree.getCheckedKeys())
      await assignPerm({permIds: this.$refs.permTree.getCheckedKeys(), id:this.roleId})
      this.$message.success('分配权限成功')
      this.showPermDialog = false
    },
    btnPermCancel() {
      this.selectCheck = [] // 重置数据
      this.showPermDialog = false
    }
  }
}
</script>

<style>

</style>
