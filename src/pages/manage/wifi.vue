<template>
  <main>
    <el-card>
      <template #header>
        wifi配置
        <el-button round size="small" @click="getWifiList">刷新</el-button>
      </template>
      <el-table :data="wifis" v-loading="loading">
        <el-table-column prop="ssid" label="SSID"></el-table-column>
        <el-table-column prop="mac" label="mac" width="200"></el-table-column>
        <el-table-column prop="channel" label="信道" width="80"></el-table-column>
        <el-table-column prop="quality" label="强度" width="80"></el-table-column>
        <el-table-column prop="security" label="加密" width="180"></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button
              round
              size="small"
              :type="scope.row.active==='no'?'primary':'warning'"
              @click="scope.row.active==='no'?connect(scope.row.ssid):deleteWifi(scope.row.ssid)"
            >{{scope.row.active==='yes'?'删除':'连接'}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </main>
</template>
<script lang="ts" setup>
  import { ElMessageBox, MessageBoxData } from 'element-plus'
  import { networks } from 'node-wifi'
  import { onMounted, ref } from 'vue'
  import { wifiConnect, wifiDleteConnection, wifiScan } from '../../apis/lambda/setup'


  const wifis = ref<networks[]>([])

  const loading = ref<boolean>(false)

  onMounted(() => {
    getWifiList()
  })

  const getWifiList = () => {
    loading.value = true
    wifiScan().then(el => {
      wifis.value = el
      loading.value = false
    })
  }

  const connect = async (ssid: string) => {
    const value = await ElMessageBox.prompt("输入密码", { title: `连接到wifi:${ssid}?` }).catch(() => false) as MessageBoxData
    if (value) {
      loading.value = true
      const result = await wifiConnect(ssid, value.value)
      loading.value = false
      console.log({ result });

      if (result === "ok") {
        getWifiList()
      } else {
        ElMessageBox.alert(result.cmd, { type: "error", title: "操作失败" })
      }
    }

  }


  const deleteWifi = async (ssid: string) => {
    const value = await ElMessageBox.confirm(`是否删除ssid:${ssid}?`).catch(() => false)
    if (value) {
      loading.value = true
      const result = await wifiDleteConnection(ssid)
      console.log({ result });
      loading.value = false
      if (result === "ok") {
        getWifiList()
      } else {
        ElMessageBox.alert(result, { type: "error", title: "操作失败" })
      }
    }
  }
</script>