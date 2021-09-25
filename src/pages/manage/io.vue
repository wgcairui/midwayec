<template>
  <main>
    <el-card>
      <template #header>IO配置</template>
      <el-row>
        <el-col :span="12">
          <el-form label-suffix=":" size="mini">
            <el-form-item v-for="(val,key) in ioIns" :key="key" :label="key">
              <el-form inline size="small">
                <el-form-item>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="灰色为断开,绿色为连接"
                    placement="right-start"
                  >
                    <el-switch
                      v-model="ioIns[key]"
                      disabled
                      :active-value="1"
                      :inactive-value="0"
                      active-color="#13ce66"
                    ></el-switch>
                  </el-tooltip>
                </el-form-item>
                <el-form-item>
                  <el-autocomplete
                    v-model="labels[key]"
                    :fetch-suggestions="querySearch"
                    class="inline-input"
                    placeholder="输入io别名"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="success" round>确定</el-button>
                </el-form-item>
              </el-form>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form label-suffix=":" size="small">
            <el-form-item v-for="(val,key) in ioOuts" :key="key" :label="key">
              <el-tooltip class="item" effect="dark" content="灰色为断开,绿色为连接" placement="right-start">
                <el-switch
                  v-model="ioOuts[key]"
                  :active-value="1"
                  :inactive-value="0"
                  active-color="#13ce66"
                  @click="changIo(key)"
                ></el-switch>
              </el-tooltip>
              <el-autocomplete
                v-model="labels[key]"
                :fetch-suggestions="querySearch"
                class="inline-input"
                placeholder="输入io别名"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </main>
</template>
<script setup lang="ts">
  import { BinaryValue } from "onoff";
  import { computed, reactive, ref, watchEffect } from "vue";
  import { useStore } from "vuex";
  import { ioIn, ioOut } from "../../interface";
  import { key } from "../../vuex";
  import { setIoVal } from "../../apis/lambda/setup"
  import { Warning } from "@element-plus/icons"

  const store = useStore(key)

  const label = ["烟感", "水侵", "门锁", "声光"]

  const ioIns = ref<Record<ioIn, BinaryValue>>()
  const ioOuts = ref<Record<ioOut, BinaryValue>>()

  const labels = reactive<Record<ioIn | ioOut, string>>({
    "i1": '',
    "i2": '',
    "i3": '',
    "i4": '',
    "i5": '',
    "i6": '',
    "o1": "",
    "o2": "",
    "o3": "",
    "o4": "",
    "o5": "",
    "o6": "",
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

  const querySearch = (queryString: string, cb: CallableFunction) => {
    cb(label.filter(el => el.includes(queryString)).map(el => ({ value: el })))
  }
</script>
