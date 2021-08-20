<template>
  <main>
    <el-table :data="instruct">
      <el-table-column type="expand">
        <template v-slot="row">
          <el-table :data="row.row.formResize">
            <el-table-column prop="name" label="参数名称"></el-table-column>
            <el-table-column prop="regx" label="分割规则"></el-table-column>
            <el-table-column prop="bl" label="倍数"></el-table-column>
            <el-table-column prop="unit" label="单位"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="查询指令" width="150"></el-table-column>
      <el-table-column prop="isUse" label="正在使用" width="50">
        <template v-slot="row">
          <el-switch :value="row.row.isUse" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="noStandard" label="非标协议" width="50">
        <template v-slot="row">
          <el-switch :value="row.row.noStandard" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="resultType" label="解析类型" width="50"></el-table-column>
      <el-table-column prop="scriptStart" label="前处理"></el-table-column>
      <el-table-column prop="scriptEnd" label="后处理"></el-table-column>
    </el-table>
  </main>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref } from "vue";
  import { useRoute } from "vue-router";
  import { getProtocols } from "../../apis/lambda/setup"
  export default defineComponent({
    setup() {
      const route = useRoute()

      const instruct = ref<Uart.protocolInstruct[]>([])

      onMounted(() => {
        getProtocols(route.query._id as string).then((el: Uart.protocol) => {
          instruct.value = el.instruct
        });
      })
      return { instruct };
    },
  });
</script>
