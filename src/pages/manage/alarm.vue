<template>
  <main>
    <el-card>
      <template #header>告警设备配置</template>
      <el-row>
        <el-col :span="6">
          <section class="dev-list">
            <el-radio-group v-model="data.devId" @change="updateAlarm">
              <el-radio v-for="dev in alarmDevs" :label="dev._id" :key="dev._id">{{dev.alias}}</el-radio>
            </el-radio-group>
          </section>
        </el-col>
        <el-col :span="18">
          <el-tabs>
            <el-tab-pane label="显示参数"></el-tab-pane>
            <el-tab-pane label="约束"></el-tab-pane>
            <el-tab-pane label="阈值"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
  </main>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from "vue-demi";
  import { Ec } from "../../apis/interface";
  import { getAlarmDevs } from "../../apis/lambda/data";
  import { getProtocol } from "../../apis/lambda/setup";


  const alarmDevs = ref<Ec.Mountdev[]>([])

  const data = reactive({
    devId: "",
    showTag: [] as string[],

  })

  const sysSetup = reactive<Pick<Uart.ProtocolConstantThreshold, "Threshold" | "ShowTag" | "AlarmStat">>({
    ShowTag: [],
    Threshold: [],
    AlarmStat: []
  })

  onMounted(() => {
    getAlarmDevs().then(el => alarmDevs.value = el)
  })

  const updateAlarm = async (id: string) => {
    const dev = alarmDevs.value.find(el => el._id === id)
    const protocol = await getProtocol(dev.protocol)

    console.log(protocol);


  }



</script>
<style lang="scss" scoped>
  .dev-list {
    padding: 1rem;
    .el-radio-group {
      display: flex;
      flex-direction: column;
    }
  }
</style>