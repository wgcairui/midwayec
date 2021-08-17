<template>
  <main>
    <el-card>
      <el-form :model="serial" label-width="80px">
        <el-form-item label="串口:">
          <el-select v-model="serial.serialport">
            <el-option v-for="port in serialports" :key="port" :value="port"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自动打开:">
          <el-switch v-model="serial.autoOpen"></el-switch>
        </el-form-item>
        <el-form-item label="波特率:">
          <el-select v-model="serial.baudRate">
            <el-option
              v-for="rate in selects.baudRate"
              :key="rate"
              :value="rate"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据位:">
          <el-select v-model="serial.dataBits">
            <el-option
              v-for="bit in selects.dataBits"
              :key="bit"
              :value="bit"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="停止位:">
          <el-select v-model="serial.stopBits">
            <el-option
              v-for="bit in selects.stopBits"
              :key="bit"
              :value="bit"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="校验位:">
          <el-select v-model="serial.parity">
            <el-option
              v-for="party in selects.parity"
              :key="party"
              :value="party"
              :label="party"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="samll" @click="addSerialport" type="primary">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-table :data="BindSerials">
      <el-table-column prop="serialport" label="serial"></el-table-column>
      <el-table-column prop="autoOpen" label="自动开启"></el-table-column>
      <el-table-column prop="baudRate" label="波特率"></el-table-column>
      <el-table-column prop="dataBits" label="数据位"></el-table-column>
      <el-table-column prop="stopBits" label="停止位"></el-table-column>
      <el-table-column prop="parity" label="校验位"></el-table-column>
    </el-table>
  </main>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  useAsync,
  useContext,
  useFetch,
  watch,
} from "@nuxtjs/composition-api";
import { Ec } from "~/typing";

export default defineComponent({
  setup() {
    const { $api } = useContext();
    const serial = reactive<Ec.BindSerial>({
      serialport: "/dev/ttyAMA0",
      autoOpen: true,
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
      interval: 100,
    });

    const selects = {
      baudRate: [
        115200,
        57600,
        38400,
        19200,
        9600,
        4800,
        2400,
        1800,
        1200,
        600,
        300,
        200,
        150,
        134,
        110,
        75,
        50,
      ],
      dataBits: [8, 7, 6, 5],
      stopBits: [1, 2],
      parity: ["none", "even", "mark", "odd", "space"],
    };

    const BindSerials = ref<Ec.BindSerial[]>([]);

    const serialports = useAsync(() => $api.getSerialportlist());

    const fecthBindSerials = useFetch(async () => {
      BindSerials.value = await $api.getBindSerials();
    });

    const addSerialport = () => {
      $api.addSerialport({ ...serial }).then(() => fecthBindSerials.fetch());
    };

    return { serial, selects, serialports, BindSerials, addSerialport };
  },
});
</script>
