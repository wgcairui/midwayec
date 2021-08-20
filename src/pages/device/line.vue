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
      <el-form-item label="日期:">
        <el-date-picker v-model="time.date"></el-date-picker>
      </el-form-item>
      <el-form-item label="时间范围:">
        <el-time-picker is-range v-model="time.time"></el-time-picker>
      </el-form-item>
    </el-form>
    <my-line :data="chartData"></my-line>
  </main>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, watch } from "vue";
  import { useRoute } from "vue-router";
  import { Ec } from "../../apis/interface";
  import { clientresultcolltions } from "../../apis/lambda/history";
  import { getBindDevs } from "../../apis/lambda/setup";
  import myLine from "../../components/myLine.vue"
  import { Milliseconds } from "../../util";
  export default defineComponent({
    components: { myLine },
    setup() {
      const route = useRoute()
      const Dates = new Date();
      const time = reactive({
        date: new Date(),
        time: [
          new Date(
            Dates.getFullYear(),
            Dates.getMonth(),
            Dates.getDay(),
            Dates.getHours() - 2,
            Dates.getMinutes()
          ),
          new Date(
            Dates.getFullYear(),
            Dates.getMonth(),
            Dates.getDay(),
            Dates.getHours(),
            Dates.getMinutes()
          ),
        ],
      });

      const { devid, name } = route.query.value as any;
      const chartData = ref<Ec.chartData>({ columns: ["time", name], rows: [] });
      const FecthLine = async () => {
        const {
          time: [start, end],
        } = time;

        const result = await clientresultcolltions(
          devid,
          name,
          new Date(start).getTime(),
          new Date(end).getTime()
        );
        chartData.value.rows = result
          .reduce(
            (pre, cur) => {
              if (pre[pre.length - 1].data.value !== cur.data.value) pre.push(cur);
              return pre;
            },
            [result[0]]
          )
          .map((el) => ({
            time: Milliseconds(el.timeStamp),
            [name]: el.data.value,
          }));
      }
      watch(time, () => FecthLine());
      return { time, chartData };
    },
  });
</script>
