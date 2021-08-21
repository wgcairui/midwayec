<template>
  <main>
    <my-Bar></my-Bar>
  </main>
</template>
<script lang="ts">
  import { defineComponent } from "vue";
  import myBar from "../../components/myBar.vue"
  export default defineComponent({
    components: { myBar },
    setup(props) {

      return {};
    },
  });
</script>
