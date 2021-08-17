<template>
  <main>
    <el-card class="mb-4">
      <el-form>
        <el-form-item label="数据库Size:">
          <el-tag>{{ dbSize }}MB</el-tag>
        </el-form-item>
        <el-form-item label="数据库操作:">
          <el-tooltip placement="top" content="磁盘剩余空间需要大于数据库2倍以上以便操作备份">
            <el-button
              type="success"
              size="small"
              @click="backDatas"
              :loading="backStat"
              :disabled="!diskavailable"
            >备份下载数据库</el-button>
          </el-tooltip>

          <el-button type="warning" size="small" @click="initData" :loading="initStat">初始化数据库</el-button>
          <el-button type="primary" size="small" @click="refreshData">更新信息</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-table :data="devsCount" border show-summary>
      <el-table-column prop="devid" label="设备id"></el-table-column>
      <el-table-column prop="name" label="设备名"></el-table-column>
      <el-table-column prop="uart" label="串口"></el-table-column>
      <el-table-column prop="n" label="数据行数"></el-table-column>
      <el-table-column prop="time" label="开始记录"></el-table-column>
      <el-table-column label=" 操作">
        <template v-slot="row">
          <el-button type="warning" @click="deleteColumn(row)" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </main>
</template>
<script lang="ts">
  import { ElMessageBox } from "element-plus";
  import { computed, defineComponent, onMounted, ref } from "vue";
  import { useStore } from "vuex";
  import { Ec } from "../../apis/interface";
  import { key, State } from "../../vuex";
  import { date } from "../../util"
  import { backData, deleteColumns, deviceHistoryCount, getBindDevs } from "../../apis/lambda/setup";
  export default defineComponent({
    setup() {

      const store = useStore<State>(key)

      const devsCount = ref<any[]>([]);

      const dbSize = ref<number>(0);

      const backStat = ref(false);

      const initStat = ref(false);

      /**
       * 磁盘剩余空间需要大于数据库大小两倍
       */
      const diskavailable = computed(() => {
        const diskFree = store.state.PiDevInfo?.disk?.available || 0;
        return diskFree > dbSize.value * 1024 * 1024 * 2;
      });

      const FecthcountInfo = async () => {
        const list = await getBindDevs();
        const devMaps = new Map(list.map((el) => [el._id!, el]));
        const count = await deviceHistoryCount();
        //
        dbSize.value = count.dbSize;
        devsCount.value = count.count.map((el) => {
          const devs = devMaps.get(el.devid);
          const time = date(
            count.min.find((el1) => el1.devid == el.devid)?.["min(timeStamp)"]
          );
          return {
            devid: el.devid,
            name: devs?.alias || "未知设备",
            n: el["count(*)"],
            uart: devs?.uart,
            time,
          };
        });
      }

      onMounted(() => {
        FecthcountInfo()
      })

      const backDatas = async () => {
        const { value, action } = await ElMessageBox.prompt("备份名称:", "备份下载数据库", {
          inputValue: date().replaceAll("/", "_").trim() + "ladis",
        });
        if (action === "confirm") {
          backStat.value = true;
          backData(value).then(() => {
            backStat.value = false;
          });
        }
      };

      const initData = async () => {
        const action = await ElMessageBox.confirm(
          "此操作将清除所有设备历史记录!!",
          "初始化数据库"
        );
        if (action === "confirm") {
          initStat.value = true;
          deleteColumns().then(() => {
            FecthcountInfo()
            initStat.value = false;
          });
        }
      };

      const deleteColumn = async (row: Ec.EltableRow) => {
        const action = await ElMessageBox.confirm(
          `清除设备${row.row.name}的记录`,
          `清除设备${row.row.name}的记录`
        );
        if (action === "confirm") {
          deleteColumns(row.row.devid).then(() => {
            FecthcountInfo()
          });
        }
      };

      const refreshData = () => FecthcountInfo()

      return {
        diskavailable,
        backStat,
        initStat,
        FecthcountInfo,
        devsCount,
        dbSize,
        backDatas,
        initData,
        deleteColumn,
        refreshData,
      };
    },
  });
</script>
