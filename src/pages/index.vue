<template>
  <main>
    <el-row>
      <el-col :md="24" class="ec-statu">
        <el-card>
          <div>
            <span></span>
          </div>
          <el-image style="width: 100px; height: 100px" :src="url" :preview-src-list="urlList"></el-image>
        </el-card>
      </el-col>
    </el-row>
  </main>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from "vue";
  import { getCarema } from "../apis/lambda/setup";

  const url = ref("/screen.jpeg")
  const urlList = ref<string[]>([])

  onMounted(() => {
    /**
     * 拍摄一张照片
     */
    getCarema({ name: 'screen' }).then(el => {
      url.value = el.path
      urlList.value[0] = el.path
    })
  })

</script>
<style lang="scss" scoped>
  .ec-statu {
    width: 100%;
    height: 400px;
    .el-card{
        height: 100%;
    }
  }
</style>