<template>
  <div :id="'charts'+r" class="chart"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, PropType, watchEffect, reactive, ref, toRaw, watch } from "vue"
  import { EChartsType, init, use } from "echarts/core"
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
      color: {
        type: String,
        default: '#409EFF'
      },
      unit: {
        type: String,
        default: ''
      },
      data: {
        type: Array as PropType<barData[]>,
        default: []
      }
    },
    setup(props, ctx) {
      const r = Math.random() * 1000
      const opt = reactive<echartsOption<BarSeriesOption | AxisPointerComponentOption>>({
        title: {
          text: props.title,
          left: "center"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'cross'
          }
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
          color: props.color

        }],
        xAxis: [{
          type: "category",
          data: ['a', "b", "c", "d"]
        }],
        yAxis: {
          type: 'value',
          name: props.title,
          position: 'left',
          axisLine: {
            show: true,
            lineStyle: {
              color: props.color
            }
          },
          axisLabel: {
            formatter: '{value} ' + (props.unit || '')
          }
        },
      })

      let chart: EChartsType | null = null

      watch(props, ({ data }) => {
        if (data && chart) {
          opt.xAxis[0].data = data.map(el => el.name)
          opt.series[0].data = data.map(el => {
            return el.alarm ? {
              value: el.value,
              itemStyle: {
                color: "#E6A23C"
              }
            } : el.value
          })
          chart.setOption(opt)
        }
      })

      onMounted(() => {
        chart = init(document.getElementById("charts" + r))
      })

      return { r }
    }
  });
</script>
<style scoped>
  .chart {
    height: 400px;
  }
</style>