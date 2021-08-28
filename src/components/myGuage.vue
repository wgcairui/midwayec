<template>
  <div :id="id" class="chart"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, reactive, ref, watch } from "vue"
  import { EChartsType, init, use } from "echarts/core"
  import { GaugeChart, GaugeSeriesOption } from "echarts/charts"
  import { echartsOption } from "../interface"
  use([GaugeChart]);

  export default defineComponent({
    props: {
      /**
       * 标题
       */
      title: {
        type: String,
        default: ''
      },
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 100
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
      data: Number
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
      const color = ref(props.color)
      /**
       * 初始数据
       */
      const opt = reactive<echartsOption<GaugeSeriesOption>>({
        title: {
          text: props.title,
          left: "center"
        },

        series: [{
          type: "gauge",

          startAngle: 280,
          endAngle: 0,
          min: 0,
          max: 140,
          splitNumber: 5,
          // 
          itemStyle: {
            color: color.value,
            shadowColor: 'rgba(0,138,255,0.45)',
            shadowBlur: 5,
            shadowOffsetX: 2,
            shadowOffsetY: 2
          },
          progress: {
            show: true,
            roundCap: true,
            width: 5
          },
          //
          pointer: {
            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
            length: '80%',
            width: 3,
            offsetCenter: [0, '5%']
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 5
            }
          },
          axisLabel: {
            distance: 20,
            color: '#999',
            fontSize: 10
          },
          axisTick: {
            splitNumber: 2,
            lineStyle: {
              width: .5,
              color: '#999'
            }
          },
          splitLine: {
            length: 1,
            lineStyle: {
              width: 1,
              color: '#999'
            }
          },
          title: {
            show: true
          },
          detail: {
            backgroundColor: '#fff',
            borderColor: '#000',
            borderWidth: .5,
            width: '45%',
            lineHeight: 10,
            height: 10,
            borderRadius: 3,
            offsetCenter: [20, '25%'],
            valueAnimation: true,
            formatter: function (value) {
              return '{value|' + value.toFixed(1) + '}{unit|' + props.unit + '}';
            },
            rich: {
              value: {
                fontSize: 15,
                fontWeight: 'bolder',
                color: '#777'
              },
              unit: {
                fontSize: 15,
                color: '#999',
                padding: [0, 0, 0, 3]
              }
            }
          },
          data: [{
            value: props.data
          }]

        }],

      })

      let chart: EChartsType | null = null

      /**
             * 当prop.data变动更新
             */
      watch(props, ({ data, min, max }) => {
        if (chart) {
          const p = opt.series[0]
          p.min = min
          p.max = max
          if (data < min || data > max) color.value = '#F56C6C'
          if (!isNaN(data)) p.data[0].value = data
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
    height: 200px;
    width: 200px;
  }
</style>