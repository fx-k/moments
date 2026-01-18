<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>

  <!-- Keep toaster OUTSIDE the app container so it stays fixed in the viewport while scrolling -->
  <Toaster
    position="top-center"
    closeButton
    :toastOptions="{
      unstyled: true,
      classes: {
        toast:
          'relative flex w-full items-start gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-white/85 to-slate-100/70 dark:from-slate-950/70 dark:to-slate-900/50 text-slate-900 dark:text-white backdrop-blur px-4 py-3 shadow-xl',
        title: 'text-sm font-semibold leading-5',
        description: 'text-xs text-slate-600 dark:text-slate-300 mt-0.5',
        closeButton:
          'absolute right-2 top-2 w-7 h-7 inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition',
      },
    }"
  />
</template>

<script lang="ts" setup>
import { Toaster } from 'vue-sonner'
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import '~/assets/simple-markdown.scss'
import '~/assets/theme.scss'
</script>

<style>
div.grecaptcha-badge{
  display: none !important;
}
</style>
