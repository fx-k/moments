<template>
  <UPopover
    v-model:open="open"
    :ui="{
      strategy: 'override',
      wrapper: 'relative inline-flex',
      trigger: 'inline-flex',
      container: 'z-[200] group',
      width: 'w-[min(92vw,320px)]',
      background: 'bg-transparent',
      ring: '',
      rounded: '',
      shadow: '',
    }"
    :popper="{ placement: 'top-end', overflowPadding: 12, strategy: 'absolute' }"
  >
      <slot  @click="open = true"/>
    <template #panel>
     <div class="moments-modal-panel w-full px-4 py-3">
       <button class="moments-modal-close" type="button" title="关闭" @click="cancel()">
         <UIcon name="i-carbon-close" class="w-4 h-4" />
       </button>
       <p class="text-gray-600 dark:text-gray-300 my-2">你确定要删除吗?</p>
       <div class="flex gap-2 items-center justify-end">
         <UButton @click="ok()">确定</UButton>
         <UButton color="white" @click="cancel()">取消</UButton>
       </div>
     </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const open = ref(false)
const emit = defineEmits(['ok','cancel'])
const ok = () => {
  open.value = false
  emit('ok')
}
const cancel = () => {
  emit('cancel')
  open.value = false
}
</script>

<style scoped>

</style>