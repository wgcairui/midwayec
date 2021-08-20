<template>
  <ve-histogram :data="data" :extend="extend"></ve-histogram>
</template>

<script>
  import { defineComponent } from "vue"
  import VeHistogram from "v-charts/lib/histogram.common"
  import "echarts/lib/component/markLine";
  import "echarts/lib/component/markPoint";
  import "echarts/lib/component/dataZoom";
  import "echarts/lib/component/toolbox";
  export default defineComponent({
    components: { VeHistogram },
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
    data() {
      const markLine = {
        data: [
          {
            name: "平均线",
            type: "average",
          },
        ],
      };
      const markPoint = {
        data: [
          {
            name: "最大值",
            type: "max",
          },
        ],
      };
      const extend = {
        series: {
          label: { show: true, position: "top" },
        },
      };
      return {
        markLine,
        markPoint,
        extend,
      };
    },
  });
</script>
