<template>
  <main class="p-4">
    <!-- <b-form-group>
      <my-form label="">
        <b-form-datepicker v-model="time.date" :max="new Date()"></b-form-datepicker>
      </my-form>
      <my-form label="开始时间:">
        <b-form-timepicker label-hours="24" v-model="time.startTime"></b-form-timepicker>
      </my-form>
      <my-form label="结束时间:">
        <b-form-timepicker v-model="time.endTime"></b-form-timepicker>
      </my-form>
    </b-form-group>-->
    <el-form inline>
      <el-form-item label="时间范围:">
        <el-date-picker
          v-model="time"
          type="datetimerange"
          :shortcuts="shortcuts"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <my-line ref="line"></my-line>
  </main>
</template>
<script lang="ts" setup>
  import { LineSeriesOption, AxisPointerComponentOption, getInstanceByDom } from "echarts";
  import { onMounted, reactive, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { clientresultcolltions } from "../../apis/lambda/history";
  import myLine from "../../components/myLine.vue"
  import { echartsOption } from "../../interface";

  const route = useRoute()
  const { id, name } = route.query as any as Record<string, string>;
  if (!id || !name) useRouter().back()

  const Dates = new Date();
  const ends = new Date()
  Dates.setHours(Dates.getHours() - 2)
  const time = ref([Dates, ends]);

  const shortcuts = [{
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end]
    }
  }, {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end]
    }
  }, {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end]
    }
  }]

  /**
       * 历史信息组件实例
       */
  const line = ref<{ opt: echartsOption<LineSeriesOption | AxisPointerComponentOption>, id: string }>()


  const FecthLine = async () => {
    const [start, end] = time.value
    console.log(new Date(start).toLocaleString(), new Date(end).toLocaleString());

    const data = await clientresultcolltions(id, name, new Date(start).getTime(), new Date(end).getTime())
    const x: string[] = []
    const y: number[] = []
    data.forEach(el => {
      x.push(new Date(el.timeStamp).toTimeString().split(" ")[0])
      y.push(parseFloat(el.data.parseValue))
    })

    if (line.value && "type" in line.value.opt.xAxis) {
      // 组装数据
      (line.value.opt.title as any).text = name
      line.value.opt.xAxis.data = x
      line.value.opt.series[0].data = y
      line.value.opt.series[0].name = name
      // 获取line实例
      const chart = getInstanceByDom(document.getElementById(line.value.id))
      chart.setOption(line.value.opt)
      // 重新设置大小
      chart.resize({
        width: "auto",
        height: "auto"
      })
    }


  }
  const update = () => FecthLine()
  onMounted(() => FecthLine())
</script>
