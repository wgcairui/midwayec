<template>
  <div :id="id" class="chart"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, PropType, reactive, watch } from "vue"
  import { EChartsType, init, use } from "echarts/core"
  import { BarChart, BarSeriesOption } from "echarts/charts"
  import { GridComponent, AxisPointerComponentOption } from "echarts/components"
  import { barData, echartsOption } from "../interface"
  use([BarChart, GridComponent]);

  export default defineComponent({
    props: {
      /**
       * 标题
       */
      title: {
        type: String,
        default: ''
      },
      /**
       * 颜色
       */
      color: {
        type: String,
        default: '#409EFF'
      },
      /**
       * Y轴单位
       */
      unit: {
        type: String,
        default: ''
      },
      /**
       * 图表数据
       */
      data: {
        type: Array as PropType<barData[]>,
        default: []
      }
    },
    emits: {
      /**
       * 替换原生click事件
       */
      click(event: any) {
        return event
      }
    },
    setup(props, ctx) {
      const id = 'charts' + Math.random() * 1000
      /**
       * 初始数据
       */
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
          name: props.title,
          type: "bar",
          barWidth: 30,
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
          min: 0,
          max: 100,
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

      /**
             * 当prop.data变动更新
             */
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

      /**
             * 初始化图表
             */
      onMounted(() => {
        chart = init(document.getElementById(id))
        chart.on("click", event => {
          ctx.emit("click", event)
        })
      })

      return { id, opt }
    }
  });
</script>
<style scoped>
  .chart {
    height: 400px;
  }
</style>