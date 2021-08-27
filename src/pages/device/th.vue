<template>
  <main>
    <my-bar title="温度" :data="chartDate.t" unit="℃" @click="thShow"></my-bar>
    <my-bar title="湿度" :data="chartDate.h" unit="%" color="#67C23A" @click="thShow"></my-bar>

    <el-dialog title="1小时数据" v-model="dialogVisible" fullscreen :before-close="handleClose">
      <my-line ref="line"></my-line>
    </el-dialog>
    <section v-for="dev in device" :key="dev._id" class="mb-3">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{dev.alias}}</span>
          </div>
        </template>
        <el-table :data="dev.data">
          <el-table-column prop="name" label="参数"></el-table-column>
          <el-table-column prop="parseValue" label="值"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" size="small" @click="showModel(dev._id,scope.row.name)">趋势</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </section>
  </main>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from "vue";
  import { useStore } from "vuex";
  import { key } from "../../vuex";
  import myBar from "../../components/myBar.vue"
  import myLine from "../../components/myLine.vue"
  import { barData, echartsEvent, echartsOption } from "../../interface";
  import { clientresultcolltions } from "../../apis/lambda/history";
  import { LineSeriesOption, AxisPointerComponentOption, getInstanceByDom } from "echarts";
  import { ElMessageBox } from "element-plus";
  export default defineComponent({
    components: { myBar, myLine },
    setup() {
      const store = useStore(key)
      const device = computed(() => store.state.th.sort((a, b) => a.pid - b.pid));

      const dialogVisible = ref(false)

      /**
       * 历史信息组件实例
       */
      const line = ref<{ opt: echartsOption<LineSeriesOption | AxisPointerComponentOption>, id: string }>()

      /**
       * 温湿度柱状图组件数据
       */
      const chartDate = computed(() => {
        const th = device.value;
        const t: barData[] = []
        const h: barData[] = []
        if (th.length > 0) {
          th.forEach(el => {
            el.data.forEach(el2 => {
              switch (el2.name) {
                case "温度":
                  t.push({
                    name: el.alias,
                    value: parseFloat(el2.parseValue),
                    alarm: el2.alarm
                  })
                  break;

                case "湿度":
                  h.push({
                    name: el.alias,
                    value: parseFloat(el2.parseValue),
                    alarm: el2.alarm
                  })
                  break;
              }
            })
          })
        }
        return { t, h };
      });

      /**
       * 触发显示历史数据
       */
      const showModel = async (id: string, name: string) => {
        dialogVisible.value = true
        const start = Date.now() - (36e5)
        const data = await clientresultcolltions(id, name, start)
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

      /**
       * 绑定图表点击事件
       */
      const thShow = (event: echartsEvent) => {
        const { _id } = device.value.find(el => el.alias === event.name)
        showModel(_id, event.seriesName)
      }

      /**
       * model关闭触发
       */
      const handleClose = (done: any) => {
        ElMessageBox.confirm('确认关闭', { title: "关闭历史数据", type: "info" })
          .then(_ => {
            done();
          })
          .catch(_ => { });
      }

      return { line, device, chartDate, thShow, handleClose, dialogVisible, showModel };
    },
  });
</script>
<style scoped>
  .el-card {
    margin: 1rem 0;
  }
</style>
