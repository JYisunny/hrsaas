<template>
  <!-- 放置弹层组件 -->
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
      <!-- 表单数据 label-width设置所有标题的宽度 -->
      <el-form ref="deptForm" :model="formData" :rules="rules" label-width="120px">
          <el-form-item prop="name" label="部门名称">
              <el-input v-model="formData.name" style="width: 80%" placeholder="1~50个字符"></el-input>
          </el-form-item>
          <el-form-item prop="code" label="部门编码">
              <el-input v-model="formData.code" style="width: 80%" placeholder="1~50个字符"></el-input>
          </el-form-item>
          <el-form-item prop="manager" label="部门负责人">
              <!-- native修饰符 可以找到原生元素的事件 -->
              <el-select @focus="getEmployeeSimple" v-model="formData.manager" style="width: 80%" placeholder="请选择">
                  <!-- 遍历选项 -->
                  <el-option v-for="item in peoples" :key="item.id" :label="item.username" :value="item.username"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item prop="introduce" label="部门介绍">
              <el-input v-model="formData.introduce" style="width: 80%" placeholder="1~300个字符" type="textarea" :rows="3"></el-input>
          </el-form-item>
      </el-form>
      <!-- 确定和取消 -->
      <el-row slot="footer" type="flex" justify="center">
          <el-col :span="6">
              <el-button size="samll" @click="btnCancel">取消</el-button>
              <el-button size="samll" type="primary" @click="btnOK">确定</el-button>
          </el-col>
      </el-row>
  </el-dialog>
</template>

<script>
import { getDepartments, addDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'

export default {
    props: {
        showDialog: {
            type: Boolean,
            default: false
        },
        treeNode: {
            type: Object,
            default: null
        }
    },
    data () {
        // 检查部门名称是否重复
        const checkNameRepeat = async (rule, value, callback) => {
            // value 是部门名称 要去和同级部门下的部门比较  有没有相同的。 有 则不通过， 无则通过
            // 先要获取最新的组织架构数据
            const { depts } = await getDepartments()
            // 去找同级部门下 有没有和 value 相同的数据
            // 找到同级部门的所有子部门
            let isRepeat = false
            if (this.formData.id) {
                // 有id 编辑部门模式
                // 编辑的数据  在数据库里有了!!!    同级部门下 我的名字不能与其他的部门名字进行重复
                // 首先找到我的同级部门( && 排除当前自身)     this.formData.id  就是我当前的id    我的pid是   this.formData.pid
                // depts.filter(item => item.pid === this.formData.pid)
                isRepeat = depts.filter(item => item.pid === this.treeNode.pid && item.id !== this.treeNode.id).some(item => item.name === value)
            } else {
                // 新增部门模式
              isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
            }
            // 如果 isRepeat 为 true 表示找到相同的部门名称
            isRepeat ? callback(new Error(`同级部门下已经存在这个${value}部门了`)) : callback()
        }
        const checkCodeRepeat = async (rule, value, callback) => {
            const { depts } = await getDepartments()
            let isRepeat = false
            if (this.formData.id) {
                // 有id 编辑模式
                // 要求: 不能有一样的 code
              isRepeat = depts.filter(item => item.id !== this.treeNode.id).some(item => item.code === value && value)
            } else {
                // 新增部门模式
                // 要求编码 和所有的部门编码都不能重复   由于历史数据有可能没有code  所以说这里加一个强制条件 => value值不为空
              isRepeat = depts.some(item => item.code === value && value)
            }
            isRepeat ? callback(new Error(`组织构架下已经存在这个${value}编码了`)) : callback()
        }
        return {
            // 定义表单数据
            formData: {
                name: '',
                code: '',
                manager: '',
                introduce: ''
            },
            rules: {
                name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
                    { min: 1, max: 50, message: '部门名称要求1-50个字符', trigger: 'blur' },
                    { trigger: 'blur', validator: checkNameRepeat}],
                code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
                    { min: 1, max: 50, message: '部门编码要求1-50个字符', trigger: 'blur' },
                    { trigger: 'blur', validator: checkCodeRepeat}],
                manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }],
                introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' },
                    { trigger: 'blur', min: 1, max: 300, message: '部门介绍要求1-50个字符' }]
            }, // 校验规则 {key: 数组}
            peoples: []
        }
    },
    computed: {
        showTitle() {
            return this.formData.id ? '编辑部门' : '新增部门'
        }
    },
    methods: {
        async getEmployeeSimple() {
            this.peoples = await getEmployeeSimple()
        },
        // 根据ID获取部门详情方法
        async getDepartDetail(id) {
            this.formData = await getDepartDetail(id)
            // 因为父组件调用子组件的方法  先设置了node 数据  直接调用方法
            // props 传值是异步的
        },
        btnOK() {
            // 手动校验表单
            this.$refs.deptForm.validate(async isOK => {
                if (isOK) {
                    if (this.formData.id) {
                        // 编辑部门
                        await updateDepartments(this.formData)
                    } else {
                    // 新增部门
                    // 这里我们将 ID 设置成 我的 pid
                    await addDepartments({ ...this.formData, pid: this.treeNode.id })
                    }
                    // 表单校验通过

                    // 通知 父组件 更新数据
                    this.$emit('addDepts') // 触发自定义事件
                    // 此时该 修改 showDialog值
                    // update:showDialog
                    this.$emit('update:showDialog', false)
                    // 关闭 dialog 的时候会触发 el-dialog的close事件    所以这里不需要在单独的重置数据了
                }
            })
        },
        btnCancel() {
            // 重置数据  因为resetFields 只能重置 表单上的数据 非表单上的  比如 编辑的id 不能重置
            this.formData = {
                name: '',
                code: '',
                manager: '',
                introduce: ''
            }
            // 关闭弹层
            this.$emit('update:showDialog', false)
            // 清除之前的校验   可以重置数据  只能重置 定义在 formdata中的数据
            this.$refs.deptForm.resetFields()
        }
    }
}
</script>

<style>

</style>