# 前端代码模板

## 阶段一：Git 初始化

🤖 AI 生成代码：.gitignore

```text
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## 阶段三：引入 Ant Design Vue

### main.ts

🤖 AI 生成代码：main.ts

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')
```

## 阶段四：全局布局

🤖 AI 生成代码：布局组件

### src/layouts/BasicLayout.vue
```vue
<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://github.com/your-repo" target="_blank">
          Created by You
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from "@/components/GlobalHeader.vue";
</script>

<style scoped>
#basicLayout .header {
  margin-bottom: 16px;
  box-shadow: #eee 1px 1px 5px;
}

#basicLayout .content {
  background: linear-gradient(to bottom, #fefefe, #fff);
  margin-bottom: 16px;
  padding: 20px;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
```

### src/components/GlobalHeader.vue
```vue
<template>
  <div class="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <div class="title-bar">
          <img class="logo" src="../assets/logo.png" alt="logo" />
          <div class="title">{PROJECT_NAME}</div>
        </div>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col flex="80px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            {{ loginUserStore.loginUser.userName ?? 'User' }}
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from "vue";
import { HomeOutlined, CrownOutlined } from "@ant-design/icons-vue";
import { MenuProps } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useLoginUserStore } from "@/stores/useLoginUserStore";

const loginUserStore = useLoginUserStore();

const router = useRouter();
const current = ref<string[]>(["home"]);

router.afterEach((to, from, failure) => {
  current.value = [to.path];
});

const items = ref<MenuProps["items"]>([
  {
    key: "/",
    icon: () => h(HomeOutlined),
    label: "主页",
    title: "主页",
  },
  {
    key: "/admin",
    icon: () => h(CrownOutlined),
    label: "管理",
    title: "管理",
  },
  {
    key: "/about",
    label: "关于",
    title: "关于",
  },
]);

const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  });
};
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>
```

### src/App.vue
```vue
<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { onMounted } from "vue";

const loginUserStore = useLoginUserStore();

onMounted(() => {
  loginUserStore.fetchLoginUser();
});
</script>

<style>
#app {
}
</style>
```

## 阶段五：路由配置

🤖 AI 生成代码：页面组件

### src/pages/HomePage.vue
```vue
<template>
  <div id="homePage">
    <h1>{PROJECT_NAME}</h1>
    <p>欢迎使用项目初始化模板</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
#homePage {
  padding: 20px;
}
</style>
```

### src/pages/AboutPage.vue
```vue
<template>
  <div id="aboutPage">
    <h1>关于我们</h1>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>
```

🤖 AI 生成代码：路由配置

### src/router/index.ts
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/AboutPage.vue')
    }
  ]
})

export default router
```

## 阶段六：Axios 请求封装 & OpenAPI

🤖 AI 生成代码：请求工具与配置

### src/request.ts
```typescript
import axios from "axios";

const myAxios = axios.create({
  baseURL: "http://localhost:{PORT}", // 后端端口，由 AI 替换
  timeout: 10000,
  withCredentials: true,
});

// 添加请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 请求发送前做些什么
    return config;
  },
  function (error) {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 添加响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data } = response;
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息的请求，且当前不在登录页，则跳转到登录页
      if (
        !response.request.responseURL.includes("user/current") &&
        !window.location.pathname.includes("/user/login")
      ) {
        window.location.href = `/user/login?redirect=${window.location.href}`;
      }
    }
    return response;
  },
  function (error) {
    // 处理响应错误
    return Promise.reject(error);
  }
);

export default myAxios;
```

### openapi.config.js
```javascript
import { generateService } from '@umijs/openapi'

generateService({
  requestLibPath: "import request from '@/request'",
  schemaPath: 'http://localhost:{PORT}/api/v2/api-docs', // 后端端口，由 AI 替换
  projectName: 'backend',
})
```

## 阶段七：全局状态管理 (Pinia)

🤖 AI 生成代码：Store

### src/stores/useLoginUserStore.ts
```typescript
import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * 登录用户状态
 */
export const useLoginUserStore = defineStore("loginUser", () => {
  const loginUser = ref<any>({
    userName: "未登录",
  });

  async function fetchLoginUser() {
    // TODO: 后端 UserController 就绪后取消注释
    // const res = await UserControllerService.getLoginUserUsingGet();
    // if (res.code === 0 && res.data) {
    //   loginUser.value = res.data;
    // }
    
    // 初始化阶段临时使用默认值
    loginUser.value = { userName: "未登录" };
  }

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser;
  }

  return { loginUser, setLoginUser, fetchLoginUser };
});
```
