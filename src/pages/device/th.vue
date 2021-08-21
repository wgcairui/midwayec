<template>
  <main>
    <my-bar title="温度" :data="chartDate.t"></my-bar>
    <my-bar title="湿度" :data="chartDate.h" color="#67C23A"></my-bar>
    <section v-for="dev in device" :key="dev._id" class="mb-3">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{dev.alias}}</span>
          </div>
        </template>
        <el-table :data="dev.data">
          <el-table-column prop="name" label="参数"></el-table-column>
          <el-table-column prop="value" label="值"></el-table-column>
          <el-table-column label="操作">
            <!-- <template v-slot="row">
              <router-link
                :to="{
                  name: 'device-line',
                  query: { devid: dev._id, name: row.row.name },
                }"
              >
                <el-button type="primary" size="small">趋势</el-button>
              </router-link>
            </template>-->
          </el-table-column>
        </el-table>
      </el-card>
    </section>
  </main>
</template>
<script lang="ts">
  import { computed, defineComponent } from "vue";
  import { useStore } from "vuex";
  import { key } from "../../vuex";
  import myBar from "../../components/myBar.vue"
  import { barData } from "../../interface";
  export default defineComponent({
    components: { myBar },
    setup() {
      const store = useStore(key)
      const device = computed(() => store.state.th.sort((a, b) => a.pid - b.pid));

      const chartDate = computed(() => {

        const th = device.value;
        const t: barData[] = []
        const h: barData[] = []
        if (th.length > 0) {
          th.forEach(el => {
            el.data.forEach(el2 => {
              switch (el2.name) {
                case "温度":
                  t.push({
                    name: el.alias,
                    value: parseFloat(el2.parseValue),
                    alarm: el2.alarm
                  })
                  break;

                case "湿度":
                  h.push({
                    name: el.alias,
                    value: parseFloat(el2.parseValue),
                    alarm: el2.alarm
                  })
                  break;
              }
            })
          })
        }
        return { t, h };
      });

      return { device, chartDate };
    },
  });
</script>
<style scoped>
  .el-card {
    margin: 1rem 0;
  }
</style>
