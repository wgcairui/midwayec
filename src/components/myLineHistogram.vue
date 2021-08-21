<template>
  <div id="charts" class="chart"></div>
</template>

<script lang="ts">
  import { ref, defineComponent, onMounted } from "vue";
  import { use, init } from 'echarts/core';
  import { PieChart, PieSeriesOption } from 'echarts/charts';
  import { GridComponent, LegendComponent } from 'echarts/components';
  import { echartsOption } from "../interface"

  // 注册必须的组件
  use([PieChart, GridComponent, LegendComponent]);

  export default defineComponent({
    name: "HelloWorld",
    setup: () => {
      const option = ref<echartsOption<PieSeriesOption>>({
        title: {
          text: "Traffic Sources",
          left: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: "vertical",
          left: "left",
          data: ["Direct", "Email", "Ad Networks", "Video Ads", "Search Engines"]
        },

        series: [
          {
            name: "Traffic Sources",
            type: "pie",
            //radius: "75%",
            //center: ["80%", "30%"],
            data: [
              { value: 335, name: "Direct" },
              { value: 310, name: "Email" },
              { value: 234, name: "Ad Networks" },
              { value: 135, name: "Video Ads" },
              { value: 1548, name: "Search Engines" }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      });

      onMounted(() => {
        const chart = init(document.getElementById("charts"),"dark")
        chart.setOption(option.value)
      })

      return { option };
    }
  });
</script>

<style scoped>
  .chart {
    height: 400px;
  }
</style>
