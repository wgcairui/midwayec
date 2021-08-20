<template>
  <main>
    <!-- <my-line-histogram :data="chartDate"></my-line-histogram> -->

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
            <template v-slot="row">
              <router-link
                :to="{
                  name: 'device-line',
                  query: { devid: dev._id, name: row.row.name },
                }"
              >
                <el-button type="primary" size="small">趋势</el-button>
              </router-link>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </section>

    <!-- <el-card v-if="device" :title="device[0].alias">
      <el-table :data="device[0].data">
        <el-table-column prop="name" label="参数"></el-table-column>
        <el-table-column prop="value" label="值"></el-table-column>
        <el-table-column label="操作"></el-table-column>
      </el-table>
    </el-card>-->
  </main>
</template>
<script lang="ts">
  import { computed, defineComponent } from "vue";
  import { useStore } from "vuex";
  import { Ec } from "../../apis/interface";
  import { key } from "../../vuex";
  import myLineHistogram from "../../components/myLineHistogram.vue"
  export default defineComponent({
    components: { myLineHistogram },
    setup() {
      const store = useStore(key)
      const device = computed(() => {
        console.log(store.state);

        const th = store.state.th;
        return th || [];
      });

      const chartDate = computed(() => {
        const data: Ec.chartData = {
          columns: [],
          rows: [],
        };
        /* const th = device.value;
        if (th.length > 0) {
          const columns = ["th", ...th[0].data!.map((el) => el.name)];
          data.columns = columns;
          data.rows = th.map((el) => ({
            [columns[0]]: el.alias,
            [columns[1]]: el.data?.find((el) => el.name === columns[1])?.value,
            [columns[2]]: el.data?.find((el) => el.name === columns[2])?.value,
          }));
        } */
        return data;
      });

      return { device, chartDate };
    },
  });
</script>
