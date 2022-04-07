<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <!-- 左侧显示总记录数 -->
        <!-- <span slot="before">共16条记录</span> -->
        <template v-slot:before>
          <span>共{{ page.total }}条记录</span>
        </template>
        <!-- 右侧显示按钮 excel导入 excel导出  新增员工 -->
        <template v-slot:after>
          <el-button size="small" type="success" @click="$router.push('/import')">excel导入</el-button>
          <el-button size="small" type="danger" @click="exportData">excel导出</el-button>
          <el-button :disabled="!checkPermission('POINT-USER-ADD')" size="small" type="primary" @click="showDialog = true">新增员工</el-button>
        </template>
      </page-tools>
      <!-- 表格组件 -->
      <el-table v-loading="loading" :data="list">
          <el-table-column type="index" label="序号" sortable="" />
          <el-table-column label="姓名" prop="username" sortable="" />
          <el-table-column width="120" label="头像" align="center">
            <!-- 插槽 -->
            <!-- <template slot-scope="{ row }"> -->
            <template v-slot="{ row }">
              <img
               v-imagerror="require('@/assets/common/bigUserHeader.png')" 
               :src="row.staffPhoto" 
               style="border-radius: 50%; width: 100px; height: 100px; padding: 10px"
               @click="showQrCode(row.staffPhoto)" 
              >
            </template>
          </el-table-column>
          <el-table-column label="工号" prop="workNumber" sortable="" />
          <el-table-column :formatter="formatEmployment" label="聘用形式" prop="formOfEmployment" sortable="" />
          <el-table-column label="部门" prop="departmentName" sortable="" />
          <!-- 作用域插槽 + 过滤器 -->
          <el-table-column label="入职时间" prop="timeOfEntry" sortable="">
            <!-- <template slot-scope="obj">{{ obj.row.timeOfEntry }}</template> -->
            <!-- <template v-slot="obj">{{ obj.row.timeOfEntry }}</template> -->
            <template v-slot="{ row }">{{ row.timeOfEntry | formatDate }}</template>
            <!-- 将时间进行格式化 -->
          </el-table-column>
          <el-table-column label="账户状态" prop="enableState" sortable="">
            <template v-slot="{ row }">
              <el-switch :value="row.enableState === 1"></el-switch>
              <!-- <el-switch :value="row.formOfEmployment === 1"></el-switch> // 正式/非正式 -->
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <!-- <template slot-scope="{ row }"> -->
            <template v-slot="{ row }">
              <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button type="text" size="small" @click="delEmployee(row.id)">删除</el-button>
            </template>
          </el-table-column>
      </el-table>
      <!-- 放置分页组件 -->
      <el-row type="flex" justify="center" align="middle" style="height:60px">
        <el-pagination
         :current-page="page.page" 
         :page-size="page.size" 
         :total="page.total" 
         @current-change="changePage"
         layout="prev, pager, next" />
      </el-row>
    </div>
    <!-- 放置新增员工组件弹层 -->
    <!-- sync修饰符 子组件 去改变父组件数据的一个语法糖 -->
    <add-employee :show-dialog.sync="showDialog" />
    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <!-- 放置角色分配组件 -->
    <assign-role ref="assignRole" :show-role-dialog.sync ="showRoleDialog" :user-id="userId" />
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees' // 引入员工的枚举项
import AddEmployee from './components/add-employee'
import { formatDate } from '@/filters'
import AssignRole from './components/assign-role.vue'
import QrCode from 'qrcode'

export default {
  data () {
    return {
      list: [], // 接收数组
      page: {
        page: 1,
        size: 10,
        total: 0 // 总数
      },
      loading: false, // 显示加载
      showDialog: false, // 默认关闭新增员工弹出层
      showCodeDialog: false, // 二维码弹层
      showRoleDialog: false, // 显示分配角色弹层
      userId: null // 定义一个userId
    }
  },
  components: {
    AddEmployee,
    AssignRole
  },
  created () {
    this.getEmployeeList()
  },
  methods: {
    async getEmployeeList() {
      this.loading = true
      const {total, rows} = await getEmployeeList(this.page)
      this.page.total = total
      // console.log(rows)
      this.list = rows
      this.loading = false
    },
    // newPage 最新的页码
    changePage(newPage) {
      this.page.page = newPage // 赋值最新的页码
      this.getEmployeeList() // 重新拉取数据
    },
    // 格式化 聘用形式
    formatEmployment(row, column, cellValue, index) {
      // 要去找 1所对应的值
      const obj = EmployeeEnum.hireType.find(item => item.id == cellValue)
      return obj ? obj.value : '未知'
    },
    async delEmployee(id) {
      try {
        await this.$confirm('确定删除该员工吗?')
        // 点击确定之后 调用删除接口
        await delEmployee(id)
        this.$message.success('删除员工成功!')
        this.getEmployeeList() // 重新拉取数据
      } catch (error) {
        console.log(error)
      }
    },
    // 导出excel
    exportData () {
      const headers = {
        '姓名': 'username',
        '手机号': 'mobile',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      import('@/vendor/Export2Excel').then(async excel => {
        // excel是引入文件的导出对象
        // 导出  header从哪里来?
        // data  从哪里来?
        // 现在没有一个接口获取所有的数据
        // 获取员工的接口  页码 每页条数 (如: 100条数据)  =>   1   100(当前总数:this.page.total)
        const { rows } = await getEmployeeList({ page: 1, size: this.page.total })
        const data = this.formatJson(headers, rows) // 返回data 就是要导出的结构
        // const multiHeader = [['a','b','c','d','e','f','g'],[1,2,3,4,5,6,7]](两行) // 复杂表头
        const multiHeader = [['姓名', '主要信息', '', '', '', '', '部门']]
        const merges = ['A1:A2', 'B1:F1', 'G1:G2'] // 合并表格选项
        excel.export_json_to_excel({
          header: Object.keys(headers),
          data, // data: data
          filename: '员工资料表',
          multiHeader, // 复杂表头
          merges // 合并选项
        })
        // excel.export_json_to_excel({
        //   header: ['姓名','工资'],
        //   // data: [['张三', 3000],['李四', 4000]],
        //   data: [],
        //   filename: '员工工资表',
        // })
        // [{ username: '张三', mobile: 13770486333}] => [['张三', 13770486333]]
        // 要转化 数据结构 还要和表头的顺序对应上
        // 要求 转出的标题是中文
      })
    },
    // 将表头数据和数据进行对应   [{},{}]  => [[]]
    formatJson(headers, rows) {
      return rows.map(item => {
        // item是一个对象 {mobile: 13114290678, username: '张三', timeOfEntry: 2019-10-10, ...}
        // ["手机号", "姓名", "入职日期",...].map(key => {})
        return Object.keys(headers).map(key => {
          // 需要判断 时间字段 timeOfEntry和correctionTime 格式化日期
          if (headers[key] === 'timeOfEntry' || headers[key] === 'correctionTime') {
            // 格式化日期
            return formatDate(item[headers[key]])
          } else if (headers[key] == 'formOfEmployment') {
            const obj = EmployeeEnum.hireType.find(obj => obj.id == item[headers[key]])
            return obj ? obj.value : '未知'
          }
          return item[headers[key]] // ['13114290678', '张三', '2019-10-10', ...]
        })
      })
      // return rows.map(item => Object.keys(headers).map(key => item[headers[key]])) // 需要处理时间格式 即不适用
    },
    showQrCode(url) {
      // url存在的情况下  才弹出层  否则不弹
      if (url) {
        this.showCodeDialog = true // 数据更新了  但是弹层会立刻出现吗? 页面渲染是异步的
        // 有一个方法可以在上一次数据更新完毕，页面渲染完毕之后 this.$nextTick()
        this.$nextTick(() => {
          // 此时可以确认已经有ref对象了
          QrCode.toCanvas(this.$refs.myCanvas, url) // 将地址转化成二维码
          // 如果转化的二维码后面信息 是一个地址的话 就会跳转到该地址 如果不是地址就会显示内容
        })
        
      } else {
          this.$message.warning('该用户还未上传头像')
      }
    },
    async editRole(id) {
      this.userId = id // props赋值  props赋值并渲染是异步的
      await this.$refs.assignRole.getUserDetailById(id) // 调用子组件方法 异步方法
      this.showRoleDialog = true // 弹层
    }
  }
}
</script>

<style>

</style>
