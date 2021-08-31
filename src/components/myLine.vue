<template>
  <div :id="id" class="chart"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, PropType, reactive, watch } from "vue"
  import { EChartsType, init, use } from "echarts/core"
  import { LineChart, LineSeriesOption } from "echarts/charts"
  import { GridComponent, AxisPointerComponentOption, DataZoomComponent } from "echarts/components"
  import { barData, echartsOption } from "../interface"
  use([LineChart, GridComponent, DataZoomComponent]);

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
       * 线条颜色
       */
      color: {
        type: String,
        default: '#409EFF'
      },
      /**
       * y轴数值单位
       */
      unit: {
        type: String,
        default: ''
      },
      /**
       * 数据
       */
      data: {
        type: Array as PropType<barData[]>,
        default: [{ value: 33 }]
      }
    },
    setup(props) {
      /**
       * 图表domID
       */
      const id = 'charts' + Math.random() * 1000
      /**
       * 初始数据
       */
      const opt = reactive<echartsOption<LineSeriesOption | AxisPointerComponentOption>>({
        title: {
          text: props.title,
          left: "center"
        },
        legend: {
          data: [props.title]
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'cross'
          }
        },

        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100
          },
          {
            type: 'slider',
            show: true,
            yAxisIndex: [0],
            left: '93%',
            startValue: 0,
            endValue: 100
          }
        ],

        series: [{
          name: props.title,
          data: [],
          type: 'line',
          smooth: true,
          color: props.color,
          markPoint: {
            data: [
              {
                type: "max",
                name: "最大值",
              },
              {
                type: "min",
                name: "最小值"
              },
              {
                type: "average",
                name: "平均值"
              }
            ]
          }

        }],
        xAxis: [{
          type: 'category',
          data: []
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

      /**
       * 当prop.data变动更新
       */
      watch(props, ({ data }) => {
        if (data && chart) {
          opt.xAxis[0].data = data.map(el => el.name)
          const vals = data.map(el => el.value)
          opt.series[0].data = vals
          const [min, max] = [Math.min(...vals), Math.max(...vals)]
          opt.dataZoom[1].startValue = min > 100 ? min - 10 : min
          opt.dataZoom[1].endValue = max 
          chart.setOption(opt)
        }
      })



      /**
       * 初始化图表
       */
      onMounted(() => {
        chart = init(document.getElementById(id))
        chart.setOption(opt)
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