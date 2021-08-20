<template>
  <my-line-histogram></my-line-histogram>
</template>
<script lang="ts">
  import { defineComponent } from "vue";
  import myLineHistogram from "../../components/myLineHistogram.vue"
  export default defineComponent({
    components: { myLineHistogram },
    setup(props) {

    },
  });
</script>
