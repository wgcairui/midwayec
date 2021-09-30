<template>
  <main>
    <el-card>
      <template #header>IO配置</template>
      <el-row>
        <el-col :span="12">
          <el-form label-suffix=":" size="small">
            <el-form-item v-for="(val,key) in ioIns" :key="key" :label="'D'+key">
              <el-form size="small" label-width="50px" label-suffix=":">
                <el-form-item label="状态">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="显示Di端口的状态,Di不能操作"
                    placement="right-start"
                  >
                    <el-switch
                      v-model="ioIns[key]"
                      disabled
                      :active-value="1"
                      :inactive-value="0"
                      active-color="#13ce66"
                      active-text="闭合"
                      inactive-text="断开"
                    ></el-switch>
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="反转">
                  <el-tooltip class="item" effect="dark" content="反转Di高低电位" placement="right-start">
                    <el-switch v-model="labels[key].reverse" active-text="是" inactive-text="否"></el-switch>
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="设备">
                  <el-autocomplete
                    v-model="labels[key].label"
                    :fetch-suggestions="querySearch"
                    class="inline-input"
                    placeholder="输入io别名"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="success" round @click="setIo(key)">确定</el-button>
                </el-form-item>
              </el-form>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form label-suffix=":" size="small">
            <el-form-item v-for="(val,key) in ioOuts" :key="key" :label="'D'+key">
              <el-form size="small" label-width="50px" label-suffix=":">
                <el-form-item label="状态">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="显示Do端口的状态"
                    placement="right-start"
                  >
                    <el-switch
                      v-model="ioOuts[key]"
                      :active-value="1"
                      :inactive-value="0"
                      active-color="#13ce66"
                      active-text="闭合"
                      inactive-text="断开"
                      @click="changIo(key)"
                    ></el-switch>
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="反转">
                  <el-tooltip class="item" effect="dark" content="反转Di高低电位" placement="right-start">
                    <el-switch v-model="labels[key].reverse" active-text="是" inactive-text="否"></el-switch>
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="设备">
                  <el-autocomplete
                    v-model="labels[key].label"
                    :fetch-suggestions="querySearch"
                    class="inline-input"
                    placeholder="输入io别名"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="success" round @click="setIo(key)">确定</el-button>
                </el-form-item>
              </el-form>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </main>
</template>
<script setup lang="ts">
  import { BinaryValue } from "onoff";
  import { computed, onMounted, reactive, ref, watchEffect } from "vue";
  import { useStore } from "vuex";
  import { ioIn, ioOut } from "../../interface";
  import { key } from "../../vuex";
  import { setIoVal, getIoLabels, setIoLabel } from "../../apis/lambda/setup"
  import { ElMessageBox } from "element-plus"
  import { Ec } from "../../apis/interface";

  const store = useStore(key)

  const label = ["烟感", "水侵", "门锁", "声光"]

  const ioIns = ref<Record<ioIn, BinaryValue>>()
  const ioOuts = ref<Record<ioOut, BinaryValue>>()

  const labels = reactive<Record<ioIn | ioOut, Pick<Ec.ioInfo, "label" | "reverse">>>({
    "i1": { label: '', reverse: false },
    "i2": { label: '', reverse: false },
    "i3": { label: '', reverse: false },
    "i4": { label: '', reverse: false },
    "i5": { label: '', reverse: false },
    "i6": { label: '', reverse: false },
    "o1": { label: '', reverse: false },
    "o2": { label: '', reverse: false },
    "o3": { label: '', reverse: false },
    "o4": { label: '', reverse: false },
    "o5": { label: '', reverse: false },
    "o6": { label: '', reverse: false },
  })

  onMounted(() => {
    getIoLabels().then(el => {
      el.forEach(({ name, label, reverse }) => {
        labels[name].label = label
        labels[name].reverse = reverse
      })
    })
  })

  const ioState = computed(() => store.state.ioState)

  watchEffect(() => {
    const arr = Object.entries(ioState.value)
    ioIns.value = Object.assign({}, ...arr.filter(el => /^i/.test(el[0])).map(el => ({ [el[0]]: el[1] })))
    ioOuts.value = Object.assign({}, ...arr.filter(el => /^o/.test(el[0])).map(el => ({ [el[0]]: el[1] })))
  })

  /**
   * 改变io
   */
  const changIo = (key: ioOut) => {
    const val = ioOuts.value[key]
    ioOuts.value[key] = val || 0
    setIoVal(key, val)
  }

  /**
   * 修改io配置
   */
  const setIo = (key: ioOut | ioIn) => {
    const { label, reverse } = labels[key]
    setIoLabel(key, label, reverse).then(el => {
      ElMessageBox.alert("修改成功")
    })
  }

  const querySearch = (queryString: string, cb: CallableFunction) => {
    cb(label.filter(el => el.includes(queryString)).map(el => ({ value: el })))
  }
</script>
<style lang="scss" >
.el-switch__label>span{
  color: #000;
}
</style>