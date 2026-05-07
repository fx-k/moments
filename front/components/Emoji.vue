<template>
  <div class="mt-2">
    <UTabs
      v-if="tabItems.length"
      :items="tabItems"
      :ui="{
        wrapper: 'space-y-0',
        list: { height: 'h-8', tab: { height: 'h-6', padding: 'px-1' } },
      }"
    >
      <template #item="{ item: tabItem }">
        <div
          class="emoji-panel flex flex-wrap gap-1 rounded border p-2 shadow-lg select-none mt-2"
        >
          <button
            v-for="icon in tabItem.icons"
            :key="`${icon.group}-${icon.key}-${icon.val}`"
            type="button"
            :class="['emoji-item', `is-${icon.type}`]"
            :title="icon.key || icon.group"
            @click="selectEmoji(icon)"
          >
            <img
              v-if="icon.type === 'image'"
              class="emoji-image"
              :src="icon.val"
              :alt="icon.key || icon.group"
              loading="lazy"
              referrerpolicy="no-referrer"
              draggable="false"
            />
            <span v-else>{{ icon.val }}</span>
          </button>
        </div>
      </template>
    </UTabs>
    <div
      v-if="!tabItems.length"
      class="emoji-panel flex items-center justify-center rounded border p-4 shadow-lg select-none text-sm text-gray-500 dark:text-gray-300 mt-2"
    >
      {{ loading || !loaded ? "表情包加载中..." : "表情包暂不可用" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ArtalkEmoticonGroup,
  ArtalkEmoticonItem,
} from "~/utils/artalkEmoticons"

const props = withDefaults(
  defineProps<{
    allowImages?: boolean
  }>(),
  {
    allowImages: false,
  },
)

const emit = defineEmits<{
  selected: [value: string]
}>()

const { groups, loading, loaded, load } = useArtalkEmoticons()

onMounted(() => {
  load()
})

const tabItems = computed<ArtalkEmoticonGroup[]>(() =>
  groups.value
    .map(group => ({
      ...group,
      icons: group.icons.filter(
        icon => props.allowImages || icon.type !== "image",
      ),
    }))
    .filter(group => group.icons.length > 0),
)

const selectEmoji = (icon: ArtalkEmoticonItem) => {
  emit("selected", icon.type === "image" ? icon.token || icon.val : icon.val)
}
</script>

<style scoped>
.emoji-panel {
  max-height: min(42vh, 320px);
  overflow: auto;
  background: rgb(255 255 255 / 0.96);
}

:global(.dark) .emoji-panel {
  background: rgb(17 24 39 / 0.96);
}

.emoji-item {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 6px;
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.emoji-item.is-emoticon {
  width: auto;
  min-width: 3.75rem;
  max-width: 100%;
  height: 2rem;
  padding: 0 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.15;
  white-space: nowrap;
  word-break: keep-all;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.emoji-item.is-image {
  width: 2.5rem;
  height: 2.5rem;
}

.emoji-item:hover {
  background: rgb(87 107 149 / 0.1);
  transform: translateY(-1px);
}

.emoji-image {
  max-width: 2.125rem;
  max-height: 2.125rem;
  object-fit: contain;
  display: block;
}
</style>
