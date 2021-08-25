<template>
  <main></main>
</template>
<script lang="ts">
  import { computed, defineComponent, PropType, ref, watchEffect } from 'vue'
  import { Ec } from '../apis/interface'
  import { getProtocolSetup } from '../apis/lambda/setup'

  export default defineComponent({
    props: {
      dev: Object as PropType<Ec.DeviceData>
    },
    setup(props) {


      const sysProtocolSetup = ref<Uart.DevConstant>()

      watchEffect(async () => {
        if (!sysProtocolSetup.value) {
          sysProtocolSetup.value = await getProtocolSetup(props.dev.protocol)

          console.log(sysProtocolSetup.value);
        }

      })

    },
  })
</script>
