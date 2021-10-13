<template>
  <main>
    <el-card>
      <el-form :model="device" label-width="100px">
        <el-form-item label="绑定Com:">
          <el-select v-model="device.uart" placeholder="选择绑定的端口">
            <el-option
              v-for="uart in uarts"
              :key="uart.value"
              :label="uart.text"
              :value="uart.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择设备:">
          <el-cascader v-model="p" :options="Model" :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <!--  <el-form-item label="设备类型:">
          <el-select v-model="device.type" placeholder="选择设备类型">
            <el-option
              v-for="type in devicesCompute.types"
              :key="type"
              :label="type"
              :value="type"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备型号:">
          <el-select v-model="device.model" placeholder="选择设备型号">
            <el-option
              v-for="mode in devicesCompute.models"
              :key="mode"
              :label="mode"
              :value="mode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备协议:">
          <el-select v-model="device.protocol" placeholder="选择设备协议">
            <el-option
              v-for="protocol in devicesCompute.protocols"
              :key="protocol"
              :value="protocol"
            />
          </el-select>
        </el-form-item>-->
        <el-form-item label="设备地址:">
          <el-input-number v-model="device.pid" :min="1" :max="254" />
        </el-form-item>

        <el-form-item label="设备别名:">
          <el-input v-model="device.alias" placeholder="输入设备名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="addMountdevs"
            type="primary"
            :disabled="!device.uart || !device.pid || p.length !== 3"
          >添加</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-table :data="bindDevs" :default-sort="{prop: 'uart'}">
      <el-table-column prop="type" label="设备类型" width="150"></el-table-column>
      <el-table-column prop="model" label="设备型号" width="200"></el-table-column>
      <el-table-column prop="pid" label="pid" width="50"></el-table-column>
      <el-table-column prop="protocol" label="协议"></el-table-column>
      <el-table-column prop="uart" label="串口" width="120" :formatter="uartFormat"></el-table-column>
      <el-table-column prop="alias" label="设备别名" width="150"></el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template v-slot="row">
          <el-button @click="delMountdevs(row)" size="small" type="warning">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </main>
</template>

<script lang="ts" setup>
  import { CascaderOption, ElMessageBox } from "element-plus";
  import {
    onMounted,
    reactive,
    ref
  } from "vue";
  import { Ec } from "../../apis/interface";
  import { addMountdev, delMountdev, getBindDevs, getDevices } from "../../apis/lambda/setup";
  import { uarts } from "../../universalData"
  const uartMaps = new Map(uarts.map(el => [el.value, el.text]))
  const device = reactive<Ec.Mountdev>({
    uart: "/dev/ttyAMA0",
    type: "UPS",
    model: "",
    pid: 0,
    protocol: "",
    alias: "",
  });
  const p = ref<string[]>([]);
  const bindDevs = ref<Ec.Mountdev[]>([]);
  const bindDevsFecth = async () => {
    bindDevs.value = await getBindDevs();
  }

  // 添加绑定设备
  const addMountdevs = () => {
    const [type, model, protocol] = p.value;
    device.type = type;
    device.model = model;
    device.protocol = protocol;
    device.alias = device.alias || device.model;
    addMountdev(device).then(() => {
      device.type = "";
      device.model = "";
      device.pid = 0;
      device.protocol = "";
      device.alias = "";
      p.value = [];
      bindDevsFecth();
    });
  };
  // 删除绑定设备
  const delMountdevs = (row: any) => {
    ElMessageBox.confirm(`确定删除协议:${row.row.protocol} ?`).then((val) => {
      if (val === "confirm") {
        delMountdev(row.row._id!).then(() => {
          bindDevsFecth;
        });
      }
    });
  };
  //
  const Model = ref<CascaderOption[]>()

  onMounted(async () => {
    bindDevsFecth()
    const devs = await getDevices();
    const types = [...new Set(devs.map((el) => el.Type))];
    Model.value = types.map<CascaderOption>((type) => {
      const children = devs
        .filter((el) => el.Type === type)
        .map((el) => {
          const ch2 = el.Protocols.map((el2) => ({
            value: el2.Protocol,
            label: el2.Protocol,
          }));
          return { value: el.DevModel, children: ch2, label: el.DevModel };
        });
      return {
        value: type,
        label: type,
        children,
      };
    });
  })

  const uartFormat = (row: Ec.Mountdev) => uartMaps.get(row.uart)

</script>
