<template>
  <!-- 雷达图   图标必须给高和宽 -->
  <div ref="myDiv" class="radar-echart" />
</template>

<script>
/* // 完整加载过程(引入所有包)
var echarts = require("echarts"); */
// 引入echarts主模块
var echarts = require('echarts/lib/echarts')
// 引入雷达图
require('echarts/lib/chart/radar')
// 引入提示框和标题组件
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')

export default {
  // 页面渲染完毕事件
  mounted() {
    const myChart = echarts.init(this.$refs.myDiv); // 得到图标实例
    myChart.setOption({
      title: {
        text: "绩效指数雷达图",
      },
      radar: {
        // shape: 'circle',
        // 每个区域的最高值
        indicator: [
          { name: "工作效率", max: 100 },
          { name: "考勤", max: 100 },
          { name: "积极性", max: 100 },
          { name: "帮助同事", max: 100 },
          { name: "自主学习", max: 100 },
          { name: "正确率", max: 100 },
        ],
      },
      series: [
        {
          name: "Budget vs spending",
          type: "radar",
          data: [
            {
              value: [10, 35, 100, 72, 100, 49],
              name: "张三",
            },
            {
              value: [59, 87, 46, 67, 93, 66],
              name: "李四",
            }
          ]
        }
      ]
    })
  }
}
</script>

<style>
.radar-echart {
  width: 600px;
  height: 400px;
}
</style>