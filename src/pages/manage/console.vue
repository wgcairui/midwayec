<template>
  <main>
    <section>
      <el-card>
        <el-form :model="opt" inline>
          <el-form-item label="serial:">
            <el-select v-model="opt.serial" :disabled="consoleMode">
              <el-option
                v-for="serial in serials"
                :key="serial.serialport"
                :value="serial.serialport"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="协议:">
            <el-cascader :options="protocols" v-model="care" :disabled="consoleMode"></el-cascader>
          </el-form-item>
          <el-form-item label="设备地址:">
            <el-input-number v-model="opt.address" :disabled="consoleMode"></el-input-number>
          </el-form-item>
          <el-form-item>{{ serialInfo }}</el-form-item>
          <el-form-item>
            <el-button
              :disabled="(!opt.serial || care.length !== 2) && !consoleMode"
              size="small"
              type="primary"
              @click="toggleConsole"
              :loading="ConsoleLoading"
            >{{ consoleMode ? "关闭调试" : "打开调试" }}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </section>
    <section v-if="opt.serial && consoleMode">
      <el-card>
        <el-form inline>
          <el-form-item label="查询指令:">
            <el-input v-model="costomInstruct" placeholder="输入自定义查询指令"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="sendCustomInstruct(costomInstruct, true)" type="primary">发送</el-button>
            <el-button @click="clearLog" type="warning">清除记录</el-button>
          </el-form-item>
        </el-form>
        <el-row class="log">
          <el-col :span="12">
            <p
              v-for="(log, key) in sendLog"
              :key="log.time + log.str + key"
            >{{ log.time }}:{{ log.str }}</p>
          </el-col>
          <el-col :span="12">
            <p
              v-for="(log, key) in recvLog"
              :key="log.time + log.str + key"
            >{{ log.time }} == {{ log.str }}</p>
          </el-col>
        </el-row>
      </el-card>
    </section>
    <section v-if="care.length === 2" class="mt-4">
      <el-tabs tab-position="left">
        <el-tab-pane v-for="instruct in instructs" :key="instruct.name" :label="instruct.name">
          <el-button type="primary" @click="sendCustomInstruct(instruct.name, false)">查询</el-button>
          <el-table :data="instruct.formResize">
            <el-table-column prop="name" label="参数名称"></el-table-column>
            <el-table-column prop="regx" label="分割规则"></el-table-column>
            <el-table-column prop="bl" label="倍数"></el-table-column>
            <el-table-column prop="unit" label="值"></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>
  </main>
</template>
<script lang="ts">
  import { ElLoading, ElMessageBox } from "element-plus";
  import { CascaderOption } from "element-plus/lib/el-cascader-panel";
  import {
    computed,
    defineComponent,
    reactive,
    ref,
    onMounted,
    onUnmounted,
  } from "vue";
  import { Ec } from "../../apis/interface";
  import { getBindSerials, getConsoleMode, getProtocols, sendConsoleInstruct, setConsoleMode } from "../../apis/lambda/setup";
  import { Milliseconds } from "../../util";
  export default defineComponent({
    setup() {
      const opt = reactive<Ec.consoleInstruct>({
        type: "ups",
        serial: "/dev/ttyAMA1",
        protocol: "",
        address: 1,
        instruct: "",
        custom: false,
      });
      // 保存级联
      const care = ref<Uart.protocol[]>([]);
      // 自定义指令
      const costomInstruct = ref("");
      // 发送指令&接收buffer
      const sendLog = ref<{ time: string; str: string }[]>([]);
      const recvLog = ref<{ time: string; str: string }[]>([]);
      // 调试模式
      const consoleMode = ref(false);
      // 调试等待
      const ConsoleLoading = ref(false);
      // 串口列表&协议列表
      const serials = ref<Ec.BindSerial[]>([])
      const protocols = ref<CascaderOption[]>()
      // 串口信息
      const serialInfo = computed(() => {
        const serial = serials.value?.find((el) => el.serialport === opt.serial)!;
        if (serial) {
          return `${serial.baudRate}-${serial.dataBits}-${serial.stopBits}-${serial.parity}`;
        } else return "";
      });
      // 协议信息
      const instructs = computed(() => {
        return care.value.length === 2 ? care.value[1].instruct : [];
      });
      // 切换调试模式
      const toggleConsole = async () => {
        ConsoleLoading.value = true;
        if (consoleMode.value) {
          //$socket.io.off("originalData");
        } else {
          /* $socket.io.on("originalData", (str: string) => {
            recvLog.value.unshift({ time: $util.Milliseconds(), str });
          }); */
        }
        const el = await setConsoleMode(opt.serial, consoleMode.value);
        consoleMode.value = el;
        ConsoleLoading.value = false;
      };

      // 发送查询指令
      const sendCustomInstruct = async (instruct: string, custom: boolean = false) => {
        const modeLoading = ElLoading.service({ text: "检查模式" });
        const mode = await getConsoleMode();
        modeLoading.close();
        if (!mode) {
          const startConsoleModeLoading = ElLoading.service({
            text: "开启调试模式",
          });
          await toggleConsole();
          startConsoleModeLoading.close();
        }
        const opts = Object.assign(opt, {
          instruct,
          custom,
          protocol: care.value[1].Protocol,
        });
        sendLog.value.unshift({ time: Milliseconds(), str: instruct });
        const data = await sendConsoleInstruct(opts);
        console.log(data);

        if (data.code === 200) {
          // 如果是使用已经配置好的指令来查询,把care[1]的协议unit替换为查询的值
          if (!custom) {
            const { result, name } = data;
            const resultMap = new Map(result?.map((el) => [el.name, el]));
            care.value[1].instruct
              .find((el) => el.name === name)
              ?.formResize.forEach((el) => {
                const value = resultMap.get(el.name);
                /* if (value) {
                  el.unit = el.isState
                    ? $util.getUnit(value).parseValue
                    : value.value + value.unit;
                } */
              });
          } else ElMessageBox.confirm(`返回buffer:${data.data}`, "查询成功");
        } else ElMessageBox.confirm(`查询失败:${data.data}`, "查询失败");
      };

      // 清除log记录
      const clearLog = () => {
        recvLog.value = [];
        sendLog.value = [];
      };

      onMounted(() => {
        getConsoleMode().then((el) => (consoleMode.value = el));
        getBindSerials().then(el => {
          serials.value = el
        })
        getProtocols().then((ps: Uart.protocol[]) => {
          const types = [...new Set(ps.map((el) => el.ProtocolType))];
          protocols.value = types.map((el) => ({
            label: el,
            value: el,
            children: ps
              .filter((el2) => el2.ProtocolType === el)
              .map<CascaderOption>((el3) => ({ label: el3.Protocol, value: el3 as any })),
          }));
        })

      });
      onUnmounted(() => {
        //$socket.io.off("originalData");
      });

      return {
        opt,
        ConsoleLoading,
        care,
        sendLog,
        recvLog,
        consoleMode,
        serials,
        protocols,
        serialInfo,
        instructs,
        toggleConsole,
        costomInstruct,
        sendCustomInstruct,
        clearLog,
      };
    },
  });
</script>
<style scoped>
  section {
    margin-bottom: 1rem;
  }
  .log .el-col {
    max-height: 200px;
    overflow: auto;
  }
</style>
