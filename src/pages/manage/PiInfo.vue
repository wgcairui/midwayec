<template>
  <main>
    <el-card>
      <el-descriptions v-if="osInfo" title="采集器系统信息">
        <el-descriptions-item label="系统版本">
          <el-tag>{{ osInfo.distro }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发型版本">
          <el-tag>{{ osInfo.codename }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="内核版本">
          <el-tag>{{ osInfo.kernel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="架构">
          <el-tag>{{ osInfo.arch }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="主机名">
          <el-tag>{{ osInfo.hostname }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="fqdn">
          <el-tag>{{ osInfo.fqdn }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="serial">
          <el-tag>{{ osInfo.serial }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="platform">
          <el-tag>{{ osInfo.platform }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="release">
          <el-tag>{{ osInfo.release }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card>
      <el-descriptions v-if="info.disk" title="磁盘信息">
        <el-descriptions-item label="磁盘容量">
          <el-tag>{{ b2G(info.disk.size) }}GB</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="已使用">
          <el-tag>{{ b2G(info.disk.used) }}GB</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="空闲">
          <el-tag>{{ b2G(info.disk.available) }}GB</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="使用比例">
          <el-tag>{{ info.disk.use }}%</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card>
      <el-descriptions v-if="info.men" title="内存信息">
        <el-descriptions-item label="内存容量">
          <el-tag>{{ b2G(info.men.total) }}GB</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="已使用">
          <el-tag>{{ b2G(info.men.used) }}GB</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="空闲">
          <el-tag>{{ b2G(info.men.free) }}GB</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="使用比例">
          <el-tag>{{ Fixed2((info.men.used / info.men.total) * 100) }}%</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card v-if="info.net ">
      <el-descriptions title="网络信息">
        <el-descriptions-item label="IPV4">
          <el-tag>{{ info.net.ip4 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IPV4掩码">
          <el-tag>{{ info.net.ip4subnet }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IPV6">
          <el-tag>{{ info.net.ip4 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IPV6掩码">
          <el-tag>{{ info.net.ip6subnet }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="MAc">
          <el-tag>{{ info.net.mac }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="网关">
          <el-tag>{{ info.getway }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card v-if="info.wifi">
      <el-descriptions title="Wifi信息">
        <el-descriptions-item label="IPV4">
          <el-tag>{{ info.wifi.ip4 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IPV4掩码">
          <el-tag>{{ info.wifi.ip4subnet }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IPV6">
          <el-tag>{{ info.wifi.ip4 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IPV6掩码">
          <el-tag>{{ info.wifi.ip6subnet }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="MAc">
          <el-tag>{{ info.wifi.mac }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="网关">
          <el-tag>{{ info.getway }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </main>
</template>
<script lang="ts" setup>
  import { Systeminformation } from "systeminformation";
  import { computed, onMounted, ref } from "vue";
  import { useStore } from "vuex";
  import { PiSysInfo } from "../../apis/lambda/setup";
  import { key } from "../../vuex";
  const store = useStore(key)
  const info = computed(() => store.state.PiDevInfo);
  const Fixed2 = (val: string | number) => {
    return Number(val).toFixed(2);
  };
  const b2G = (val: string) => {
    return Fixed2(Number(val) / 1024 / 1024 / 1024);
  };

  const osInfo = ref<Systeminformation.OsData>(null)
  onMounted(() => {
    PiSysInfo().then(el => {
      osInfo.value = el
    })
  })

</script>
<style scoped>
  .el-card {
    margin: 1rem 0;
  }
</style>
