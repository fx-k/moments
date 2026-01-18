<template>
  <div>
    <Header :user="currentUser"/>

    <div class="p-4 space-y-4">
      <UFormGroup label="日期范围" name="contentContains" :ui="{label:{base:'font-bold'}}">
        <UPopover
          :ui="{
            strategy: 'override',
            width: 'w-[min(92vw,420px)]',
            background: 'bg-transparent',
            ring: '',
            rounded: '',
            shadow: '',
          }"
          :popper="{ placement: 'bottom-start', overflowPadding: 12, strategy: 'absolute' }"
        >
          <UButton icon="i-heroicons-calendar-days-20-solid" color="white" variant="solid" class="w-full">
            从 {{ format(state.range.start, 'yyy-MM-dd') }} 到 {{ format(state.range.end, 'yyy-MM-dd') }}
          </UButton>

          <template #panel="{ close }">
            <div class="moments-modal-panel w-full">
              <button class="moments-modal-close" type="button" title="关闭" @click="close()">
                <UIcon name="i-carbon-close" class="w-4 h-4" />
              </button>
              <div class="flex flex-col items-center sm:divide-x divide-gray-200 dark:divide-gray-800 p-3 max-h-[80vh] overflow-auto">
              <div class="hidden sm:flex flex-row py-2">
                <UButton
                    v-for="(range, index) in ranges"
                    :key="index"
                    :label="range.label"
                    color="gray"
                    variant="ghost"
                    class="rounded-none px-3 text-xs"
                    :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
                    truncate
                    @click="selectRange(range.duration)"
                />
              </div>
              <DatePicker v-model="state.range" :columns="1" @close="close"/>
              </div>
            </div>
          </template>
        </UPopover>
      </UFormGroup>

      <UFormGroup label="包含内容" name="contentContains" :ui="{label:{base:'font-bold'}}">
        <UInput v-model="state.contentContains"/>
      </UFormGroup>
      <UFormGroup label="包含标签" name="tagContains" :ui="{label:{base:'font-bold'}}">
        <USelectMenu
          multiple
          v-model="state.tags"
          searchable
          :options="tags"
          :uiMenu="{ height: 'max-h-[50vh]' }"
          :popper="{ placement: 'bottom-start', overflowPadding: 12, strategy: 'absolute' }"
        >
          <template #label>
            <span v-if="state.tags.length" class="truncate">{{ state.tags.join(', ') }}</span>
            <span v-else>选择标签</span>
          </template>
        </USelectMenu>
      </UFormGroup>
      <UFormGroup label="可见性" name="showType" :ui="{label:{base:'font-bold'}}">
        <USelectMenu
          v-model="state.showType"
          :options="[
            { value: -1, label: '所有的' },
            { value: 1, label: '公开的' },
            { value: 0, label: '自己可见' },
          ]"
          option-attribute="label"
          value-attribute="value"
          :popper="{ placement: 'bottom-start', overflowPadding: 12, strategy: 'absolute' }"
        >
          <template #label>
            <span v-if="state.showType === -1">所有的</span>
            <span v-else-if="state.showType === 1">公开的</span>
            <span v-else-if="state.showType === 0">自己可见</span>
            <span v-else>选择可见性</span>
          </template>
        </USelectMenu>
      </UFormGroup>
      <UButton class="my-2" @click="reload">搜索</UButton>
    </div>

    <div class="memo-list">
      <Memo v-bind:memo="m" v-for="m in memos" :key="m.id"/>
    </div>
    <div ref="loadMoreEle" class="text-xs text-center text-gray-500 py-2" @click="loadMore" v-if="hasNext">
      点击加载更多
    </div>
    <div class="text-xs text-center text-gray-500 py-2" @click="loadMore" v-else>
      已经到底啦
    </div>
  </div>
</template>

<script setup lang="ts">
import type {MemoVO, UserVO} from "~/types";
import {add, format, isSameDay, sub} from "date-fns";
import Memo from "~/components/Memo.vue";
import {memoChangedEvent, memoReloadEvent} from "~/event";
import {useElementVisibility} from '@vueuse/core'

const ranges = [
  {label: '一周内', duration: {days: 7}},
  {label: '一月内', duration: {days: 31}},
  {label: '三月内', duration: {days: 90}},
  {label: '本年', duration: {months: 12}},
  {label: '近三年', duration: {years: 3}},
]
const tags = ref<string[]>([])
const currentUser = useState<UserVO>('userinfo')
const state = reactive({
  page: 1,
  size: 10,
  contentContains: "",
  tags: [],
  showType: -1,
  range: {
    start: sub(new Date(), {days: 31}),
    end: add(new Date(), {days: 1})
  }
})

function isRangeSelected(duration: Duration) {
  return isSameDay(state.range.start, sub(new Date(), duration)) && isSameDay(state.range.end, new Date())
}

function selectRange(duration: Duration) {
  state.range = {start: sub(new Date(), duration), end: new Date()}
}

const loadTags = async () => {
  const res = await useMyFetch<{
    tags: string[]
  }>("/tag/list")
  tags.value = res.tags
}


const loadMoreEle = ref(null)
const targetIsVisible = useElementVisibility(loadMoreEle)
watch(targetIsVisible, async (visible) => {
  if (visible) {
    await loadMore()
  }
})
const hasNext = ref(false)


const memos = ref<Array<MemoVO>>([])
onMounted(async () => {
  await loadTags()
  await reload()
})

const reload = async () => {
  state.page = 1
  const res = await useMyFetch<{
    list: Array<MemoVO>,
    total: number,
    hasNext: boolean
  }>('/memo/list', {
    page: state.page,
    size: state.size,
    start: state.range.start,
    end: state.range.end,
    contentContains: state.contentContains,
    showType: state.showType,
    tag: state.tags.join(','),
  })
  memos.value = res.list
  hasNext.value = res.hasNext
}

const loadMore = async () => {
  state.page = state.page + 1
  const res = await useMyFetch<{
    list: Array<MemoVO>,
    total: number,
    hasNext: boolean
  }>('/memo/list', {
    page: state.page,
    size: state.size,
    start: state.range.start,
    end: state.range.end,
    contentContains: state.contentContains,
    showType: state.showType,
    tag: state.tags.join(','),
  })
  memos.value = [...memos.value, ...res.list]
  hasNext.value = res.hasNext
}

memoReloadEvent.on(async () => {
  await reload()
})

memoChangedEvent.on(async (id: number) => {
  const res = await useMyFetch<MemoVO>('/memo/get?latest=1&id=' + id)
  const index = memos.value.findIndex(r => r.id === id)
  if (index >= 0) {
    memos.value[index] = res
  }
})

</script>

<style scoped>

</style>