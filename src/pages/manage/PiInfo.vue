<template>
  <main>
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
    <el-card>
      <el-descriptions v-if="info.net" title="网络信息">
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
  </main>
</template>
<script lang="ts">
  import { computed, defineComponent } from "vue";
  import { useStore } from "vuex";
  import { key } from "../../vuex";
  export default defineComponent({
    setup() {
      const store = useStore(key)
      const info = computed(() => store.state.PiDevInfo);
      const Fixed2 = (val: string | number) => {
        return Number(val).toFixed(2);
      };
      const b2G = (val: string) => {
        return Fixed2(Number(val) / 1024 / 1024 / 1024);
      };
      return { info, Fixed2, b2G };
    },
  });
</script>
<style scoped>
  .el-card {
    margin: 1rem 0;
  }
</style>
