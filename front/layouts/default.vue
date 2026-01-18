<template>
  <div class="app-shell">
    <div :class="['app-container', isEditorPage ? 'overflow-visible' : 'overflow-hidden']">
      <slot />
      <Footer />
    </div>

    <div
      title="到顶部"
      v-if="y > 200"
      @click="y = 0"
      class="hidden sm:flex fixed right-6 bottom-12 z-20 w-10 h-10 rounded-full items-center justify-center border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur shadow-md"
    >
      <UIcon
        name="i-lets-icons-expand-top-stop"
        class="w-6 h-6 text-slate-700 dark:text-white cursor-pointer"
      ></UIcon>
    </div>

  <!-- Mobile: only keep “back to top” FAB (no floating menu) -->
  <div
    v-if="y > 300"
    title="到顶部"
    @click="y = 0"
    class="sm:hidden fixed right-4 bottom-10 z-20 w-10 h-10 rounded-full flex items-center justify-center border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur shadow-md"
  >
    <UIcon name="i-lets-icons-expand-top-stop" class="w-6 h-6 text-slate-700 dark:text-white" />
  </div>
  </div>
</template>

<script lang="ts" setup>
import type { SysConfigVO, UserVO } from "~/types";
import { useGlobalState } from "~/store";

const global = useGlobalState();
const route = useRoute();
const currentUser = useState<UserVO>("userinfo");
const sysConfig = useState<SysConfigVO>("sysConfig");
const currentProfile = await useMyFetch<UserVO>("/user/profile");
const sysConfigVO = await useMyFetch<SysConfigVO>("/sysConfig/get");
if (currentProfile) {
  currentUser.value = currentProfile;
  sysConfig.value = sysConfigVO;
}
const { y } = useWindowScroll();

const isEditorPage = computed(() => {
  return route.path === "/new" || route.path.startsWith("/edit/");
});
useHead({
  title: sysConfigVO.title,
  link: [
    {
      rel: "shortcut icon",
      type: "image/png",
      href: sysConfigVO.favicon || "/favicon.png",
    },
    {
      rel: "apple-touch-icon-precomposed",
      href: sysConfigVO.favicon || "/favicon.png",
    },
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: "我的 RSS 订阅",
      href: sysConfigVO.rss || `/rss`,
    },
  ],
  style: [
    {
      innerHTML: sysConfigVO.css || "",
    },
  ],
  script: [
    {
      type: "text/javascript",
      innerHTML: sysConfigVO.js || "",
    },
  ],
});

if (sysConfigVO.enableGoogleRecaptcha) {
  useHead({
    script: [
      {
        type: "text/javascript",
        src: `https://recaptcha.net/recaptcha/api.js?render=${sysConfigVO.googleSiteKey}`,
      },
    ],
  });
}
</script>
