<template>
  <span class="inline break-all cursor-pointer" @click="emit('click')">
    <template v-for="(part, index) in parts" :key="index">
      <span v-if="part.type === 'text'">{{ part.value }}</span>
      <img
        v-else
        class="comment-emoticon"
        :src="part.value.val"
        :alt="part.value.key || part.value.group"
        loading="lazy"
        referrerpolicy="no-referrer"
        draggable="false"
      />
    </template>
  </span>
</template>

<script setup lang="ts">
import { splitArtalkEmoticonTokens } from "~/utils/artalkEmoticons"

const props = defineProps<{
  content?: string
}>()

const emit = defineEmits<{
  click: []
}>()

const { imageMap, load } = useArtalkEmoticons()

onMounted(() => {
  load()
})

const parts = computed(() =>
  splitArtalkEmoticonTokens(props.content || "", imageMap.value),
)
</script>

<style scoped>
.comment-emoticon {
  display: inline-block;
  max-width: min(8rem, 42vw);
  max-height: 4rem;
  margin: 0 0.125rem;
  border-radius: 4px;
  object-fit: contain;
  vertical-align: -0.45em;
}
</style>
