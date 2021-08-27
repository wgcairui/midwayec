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
        </el-card>
      </el-col>
      <el-col :md="6">
        <el-card>
          <template #header>电池状态</template>
        </el-card>
      </el-col>
      <el-col :md="6">
        <el-card>
          <template #header>UPS状态</template>
        </el-card>
      </el-col>
    </el-row>
  </main>
</template>
<script lang="ts">
  import { computed, defineComponent, PropType, ref, watchEffect } from 'vue'
  import { Ec } from '../apis/interface'
  import { getProtocolSetup } from '../apis/lambda/setup'

  export default defineComponent({
    props: {
      dev: Object as PropType<Ec.DeviceData>
    },
    setup(props) {


      const sysProtocolSetup = ref<Uart.ProtocolConstantThreshold>()

      const statu = computed(() => {
        const resultMap = new Map(props.dev.data.map(el => [el.name, el]))
        const i: Uart.queryResultArgument[] = []
        const o: Uart.queryResultArgument[] = []
        const b: Uart.queryResultArgument[] = []
        const u: Uart.queryResultArgument[] = []
        if (sysProtocolSetup.value) {
          const Constant = sysProtocolSetup.value.Constant
          i.push(...Constant.InputStat.map(el => resultMap.get(el)))
          o.push(...Constant.OutStat.map(el => resultMap.get(el)))
          b.push(...Constant.BettyStat.map(el => resultMap.get(el)))
          u.push(...Constant.UpsStat.map(el => resultMap.get(el)))
        }

        console.log({ i, o, b, u });

        return { i, o, b, u }
      })

      watchEffect(async () => {
        if (!sysProtocolSetup.value) {
          sysProtocolSetup.value = await getProtocolSetup(props.dev.protocol)

          console.log(sysProtocolSetup.value);
        }

      })

      return { statu }

    },
  })
</script>
<style scoped lang="scss">
  main {
    margin: 1rem 0;
    .el-card {
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
  }
</style>