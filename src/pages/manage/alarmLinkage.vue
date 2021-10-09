

<template>
  <main>
    <el-card>
      <template #header>设置联动告警条件</template>
      <el-form label-suffix=":" size="small" label-width="50px">
        <el-form-item label="条件">
          <el-form inline size="small">
            <el-form-item>
              <el-cascader
                v-model="condition.name"
                :options="conditionsOpts"
                :props="{ expandTrigger: 'hover' }"
                filterable
                placeholder="选择点值"
              ></el-cascader>
            </el-form-item>
            <el-form-item>
              <el-select v-model="condition.operator">
                <el-option v-for="o in operators" :label="o.label" :value="o.value" :key="o.label" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model="condition.value"></el-input>
            </el-form-item>
          </el-form>
        </el-form-item>
        <el-form-item label="执行">
          <el-form inline size="small">
            <el-form-item>
              <el-select v-model="oprate.name">
                <el-option v-for="i in oprates" :key="i.label" :label="i.label" :value="i.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="oprate.value">
                <el-option v-for="i in [0,1]" :key="i" :label="i" :value="i"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addCondition">添加条件</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-table :data="alarmLinkages">
      <el-table-column label="条件" width="500">
        <template #default="scope">
          {{scope.row.condition.name[0]+'/'+(DiNames[scope.row.condition.name[1]]||scope.row.condition.name[1])}}
          <b>{{operatorObj[scope.row.condition.operator]}}</b>
          {{scope.row.condition.value}}
        </template>
      </el-table-column>
      <el-table-column label="执行" width="500">
        <template #default="scope">
          {{DoNames[scope.row.oprate.name]}}
          <b>=</b>
          {{scope.row.oprate.value}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
            type="danger"
            icon="el-icon-delete"
            circle
            @click="delCondition(scope.row.key)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
  </main>
</template>
<script lang="ts" setup>
  import { computed, onMounted, reactive, ref, toRaw } from "vue";
  import { CascaderOption } from "element-plus/lib/el-cascader-panel";
  import { getAlarmLinkageConditionsOpts, getAlarmLinkageOprates, getAlarmLinkages } from "../../apis/lambda/data"
  import { Ec } from "../../apis/interface";
  import { addAlarmLinkage, delAlarmLinkage } from "../../apis/lambda/setup";
  import { ElMessage, ElMessageBox } from "element-plus";

  /**
   * 条件
   */
  const condition = reactive<Ec.alarmLinkageCondition>({
    name: [],
    operator: "===",
    value: "0"
  })

  /**
   * 执行
   */
  const oprate = reactive<Ec.alarmLinkageOprate>({
    name: "o1",
    value: 1
  })

  const conditionsOpts = ref<CascaderOption[]>([])
  const oprates = ref<CascaderOption[]>([])
  const alarmLinkages = ref<Ec.alarmLinkage[]>([])

  const operators: CascaderOption[] = [
    {
      label: "等于",
      value: "==="
    },
    {
      label: "不等于",
      value: "!=="
    },
    {
      label: "大于",
      value: ">"
    },
    {
      label: "小于",
      value: "<"
    },
    {
      label: "大于等于",
      value: ">="
    },
    {
      label: "小于等于",
      value: "<="
    }
  ]

  const operatorObj = Object.assign({}, ...operators.map(({ label, value }) => ({ [value]: label })))
  const DoNames = computed(() => {
    return Object.assign({}, ...oprates.value.map(({ label, value }) => ({ [value]: label })))
  })

  const DiNames = computed(() => {
    const Di = conditionsOpts.value.find(el => el.value === "DI")
    if (Di) {
      return Object.assign({}, ...Di.children.map(({ label, value }) => ({ [value]: label })))
    } return {}
  })

  onMounted(async () => {
    conditionsOpts.value = await getAlarmLinkageConditionsOpts()
    oprates.value = await getAlarmLinkageOprates()
    alarmLinkages.value = await getAlarmLinkages()
  })

  const addCondition = async () => {
    if (condition.name.length < 2 || !oprate.name) {
      ElMessageBox.alert("条件或执行点值不能为空")
    }
    const result = await addAlarmLinkage({
      key: condition.name.join("-") + "-" + oprate.name,
      condition: toRaw(condition),
      oprate: toRaw(oprate)
    })

    if (result) {
      ElMessage.success("添加成功")
      alarmLinkages.value = await getAlarmLinkages()
    }
  }

  const delCondition = async (key: string) => {
    const ok = await ElMessageBox.confirm("确认删除告警??").catch(() => false)
    if (ok) {
      const result = await delAlarmLinkage(key)
      if (result) {
        ElMessage.success("删除成功")
        const index = alarmLinkages.value.findIndex(el => el.key === key)
        alarmLinkages.value.splice(index, 1)
      }
    }
  }

</script>
