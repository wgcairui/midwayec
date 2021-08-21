<template>
  <div id="charts" class="chart"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, PropType, watchEffect, reactive } from "vue"
  import { init, use } from "echarts/core"
  import { BarChart, BarSeriesOption } from "echarts/charts"
  import { GridComponent, AxisPointerComponentOption } from "echarts/components"
  import { barData, echartsOption } from "../interface"
  use([BarChart, GridComponent]);
  
  export default defineComponent({
    props: {
      title: {
        type: String,
        default: ''
      },
      data: {
        type: Array as PropType<barData[]>,
        default: []
      }
    },
    setup(props, ctx) {
      const opt = reactive<echartsOption<BarSeriesOption | AxisPointerComponentOption>>({
        title: {
          text: props.title,
          left: "center"
        },

        series: [{
          name: "th",
          type: "bar",
          data: [11, {
            value: 22,
            itemStyle: {
              color: "red"
            }
          }, 33, 44],
          label: {
            show: true,
            position: "top"
          },

        }],
        xAxis: [{
          type: "category",
          data: ['a', "b", "c", "d"]
        }],
        yAxis: {
          type: 'value',
        },
      })

      watchEffect(() => {
        const data = props.data
        opt.xAxis[0].data = data.map(el => el.name)
        opt.series[0].data = data.map(el => {
          return el.alarm ? {
            value: el.value,
            itemStyle: {
              color: "red"
            }
          } : el.value
        })
      })



      onMounted(() => {
        const chart = init(document.getElementById("charts"))
        chart.setOption(opt)
      })
    }
  });
</script>
<style scoped>
  .chart {
    height: 400px;
  }
</style>