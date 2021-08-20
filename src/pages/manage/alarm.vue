<template>
  <main>
    {{a}}
    <el-radio label="1">备选项</el-radio>
    <el-radio label="2">备选项</el-radio>
  </main>
</template>
<script lang="ts">
import { ref, defineComponent } from 'vue'
export default defineComponent({

  setup(){
    const a = ref(0)

    return {a}
  }

})
</script>
