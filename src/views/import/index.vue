<template>
  <upload-excel :on-success="success" />
</template>

<script>
import { importEmployee } from '@/api/employees'
export default {
    methods: {
        async success({ header, results }) {
            // debugger
            // header中的数据 是中文 results中数据也是中文
            // 新增员工的数据属性是一致的
            const userRelations = {
                '入职日期': 'timeOfEntry',
                '手机号': 'mobile',
                '姓名': 'username',
                '转正日期': 'correctionTime',
                '工号': 'workNumber'
            }
            // var newArr = []
            // results.forEach(item => {
            //     var userInfo = {}
            //     // console.log(Object.keys(item)) // ["手机号", "姓名", "入职日期", "转正日期", "工号"]
            //     Object.keys(item).forEach(key => {
            //         // 现在key是中文 => "手机号", "姓名", "入职日期", "转正日期", "工号"
            //         // userRelations[key] 是英文  // console.log(userRelations[key]) // 'mobile username timeOfEntry correctionTime workNumber
            //         userInfo[userRelations[key]] = item[key] // 将缘来中文对应的值 赋值给缘来英文对应的值
            //     })
            //     newArr.push(userInfo)
            // })
            var newArr = results.map(item => {
                var userInfo = {}
                Object.keys(item).forEach(key => {
                    if(userRelations[key] === 'timeOfEntry' || userRelations[key] === 'correctionTime') {
                        // userInfo[userRelations[key]] = this.formatDate(item[key])
                        // 后端接口 限制了 不能是字符串 要求转化成时间类型
                        userInfo[userRelations[key]] = new Date(this.formatDate(item[key], '/')) // 只有这样才能存入数据库
                        console.log(userInfo[userRelations[key]]) 
                    } else { 
                        userInfo[userRelations[key]] = item[key]
                    }
                })
                return userInfo
            })
            await importEmployee(newArr) // 接收一个数组
            this.$message.success('导入excel成功')
            this.$router.back() // 回到上一个页面
        },
        // 转化excel的日期格式
        formatDate(numb, format) {
          const time = new Date((numb - 1) * 24 * 3600000 + 1)
          time.setYear(time.getFullYear() - 70)
          const year = time.getFullYear() + ''
          const month = time.getMonth() + 1 + ''
          const date = time.getDate() - 1 + ''
          if (format && format.length === 1) {
            return year + format + month + format + date
          }
          return year + (month < 10 ? '0' + month : month) + (date < 10 ? '0' + date : date)
        }
    }
}
</script>

<style>

</style>