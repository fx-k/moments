<template>
  <div
    v-if="$route.path !== '/new' && $route.path.indexOf('/edit/') < 0"
    class="header relative mb-14"
  >
    <div
      v-if="$route.path !== '/' && $route.path.indexOf('/memo/') < 0"
      :class="{ 'is-solid': y > 20 }"
      class="moments-topbar z-10 flex fixed justify-between items-center px-4 py-3 w-full max-w-[567px] left-1/2 -translate-x-1/2 text-white top-0"
    >
      <NuxtLink class="flex items-center" title="返回主页">
        <UIcon
          @click="navigateTo('/')"
          name="i-carbon-chevron-left"
          class="w-5 h-5 cursor-pointer mr-4"
        />
        <span v-if="$route.path === '/user/calendar'">日历检索</span>
        <span v-else-if="$route.path === '/sys/settings'">系统设置</span>
        <span v-else-if="$route.path === '/user/settings'">用户中心</span>
        <span v-else-if="$route.path.indexOf('/tags/') >= 0">
          {{ route.params.tag || "话题专栏" }}
        </span>
        <span v-else-if="$route.path === '/friend'">友情链接</span>
        <span v-else>
          <span v-if="!global.userinfo.token && $route.path === '/user/login'">
            登录
          </span>
          <span
            v-else-if="!global.userinfo.token && $route.path === '/user/reg'"
          >
            注册
          </span>
          <span v-else>{{ props.user.nickname }} 的空间</span>
        </span>
      </NuxtLink>
      <NuxtLink
        v-if="$route.path === '/user/settings' && global.userinfo.token"
        class="hidden sm:flex"
        title="登出"
        @click="logout"
      >
        <span class="moments-icon-btn" aria-label="登出">
          <UIcon name="i-carbon-logout" class="w-5 h-5 cursor-pointer" />
        </span>
      </NuxtLink>
      <span
        v-if="$route.path === '/friend' && global.userinfo.id === 1"
        class="flex"
      >
        <span class="moments-icon-btn" aria-label="新增友链">
          <UIcon
            name="i-carbon-add"
            class="w-5 h-5 cursor-pointer"
            @click="$emit('add-friend')"
          />
        </span>
      </span>
    </div>

    <div
      v-if="$route.path === '/'"
      class="flex absolute top-3 right-3 z-10 moments-actions-pill"
    >
      <button class="moments-icon-btn hidden sm:inline-flex" type="button" title="切换显示模式" @click="toggleMode">
        <svg
          v-if="mode.value === 'light'"
          class="lucide lucide-moon-star-icon cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"></path>
          <path d="M20 3v4"></path>
          <path d="M22 5h-4"></path>
        </svg>

        <svg
          v-else
          class="lucide lucide-sun-icon cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
      </button>

      <!-- Shortcuts (available on mobile too; no secondary menu) -->
      <NuxtLink v-if="$route.path === '/'" to="/friend" title="友情链接">
        <span class="moments-icon-btn" aria-label="友情链接">
          <UIcon name="i-carbon-friendship" class="w-5 h-5 cursor-pointer" />
        </span>
      </NuxtLink>
      <NuxtLink
        v-if="global.userinfo.token"
        to="/user/calendar"
        title="日历检索"
      >
        <span class="moments-icon-btn" aria-label="日历检索">
          <UIcon name="i-jam-search-folder" class="w-5 h-5 cursor-pointer" />
        </span>
      </NuxtLink>
      <NuxtLink
        v-if="global.userinfo.id === 1"
        to="/sys/settings"
        title="系统设置"
      >
        <span class="moments-icon-btn" aria-label="系统设置">
          <UIcon name="i-carbon-settings" class="w-5 h-5 cursor-pointer" />
        </span>
      </NuxtLink>
      <NuxtLink
        v-if="global.userinfo.token"
        to="/user/settings"
        title="用户中心"
      >
        <span class="moments-icon-btn" aria-label="用户中心">
          <UIcon name="i-carbon-user-avatar" class="w-5 h-5 cursor-pointer" />
        </span>
      </NuxtLink>

      <!-- Last action: compose (when logged in) or login (when logged out) -->
      <NuxtLink v-if="global.userinfo.token" to="/new" title="发表">
        <span class="moments-icon-btn" aria-label="发表">
          <UIcon name="i-carbon-camera" class="w-5 h-5 cursor-pointer" />
        </span>
      </NuxtLink>
      <NuxtLink v-else to="/user/login" title="登录">
        <span class="moments-icon-btn" aria-label="登录">
          <UIcon name="i-carbon-login" class="w-5 h-5 cursor-pointer" />
        </span>
      </NuxtLink>
    </div>

    <div class="moments-cover-media">
      <img class="header-img w-full" :src="props.user.coverUrl" alt="" />
    </div>
    <div class="absolute right-2 bottom-[-40px] z-10">
      <div class="userinfo flex flex-col">
        <div class="flex flex-row items-center gap-4 justify-end">
          <div class="username text-lg font-bold text-white">
            {{ props.user.nickname }}
          </div>
          <img
            :src="props.user.avatarUrl"
            class="avatar w-[70px] h-[70px] rounded-xl"
          />
        </div>
        <div class="slogon text-gray truncate w-full text-end text-xs mt-2">
          {{ props.user.slogan }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toast } from "vue-sonner";
import type { UserVO } from "~/types";
import { useGlobalState } from "~/store";

const global = useGlobalState();
const route = useRoute();

const props = defineProps<{ user: UserVO }>();
const mode = useColorMode();
const { y } = useWindowScroll();

const logout = async () => {
  global.value.userinfo = {};
  await navigateTo("/");
};

const toggleMode = () => {
  if (mode.preference === "system") {
    mode.preference = "dark";
  } else if (mode.preference === "dark") {
    mode.preference = "light";
  } else {
    mode.preference = "system";
    toast.success("显示模式将跟随系统设置");
  }
};
</script>

<style scoped></style>
