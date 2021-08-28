<template>
  <main>
    <el-row>
      <el-col :md="6">
        <el-card>
          <template #header>输入状态</template>
          <ul>
            <li v-for="val in statu.i" :key="val.name">
              {{val.name}}
              <b>{{val.parseValue || '---'}}{{val.unit}}</b>
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :md="6">
        <el-card>
          <template #header>输出状态</template>
          <ul>
            <li v-for="val in statu.o" :key="val.name">
              {{val.name}}
              <b>{{val.parseValue || '---'}}{{val.unit}}</b>
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :md="6">
        <el-card>
          <template #header>电池状态</template>
          <ul>
            <li v-for="val in statu.b" :key="val.name">
              {{val.name}}
              <b>{{val.parseValue || '---'}}{{val.unit}}</b>
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :md="6">
        <el-card>
          <template #header>UPS状态</template>
          <ul>
            <li v-for="val in statu.u" :key="val.name">
              {{val.name}}
              <b>{{val.parseValue || '---'}}{{val.unit}}</b>
            </li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :md="12">
        <el-card>
          <template #header>约束</template>
          <el-row>
            <el-col :md="8" v-for="val in statu.t" :key="val.name+val.min">
              <my-guage
                :title="val.name"
                :min="val.min"
                :max="val.max"
                :unit="val.unit"
                :data="parseFloat(val.parseValue)"
              ></my-guage>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :md="12" class="oprate">
        <el-card>
          <template #header>操作指令</template>
          <my-oprate :uart="dev.uart" :oprates="oprate"></my-oprate>
        </el-card>
      </el-col>
    </el-row>
  </main>
</template>
<script lang="ts">
  import { computed, defineComponent, onMounted, PropType, ref } from 'vue'
  import { Ec } from '../apis/interface'
  import { getProtocolSetup } from '../apis/lambda/setup'
  import myGuage from "./myGuage.vue"
  import myOprate from "./myOprate.vue"
  export default defineComponent({
    props: {
      dev: Object as PropType<Ec.DeviceData>
    },
    components: { myGuage, myOprate },
    setup(props) {

      const sysProtocolSetup = ref<Uart.ProtocolConstantThreshold>()

      /**
       * ups状态
       */
      const statu = computed(() => {
        const resultMap = new Map(props.dev.data.map(el => [el.name, el]))
        const i: Uart.queryResultArgument[] = []
        const o: Uart.queryResultArgument[] = []
        const b: Uart.queryResultArgument[] = []
        const u: Uart.queryResultArgument[] = []

        const t: (Uart.queryResultArgument & Uart.Threshold)[] = []
        if (sysProtocolSetup.value) {
          const Constant = sysProtocolSetup.value.Constant
          const Thread = sysProtocolSetup.value.Threshold
          i.push(...Constant.InputStat.map(el => resultMap.get(el)))
          o.push(...Constant.OutStat.map(el => resultMap.get(el)))
          b.push(...Constant.BettyStat.map(el => resultMap.get(el)))
          u.push(...Constant.UpsStat.map(el => resultMap.get(el)))
          t.push(...Thread.map(el => ({ ...resultMap.get(el.name)!, ...el })))
        }
        return { i, o, b, u, t }
      })

      /**
       * ups操作指令
       */
      const oprate = computed(() => {
        let oprates: Uart.OprateInstruct[] = []
        if (sysProtocolSetup.value && sysProtocolSetup.value.OprateInstruct) {
          oprates = sysProtocolSetup.value.OprateInstruct
        }
        return oprates
      })

      onMounted(async () => {
        sysProtocolSetup.value = await getProtocolSetup(props.dev.protocol)
      })

      return { statu, oprate }

    },
  })
</script>
<style scoped lang="scss">
  main {
    margin: 1rem 0;
    .el-card {
      height: 100%;
      margin: 0 0.3rem;
      ul {
        padding: 0;
        li {
          list-style: none;
          padding: 0;
          margin: 0;
        }
      }
    }
    .el-row {
      margin: 0.5rem 0;
    }
  }

  .oprate {
    .el-card {
      margin: 0;
      .el-body {
        display: flex;
      }
      .el-button {
        margin: 0.3rem;
      }
    }
  }
</style>