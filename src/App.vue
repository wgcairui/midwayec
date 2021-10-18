<template>
  <el-container id="layout-default">
    <el-header>
      <el-menu
        class="el-menu-demo flex-grow-1"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
        style="display: flex;"
      >
        <el-menu-item index="0" :route="{ name: 'index' }">LADS EC</el-menu-item>
      </el-menu>
    </el-header>
    <el-container class="main">
      <aside>
        <el-menu
          default-active="1-4-1"
          class="el-menu-vertical-demo"
          :collapse="isCollapse"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
        >
          <el-menu-item @click="isCollapse = !isCollapse">
            <i class="el-icon-s-fold"></i>
            <template #title>收起</template>
          </el-menu-item>
          <el-sub-menu index="1">
            <template #title>
              <i class="el-icon-set-up"></i>
              <span>配置</span>
            </template>
            <el-menu-item-group title="基础数据">
              <el-menu-item index="1-1" :route="{ name: 'device' }">设备设置</el-menu-item>
              <el-menu-item index="1-2" :route="{ name: 'ioManage' }">IO设置</el-menu-item>
              <el-menu-item index="1-3" :route="{ name: 'serial' }">串口设置</el-menu-item>
              <el-menu-item index="1-4" :route="{ name: 'protocol' }">协议管理</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="用户配置">
              <el-menu-item index="1-10" :route="{ name: 'user' }">账号设置</el-menu-item>
              <el-menu-item index="1-11" :route="{ name: 'alarm' }">告警设置</el-menu-item>
              <el-menu-item index="1-12" :route="{ name: 'alarmLinkage' }">告警联动</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="环控管理">
              <el-menu-item index="1-20" :route="{ name: 'dataCount' }">数据统计</el-menu-item>
              <el-menu-item index="1-21" :route="{ name: 'PiInfo' }">环控信息</el-menu-item>
              <el-menu-item index="1-22" :route="{ name: 'wifi' }">wifi配置</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="调试">
              <el-menu-item index="1-30" :route="{ name: 'console' }">调试</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-menu-item index="6" :route="{ name: 'home' }">
            <i class="el-icon-s-home"></i>
            <template #title>状态</template>
          </el-menu-item>
          <el-menu-item index="2" :route="{ name: 'ups' }">
            <i class="el-icon-menu"></i>
            <template #title>UPS</template>
          </el-menu-item>
          <el-menu-item index="3" :route="{ name: 'air' }">
            <i class="el-icon-document"></i>
            <template #title>空调</template>
          </el-menu-item>
          <el-menu-item index="4" :route="{ name: 'em' }">
            <i class="el-icon-setting"></i>
            <template #title>电量仪</template>
          </el-menu-item>
          <el-menu-item index="5" :route="{ name: 'th' }">
            <i class="el-icon-setting"></i>
            <template #title>温湿度</template>
          </el-menu-item>
        </el-menu>
      </aside>
      <el-main class="h-100 overflow-auto flex-grow-1 m-auto">
        <router-view></router-view>
        <el-backtop></el-backtop>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    onMounted,
    reactive,
    ref
  } from "vue";
  import { useStore } from "vuex";
  import { key } from "./vuex";
  export default defineComponent({
    setup() {
      const store = useStore(key)
      const date = new Date().toLocaleDateString();
      const time = ref(new Date().toLocaleTimeString());
      const accont = reactive({
        user: "",
        passwd: "",
      });

      const accont_login = () => {
        const { user, passwd } = accont;
        /* ctx.$util.MessageBox({
          title: "登陆",
          distinguishCancelAndClose: true,
          message: "cceeee",
        }); */
      };

      const isCollapse = ref(false);

      const handleOpen = (key: any, keyPath: any) => {
        console.log(key, keyPath);
      };
      const handleClose = (key: any, keyPath: any) => {
        console.log(key, keyPath);
      };

      onMounted(() => {
        setInterval(() => {
          time.value = new Date().toLocaleTimeString();
        }, 1000);
      });

      return { date, time, accont, accont_login, isCollapse, handleOpen, handleClose };
    },
  });
</script>

<style lang="scss">
  html {
    font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    word-spacing: 1px;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    box-sizing: border-box;
  }

  html,
  body,
  #__nuxt,
  #__layout,
  #layout-default {
    max-height: 100vh;
  }

  .el-header {
    padding: 0 !important;
  }
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    overflow-y: auto;
    border-right: none;
  }

  .main {
    height: calc(100vh - 60px);

    aside {
      background-color: #545c64;
    }

    .nav-items {
      width: 15%;
      margin: 0;
      padding: 0;
      padding: 1rem 2rem;
      li {
        list-style: none;
        margin: 0;
        font-size: 1rem;
        padding: 0.5rem;
        word-wrap: normal;
      }
    }
  }

  .item * {
    color: #fff;
  }

  .navbar-nav > li {
    margin-right: 0.5rem;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
  }

  ::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
</style>
