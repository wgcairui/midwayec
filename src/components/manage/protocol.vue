<template>
  <main>
    <el-table :data="protocols">
      <el-table-column prop="Protocol" label="协议"></el-table-column>
      <el-table-column prop="ProtocolType" label="设备类型" width="100" />
      <el-table-column prop="Type" label="协议类型" width="100" />
      <el-table-column label="操作" width="150">
        <template v-slot="row">
          <nuxt-link :to="{ name: 'manage-protocolInstruct', query: { _id: row.row._id } }">
            <el-button size="small">查看</el-button>
          </nuxt-link>
        </template>
      </el-table-column>
    </el-table>
  </main>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref } from "vue";
  import { getProtocols } from "../../apis/lambda/setup";
  export default defineComponent({
    setup() {
      const protocols = ref<Uart.protocol[]>();

      onMounted(() => {
        getProtocols().then(el => {
          protocols.value = el as Uart.protocol[]
        })
      })
      return { protocols };
    },
  });
</script>
