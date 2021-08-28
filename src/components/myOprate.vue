<template>
  <el-button size="small" v-for="o in oprates" :key="o.name" @click="oprateInstruct(o)">{{o.name}}</el-button>
</template>
<script lang="ts">
  import { ElLoading, ElMessageBox } from 'element-plus'
  import { defineComponent, PropType } from 'vue'
  import { Ec } from '../apis/interface'
  import { getBindDev, getConsoleMode, sendConsoleInstruct, setConsoleMode, getProtocol } from '../apis/lambda/setup'

  export default defineComponent({
    props: {
      uart: String as PropType<Ec.uarts>,
      oprates: {
        type: Array as PropType<Uart.OprateInstruct[]>
      }
    },
    setup(props, ctx) {

      const oprateInstruct = async (o: Uart.OprateInstruct) => {
        const device = await getBindDev(props.uart)

        console.log({ props, o, device });
        const modeLoading = ElLoading.service({ text: "检查模式" });
        const mode = await getConsoleMode();
        modeLoading.close();
        if (!mode) {
          const startConsoleModeLoading = ElLoading.service({
            text: "开启调试模式",
          });
          await setConsoleMode(props.uart, mode);
          startConsoleModeLoading.close();
        }
        const opts: Ec.consoleInstruct = {
          serial: device.uart,
          type: (await getProtocol(device.protocol)).ProtocolType,
          address: device.pid,
          instruct: o.value,
          custom: true,
          protocol: device.protocol,
        }
        const data = await sendConsoleInstruct(opts);
        if (data.code === 200) {
          ElMessageBox.confirm(`返回buffer:${data.data}`, "查询成功");
        } else ElMessageBox.confirm(`查询失败:${data.data}`, "查询失败");

        await setConsoleMode(props.uart, false);
      }

      return { oprateInstruct }

    },
  })
</script>
