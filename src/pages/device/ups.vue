<template>
  <main>
    <my-line-histogram :data="device"></my-line-histogram>
    {{ device }}
  </main>
</template>
<script lang="ts">
  import { computed, defineComponent } from "vue";
  import { useStore } from "vuex";
  import { Ec } from "../../apis/interface";
  import myLineHistogram from "../../components/myLineHistogram.vue"
  import { key } from "../../vuex";
  export default defineComponent({
    components: { myLineHistogram },
    setup(props) {
      const store = useStore(key)
      const device = computed(() => {
        const data: Partial<Ec.DeviceData>[] = store.state.th;
        const columns = ["th", ...data[0].data!.map((el) => el.name)];
        const rows = data.map((el) => ({
          [columns[0]]: el.alias,
          [columns[1]]: el.data?.find((el) => el.name === columns[1])?.value,
          [columns[2]]: el.data?.find((el) => el.name === columns[2])?.value,
        }));
        return { columns, rows };
      });

      return { device };
    },
  });
</script>
