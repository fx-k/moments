<template>
  <footer class="p-6 flex justify-center items-center text-xs">
    <div class="flex flex-col gap-3 items-center">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <a
          class="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur hover:bg-white/70 dark:hover:bg-white/10 transition text-slate-700 dark:text-white/80"
          href="https://keke.su"
          target="_blank"
          rel="noreferrer"
          title="主站"
        >
          <UIcon name="i-carbon-earth" class="w-4 h-4" />
          <span class="font-medium">主站 keke.su</span>
          <UIcon name="i-carbon-arrow-up-right" class="w-4 h-4 opacity-70" />
        </a>

        <a
          class="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur hover:bg-white/70 dark:hover:bg-white/10 transition text-slate-700 dark:text-white/80"
          href="https://github.com/fx-k/moments.git"
          target="_blank"
          rel="noreferrer"
          title="在 GitHub 查看"
        >
          <UIcon name="i-carbon-logo-github" class="w-4 h-4" />
          <span class="font-medium">fx-k/moments</span>
          <UIcon name="i-carbon-arrow-up-right" class="w-4 h-4 opacity-70" />
        </a>
      </div>

      <a
        v-if="sysConfig.beiAnNo"
        class="text-gray-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70 transition"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noreferrer"
      >
        {{ sysConfig.beiAnNo }}
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { SysConfigVO } from "~/types";

const sysConfig = useState<SysConfigVO>("sysConfig");
</script>

<style scoped></style>
