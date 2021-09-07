<template>
  <main>
    <el-row>
      <el-col :md="8">
        <el-card>
          <template #header>电压</template>
          <el-row>
            <el-col :md="24/statu.v.length" v-for="val in statu.v" :key="val.name">
              <my-guage-em
                :title="val.name"
                :min="0"
                :max="400"
                :unit="val.unit"
                :data="parseFloat(val.parseValue)"
              ></my-guage-em>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :md="8">
        <el-card>
          <template #header>电流</template>
          <el-row>
            <el-col :md="24/statu.c.length" v-for="val in statu.c" :key="val.name">
              <my-guage-em
                :title="val.name"
                :unit="val.unit"
                :data="parseFloat(val.parseValue)"
              ></my-guage-em>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :md="8">
        <el-card>
          <template #header>功率因数</template>
          <el-row>
            <el-col :md="24/statu.f.length" v-for="val in statu.f" :key="val.name">
              <my-guage-em
                :title="val.name"
                :unit="val.unit"
                :data="parseFloat(val.parseValue)"
              ></my-guage-em>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row>
      <el-col :md="12">
        <el-card>
          <template #header>约束</template>
          <el-row>
            <el-col :md="8" v-for="val in statu.t" :key="val.name+val.min">
              <my-guage-em
                :title="val.name"
                :min="val.min"
                :max="val.max"
                :unit="val.unit"
                :data="parseFloat(val.parseValue)"
              ></my-guage-em>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </main>
</template>
<script lang="ts">
  import { computed, defineComponent, onMounted, PropType, ref } from 'vue'
  import { Ec } from '../apis/interface'
  import { getProtocolSetup } from '../apis/lambda/setup'
  import myGuageEm from "./myGuageEm.vue"
  import myOprate from "./myOprate.vue"
  export default defineComponent({
    props: {
      dev: Object as PropType<Ec.DeviceData>
    },
    components: { myGuageEm, myOprate },
    setup(props) {

      const sysProtocolSetup = ref<Uart.ProtocolConstantThreshold>()

      /**
       * ups状态
       */
      const statu = computed(() => {
        const resultMap = new Map(props.dev.data.map(el => [el.name, el]))
        const v: Uart.queryResultArgument[] = []
        const c: Uart.queryResultArgument[] = []
        const f: Uart.queryResultArgument[] = []
        //const u: Uart.queryResultArgument[] = []
        const t: (Uart.queryResultArgument & Uart.Threshold)[] = []
        if (sysProtocolSetup.value) {
          const Constant = sysProtocolSetup.value.Constant
          const Thread = sysProtocolSetup.value.Threshold
          v.push(...Constant.voltage.map(el => resultMap.get(el)))
          c.push(...Constant.current.map(el => resultMap.get(el)))
          f.push(...Constant.factor.map(el => resultMap.get(el)))
          t.push(...Thread.map(el => ({ ...resultMap.get(el.name)!, ...el })))
        }

        console.log({ v, c, f, t });

        return { v, c, f, t }
      })

      onMounted(async () => {
        sysProtocolSetup.value = await getProtocolSetup(props.dev.protocol)
      })

      return { statu }

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