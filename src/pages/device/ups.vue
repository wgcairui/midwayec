<template>
  <main>
    <el-tabs>
      <el-tab-pane v-for="dev in device" :key="dev._id" :label="dev.alias">
        <my-ups-chart :dev="dev"></my-ups-chart>
        <el-card>
          <el-table :data="dev.data">
            <el-table-column prop="name" label="参数"></el-table-column>
            <el-table-column prop="parseValue" label="值">
              <template
                v-slot="scope"
              >{{scope.row.parseValue}}{{!/^{/.test(scope.row.unit)?scope.row.unit:''}}</template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button
                  v-if="!/^{/.test(scope.row.unit)"
                  type="text"
                  size="small"
                  @click="his(dev._id,scope.row.name)"
                >趋势</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </main>
</template>
<script lang="ts" setup>
  import { computed, ref } from "vue";
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";
  import myUpsChart from "../../components/myUpsChart.vue"
  import { key } from "../../vuex";

  const store = useStore(key)
  const router = useRouter()

  const device = computed(() => store.state.ups.sort((a, b) => a.pid - b.pid));

  const his = (id: string, name: string) => {
    router.push({ path: '/line', query: { id, name } })
  }

</script>
