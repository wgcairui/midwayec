<template>
  <main>
    <el-card>
      <template #header>告警设备配置</template>
      <el-row v-loading="data.loading">
        <el-col :span="4">
          <section class="dev-list">
            <el-radio-group v-model="data.devId" @change="updateAlarm">
              <el-radio v-for="dev in alarmDevs" :label="dev._id" :key="dev._id">{{dev.alias}}</el-radio>
            </el-radio-group>
          </section>
        </el-col>
        <el-col :span="20">
          <el-tabs v-loading="data.loading2">
            <el-tab-pane label="显示参数">
              <el-checkbox-group v-model="data.showTag" @change="submitShowTag">
                <el-checkbox v-for="(show,key) in Setup.ShowTag" :key="show+key" :label="show"></el-checkbox>
              </el-checkbox-group>
            </el-tab-pane>
            <el-tab-pane label="约束">
              <el-form size="small" label-suffix=":" label-width="200px">
                <el-form-item
                  v-for="row in protocolArguments.AlarmStat"
                  :key="row.name"
                  :label="row.name"
                >
                  <el-checkbox-group v-model="row.alarmStat" @change="submitAlarmStat" size="small">
                    <el-checkbox
                      v-for="val in row.show"
                      :key="val.text"
                      :label="val.value"
                    >{{val.text}}</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="阈值">
              <el-card>
                <el-form inline size="small" label-suffix=":">
                  <el-form-item label="参数">
                    <el-select v-model="data.Threshold.name">
                      <el-option
                        v-for="name in protocolArguments.Threshold"
                        :key="name"
                        :value="name"
                        :label="name"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="最小值">
                    <el-input type="number" v-model="data.Threshold.min" />
                  </el-form-item>
                  <el-form-item label="最大值">
                    <el-input type="number" v-model="data.Threshold.max" />
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      round
                      size="small"
                      type="primary"
                      @click="addThreshold"
                      :disabled="!data.Threshold.name"
                    >提交</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
              <el-table :data="Setup.Threshold">
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="min" label="最小值" />
                <el-table-column prop="max" label="最大值" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="text" size="small" @click="modifyThreshold(scope.row)">修改</el-button>
                    <el-button type="text" size="small" @click="deleteThreshold(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
  </main>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref, toRaw } from "vue-demi";
  import { Ec } from "../../apis/interface";
  import { getAlarmDevs } from "../../apis/lambda/data";
  import { getProtocol, getProtocolSetup, getUserConstant, updateConstantAlarmStatu, updateConstantShowTag, updateConstantThreshold } from "../../apis/lambda/setup";

  interface AlarmStat {
    name: string
    show: {
      text: string
      value: string
    }[]
    alarmStat: string[]
  }

  const alarmDevs = ref<Ec.Mountdev[]>([])

  const data = reactive({
    loading: false,
    loading2: false,
    devId: "",
    showTag: [] as string[],
    Threshold: {
      name: '',
      min: 0,
      max: 100
    }
  })

  const protocolArguments = reactive({
    Threshold: [] as string[],
    AlarmStat: [] as AlarmStat[]
  })

  const Setup = reactive<Pick<Uart.ProtocolConstantThreshold, "Threshold" | "ShowTag">>({
    ShowTag: [],
    Threshold: []
  })

  onMounted(() => {
    data.loading = true
    getAlarmDevs().then(el => {
      data.loading = false
      alarmDevs.value = el
    })

  })

  /**
   * 重新加载配置
   */
  const updateAlarm = (id: string) => {
    data.loading2 = true
    data.devId = id
    const { protocol } = alarmDevs.value.find(el => el._id === id)
    data.Threshold.name = ""
    getProtocolSetup(protocol).then(async ({ Threshold, AlarmStat, ShowTag }) => {
      Setup.ShowTag = ShowTag || []
      Setup.Threshold = Threshold || []

      /**
       * 
       */
      const mapsAlarmStat = new Map<string, Pick<Uart.ConstantAlarmStat, "alarmStat" | "name">>((AlarmStat || []).map(el2 => [el2.name, el2]))
      //
      const user = await getUserConstant(id)
      if (user.ShowTag) {
        data.showTag = user.ShowTag
      }
      if (user.Threshold) {
        const maps = new Map((Threshold || []).map(el2 => [el2.name, el2]))
        user.Threshold.forEach(el => {
          maps.set(el.name, el)
        })
        Setup.Threshold = [...maps.values()]
      }
      if (user.AlarmStat) {
        user.AlarmStat.forEach(el => {
          mapsAlarmStat.set(el.name, el)
        })
      }

      getProtocol(protocol).then(({ instruct }) => {

        const t = [] as string[]
        const a = [] as AlarmStat[]
        instruct
          .map(el => el.formResize)
          .flat()
          .forEach(({ name, isState, unit }) => {
            if (isState) {
              const units = unit
                .replace(/(\{|\}| )/g, "")
                .split(",")
                .map((el4) => el4.split(":"))
                .map((el5) => ({ text: el5[1], value: el5[0] }));
              a.push({ name, show: units, alarmStat: [] })

            } else {
              t.push(name)
            }
          })
        protocolArguments.Threshold = [...new Set(t)]
        protocolArguments.AlarmStat = a.map(el => {
          if (mapsAlarmStat.has(el.name)) {
            el.alarmStat = mapsAlarmStat.get(el.name).alarmStat
          }
          return el
        })
        data.loading2 = false
      })
    })
  }

  const submitAlarmStat = () => {
    const alarms = toRaw(protocolArguments.AlarmStat).filter(el => el.alarmStat.length > 0).map<Pick<Uart.ConstantAlarmStat, "alarmStat" | "name">>(({ name, alarmStat }) => ({ name, alarmStat }))
    updateConstantAlarmStatu(data.devId, alarms)
  }

  /**
   * 提交显示参数
   */
  const submitShowTag = (show: string) => {
    updateConstantShowTag(data.devId, [...new Set(show)])
  }

  /**
   * 提交阈值配置
   */
  const submitThreshold = () => {
    const Threshold = toRaw(Setup).Threshold
    updateConstantThreshold(data.devId, Threshold)
  }

  /**
   * 添加或修改阈值
   */
  const addThreshold = () => {
    const index = Setup.Threshold.findIndex(el => el.name === data.Threshold.name)
    if (index > -1) {
      Setup.Threshold[index].min = data.Threshold.min
      Setup.Threshold[index].max = data.Threshold.max
    } else Setup.Threshold.push(data.Threshold)
    submitThreshold()
  }

  /**
   * 修改阈值
   */
  const modifyThreshold = ({ name, min, max }: Uart.Threshold) => {
    data.Threshold.name = name
    data.Threshold.max = max
    data.Threshold.min = min
  }

  /**
   * 删除阈值
   */
  const deleteThreshold = (row: Uart.Threshold) => {
    const index = Setup.Threshold.findIndex(el => el.name === row.name)
    Setup.Threshold.splice(index, 1)
    submitThreshold()
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

  .alarm-list {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    .label {
      margin-right: 1rem;
    }
    .el-checkbox {
      margin-right: 0.5rem;
    }
  }
</style>