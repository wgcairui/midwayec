<template>
  <main>
    <el-card>
      <el-form label-width="80px">
        <el-form-item label="磁盘容量">
          <el-tag>{{ b2G(info.disk.size) }}GB</el-tag>
        </el-form-item>
        <el-form-item label="已使用">
          <el-tag>{{ b2G(info.disk.used) }}GB</el-tag>
        </el-form-item>
        <el-form-item label="空闲">
          <el-tag>{{ b2G(info.disk.available) }}GB</el-tag>
        </el-form-item>
        <el-form-item label="使用比例">
          <el-tag>{{ info.disk.use }}%</el-tag>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <el-form label-width="80px">
        <el-form-item label="内存容量">
          <el-tag>{{ b2G(info.men.total) }}</el-tag>
        </el-form-item>
        <el-form-item label="已使用">
          <el-tag>{{ b2G(info.men.used) }}</el-tag>
        </el-form-item>
        <el-form-item label="空闲">
          <el-tag>{{ b2G(info.men.free) }}</el-tag>
        </el-form-item>
        <el-form-item label="使用比例">
          <el-tag>{{ Fixed2((info.men.free / info.men.used) * 100) }}%</el-tag>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <el-form label-width="80px">
        <el-form-item label="IPV4">
          <el-tag>{{ info.net.ip4 }}</el-tag>
        </el-form-item>
        <el-form-item label="IPV4掩码">
          <el-tag>{{ info.net.ip4subnet }}</el-tag>
        </el-form-item>
        <el-form-item label="IPV6">
          <el-tag>{{ info.net.ip4 }}</el-tag>
        </el-form-item>
        <el-form-item label="IPV6掩码">
          <el-tag>{{ info.net.ip6subnet }}</el-tag>
        </el-form-item>
        <el-form-item label="MAc">
          <el-tag>{{ info.net.mac }}</el-tag>
        </el-form-item>
        <el-form-item label="网关">
          <el-tag>{{ info.getway }}</el-tag>
        </el-form-item>
      </el-form>
    </el-card>
  </main>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { key } from "../../vuex";
export default defineComponent({
  setup(props) {
    const store = useStore(key)
    const info = computed(() => {
      return store.state.PiDevInfo as any;
    });
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
