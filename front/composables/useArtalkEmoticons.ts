import { computed } from "vue"
import type { SysConfigVO } from "~/types"
import {
  DEFAULT_ARTALK_EMOTICON_URL,
  createArtalkImageEmoticonMap,
  createFallbackEmoticonGroups,
  loadArtalkEmoticonGroups,
  type ArtalkEmoticonSource,
  type ArtalkEmoticonGroup,
} from "~/utils/artalkEmoticons"

const parseSourceConfig = (source: unknown): ArtalkEmoticonSource | string[] => {
  if (Array.isArray(source)) {
    return source
  }

  if (source && typeof source === "object") {
    return source as Record<string, unknown>
  }

  if (typeof source === "string" && source.trim()) {
    const text = source.trim()

    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text)

        if (Array.isArray(parsed)) {
          return parsed
        }

        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, unknown>
        }
      } catch {
        return text
      }
    }

    const lines = text
      .split(/\r?\n/)
      .map(item => item.trim())
      .filter(Boolean)

    if (lines.length > 1) {
      return lines
    }

    return lines[0] || text
  }

  return DEFAULT_ARTALK_EMOTICON_URL
}

export const useArtalkEmoticons = () => {
  const sysConfig = useState<SysConfigVO>("sysConfig")
  const groups = useState<ArtalkEmoticonGroup[]>(
    "artalkEmoticonGroups",
    () => [],
  )
  const loading = useState("artalkEmoticonsLoading", () => false)
  const loaded = useState("artalkEmoticonsLoaded", () => false)
  const loadedSource = useState("artalkEmoticonsLoadedSource", () => "")
  const error = useState("artalkEmoticonsError", () => "")

  const load = async () => {
    if (!import.meta.client || loading.value) {
      return
    }

    const source = parseSourceConfig(sysConfig.value?.commentEmoticonJson)
    const sourceKey = JSON.stringify(source)

    if (loaded.value && loadedSource.value === sourceKey) {
      return
    }

    loading.value = true
    loaded.value = false
    loadedSource.value = ""
    error.value = ""
    groups.value = []

    try {
      const remoteGroups = await loadArtalkEmoticonGroups(source)

      if (remoteGroups.length) {
        groups.value = remoteGroups
      } else {
        groups.value = createFallbackEmoticonGroups()
      }

      loaded.value = true
      loadedSource.value = sourceKey
    } catch (err) {
      error.value = err instanceof Error ? err.message : `${err}`
      groups.value = createFallbackEmoticonGroups()
      loaded.value = true
      loadedSource.value = sourceKey
    } finally {
      loading.value = false
    }
  }

  const imageMap = computed(() => createArtalkImageEmoticonMap(groups.value))

  return {
    groups,
    loading,
    loaded,
    error,
    imageMap,
    load,
  }
}
