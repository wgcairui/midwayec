<template>
  <div id="charts" class="chart"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref } from "vue"
  import { init, use } from "echarts/core"
  import { BarChart, BarSeriesOption } from "echarts/charts"
  import { GridComponent, AxisPointerComponentOption } from "echarts/components"
  import { echartsOption } from "../interface"
  use([BarChart, GridComponent]);
  export default defineComponent({
    props: {
      data: {
        type: Object,
        default() {
          return {
            columns: ["日期", "访问用户", "下单用户", "下单率"],
            rows: [
              { 日期: "1/1", 访问用户: 1393, 下单用户: 1093, 下单率: 0.32 },
              { 日期: "1/2", 访问用户: 3530, 下单用户: 3230, 下单率: 0.26 },
              { 日期: "1/3", 访问用户: 2923, 下单用户: 2623, 下单率: 0.76 },
              { 日期: "1/4", 访问用户: 1723, 下单用户: 1423, 下单率: 0.49 },
              { 日期: "1/5", 访问用户: 3792, 下单用户: 3492, 下单率: 0.323 },
              { 日期: "1/6", 访问用户: 4593, 下单用户: 4293, 下单率: 0.78 },
            ],
          };
        },
      },
    },
    setup(props, ctx) {
      const opt = ref<echartsOption<BarSeriesOption | AxisPointerComponentOption>>({
        title: {
          text: "温度",
          left: "center"
        },

        series: {
          name: "th",
          type: "bar",
          data: [
            ["b", 33]
          ],
          label: {
            show: true,
            position: "top"
          },


        },
        xAxis: {
          type: "category",
          data: ['b']
        },
        yAxis: {
          type: 'value',
        },
      })

      onMounted(() => {
        const chart = init(document.getElementById("charts"))
        chart.setOption(opt.value)
      })
    }
  });
</script>
<style scoped>
  .chart {
    height: 400px;
  }
</style>