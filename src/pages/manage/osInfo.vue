<template>
  <main>
    <el-card>
      <template #header>采集器系统信息</template>
      <el-form v-if="osInfo" label-width="80px">
        <el-form-item label="distro">
          <el-tag>{{ osInfo.distro }}</el-tag>
        </el-form-item>
        <el-form-item label="codename">
          <el-tag>{{ osInfo.codename }}</el-tag>
        </el-form-item>
        <el-form-item label="kernel">
          <el-tag>{{ osInfo.kernel }}</el-tag>
        </el-form-item>
        <el-form-item label="arch">
          <el-tag>{{ osInfo.arch }}</el-tag>
        </el-form-item>
        <el-form-item label="hostname">
          <el-tag>{{ osInfo.hostname }}</el-tag>
        </el-form-item>
        <el-form-item label="fqdn">
          <el-tag>{{ osInfo.fqdn }}</el-tag>
        </el-form-item>
        <el-form-item label="serial">
          <el-tag>{{ osInfo.serial }}</el-tag>
        </el-form-item>
        <el-form-item label="platform">
          <el-tag>{{ osInfo.platform }}</el-tag>
        </el-form-item>
        <el-form-item label="release">
          <el-tag>{{ osInfo.release }}</el-tag>
        </el-form-item>
      </el-form>
    </el-card>
  </main>
</template>
<script lang="ts">
  import { Systeminformation } from "systeminformation";
  import { defineComponent, onMounted, ref } from "vue";
  import { PiSysInfo } from "../../apis/lambda/setup";
  export default defineComponent({
    setup(props) {
      const osInfo = ref<Systeminformation.OsData>(null)
      onMounted(() => {
        PiSysInfo().then(el => {
          osInfo.value = el
        })
      })
      return { osInfo };
    },
  });
</script>
