export type ArtalkEmoticonType = "emoji" | "emoticon" | "image"

export interface ArtalkEmoticonItem {
  key: string
  val: string
  type: ArtalkEmoticonType
  group: string
  token?: string
}

export interface ArtalkEmoticonGroup {
  key: string
  label: string
  type: ArtalkEmoticonType
  icons: ArtalkEmoticonItem[]
}

export type ArtalkEmoticonSource =
  | string
  | unknown[]
  | Record<string, unknown>

export type CommentContentPart =
  | {
      type: "text"
      value: string
    }
  | {
      type: "image"
      value: ArtalkEmoticonItem
    }

export const DEFAULT_ARTALK_EMOTICON_URL =
  "https://cdn.jsdelivr.net/gh/ArtalkJS/Emoticons/grps/default.json"

export const ARTALK_EMOTICON_TOKEN_RE = /\[\[atk:[^\]]+\]\]/g

const fallbackEmoticons = [
  {
    key: "common",
    label: "常用",
    icons:
      "😀😁😂😄😅😆😉😊😋😎😍😘😗😙😚😇😐😑😶😏😣😥😮😯😪😫😴😌😛😜😝😒😓😔😕😲😷😖😞😟😤😢😭😦😧😨😬😰😱😳😵😡😠👻👽💘💓💔💕💖💞💰💯",
  },
  {
    key: "character",
    label: "人物",
    icons:
      "👦👧🎅🙅🙆💁🙋🙌🙏👤👥🏃👯💏👪💪👈👆👌👍✊👏📶👣👖👗👔👜👠💄💍🌂🌏☔🌟⛲🐵🐶🐕😿🐈🐆🐮🐷🐗🐏🐘🐇🐻🐼🐔🐣🐸🐍🐉🐳🐟🐡🐙🐚🐛🐝🦋",
  },
  {
    key: "food",
    label: "食物",
    icons:
      "🍇🍈🍉🍊🍋🍌🍍🍎🍏🍐🍑🍒🍓🍅🍆🌽🍄🌰🍞🍖🍗🍔🍟🍕🍳🍲🍱🍘🍙🍚🍛🍜🍝🍠🍢🍣🍤🍥🍡🍦🍧🍨🍩🍪🎂🍰🍫🍬🍭🍮🍯🍼☕🍵🍶🍷🍸🍹🍺🍻🍴",
  },
  {
    key: "thing",
    label: "物品",
    icons:
      "💌💎💈🚪🚿🛁⌛⏰🎈🎉🎎🎏🎐🎀🎁📱☎📞📟📠🔋🔌💻💾💿📺📷📼🔍🔬🔭📡💡📃📰💰📧📨📦📫📭✏📝📂📅📇📈📊📋📌📍📏📐🔓🔏🔑🔨🔫🔗💉💊🚩💦",
  },
  {
    key: "logo",
    label: "标志",
    icons:
      "♠♥♦♣🀄🎴🔇🔈🔉🔊📢📣💤💢💬💭♨🌀🔔🔕✡✝🔯📛🔰🔱⭕✅❌➕➖➗➰➿〽✳✴❇‼⁉❓❔🎦🔠🔤🅰🆎🅱🆑🆒🆔🆖🆗🆙🆚🈁🈶🈯🉐🈹🈚🈲🉑🈸🈴🈳🈺🈵",
  },
]

const normalizeType = (type?: string): ArtalkEmoticonType => {
  if (type === "image") {
    return "image"
  }

  if (type === "emoticon") {
    return "emoticon"
  }

  return "emoji"
}

const normalizeTokenLabel = (text: string) =>
  text
    .trim()
    .replace(/[\[\]\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 32)

const hashText = (text: string) => {
  let hash = 5381

  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i)
  }

  return (hash >>> 0).toString(36)
}

export const createArtalkEmoticonToken = (
  group: string,
  key: string,
  value: string,
) =>
  `[[atk:${normalizeTokenLabel(group) || "表情"}:${
    normalizeTokenLabel(key) || "图片"
  }:${hashText(value)}]]`

const isSafeImageUrl = (value: string) =>
  value.startsWith("/") || /^https?:\/\//i.test(value)

const normalizeUrl = (value: string, baseUrl?: string) => {
  if (!value) {
    return ""
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith("/")) {
    return value
  }

  if (!baseUrl) {
    return value
  }

  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return value
  }
}

const createGroup = (
  label: string,
  type: ArtalkEmoticonType,
  items: Array<{ key?: string; val?: string }>,
  baseUrl?: string,
): ArtalkEmoticonGroup | null => {
  const icons = items
    .map((item, index) => {
      const key = `${item.key || ""}`
      const rawValue = `${item.val || ""}`
      const val = type === "image" ? normalizeUrl(rawValue, baseUrl) : rawValue

      if (!val || (type === "image" && !isSafeImageUrl(val))) {
        return null
      }

      return {
        key: key || `${label}-${index + 1}`,
        val,
        type,
        group: label,
        token:
          type === "image"
            ? createArtalkEmoticonToken(label, key || `${index + 1}`, val)
            : undefined,
      }
    })
    .filter((item): item is ArtalkEmoticonItem => Boolean(item))

  if (!icons.length) {
    return null
  }

  return {
    key: `${label}-${type}-${hashText(label)}`,
    label,
    type,
    icons,
  }
}

const normalizeStandardArtalkGroup = (
  data: unknown,
  baseUrl?: string,
): ArtalkEmoticonGroup | null => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null
  }

  const source = data as {
    name?: string
    type?: string
    items?: Array<{ key?: string; val?: string }>
  }

  if (!source.name || !Array.isArray(source.items)) {
    return null
  }

  return createGroup(
    source.name,
    normalizeType(source.type),
    source.items,
    baseUrl,
  )
}

const normalizeStandardArtalkGroups = (
  data: unknown[],
  baseUrl?: string,
): ArtalkEmoticonGroup[] =>
  data
    .map(group => normalizeStandardArtalkGroup(group, baseUrl))
    .filter((group): group is ArtalkEmoticonGroup => Boolean(group))

const normalizeOwOGroups = (
  data: Record<string, unknown>,
  baseUrl?: string,
): ArtalkEmoticonGroup[] =>
  Object.entries(data)
    .map(([name, rawGroup]) => {
      if (
        !rawGroup ||
        typeof rawGroup !== "object" ||
        Array.isArray(rawGroup)
      ) {
        return null
      }

      const source = rawGroup as {
        type?: string
        container?: Array<{ icon?: string; text?: string }>
      }

      if (!Array.isArray(source.container)) {
        return null
      }

      const type = normalizeType(source.type)
      const items = source.container.map(item => ({
        key: item.text || item.icon || "",
        val: type === "image" ? item.icon || "" : item.icon || item.text || "",
      }))

      return createGroup(name, type, items, baseUrl)
    })
    .filter((group): group is ArtalkEmoticonGroup => Boolean(group))

const normalizeEmoticonData = (
  data: unknown,
  baseUrl?: string,
): {
  groups: ArtalkEmoticonGroup[]
  imports: string[]
} => {
  const imports: string[] = []

  if (Array.isArray(data)) {
    const directGroups = normalizeStandardArtalkGroups(data, baseUrl)

    data.forEach(item => {
      if (typeof item === "string") {
        imports.push(normalizeUrl(item, baseUrl))
      }
    })

    return {
      groups: directGroups,
      imports,
    }
  }

  if (data && typeof data === "object") {
    const directGroup = normalizeStandardArtalkGroup(data, baseUrl)

    if (directGroup) {
      return {
        groups: [directGroup],
        imports,
      }
    }

    return {
      groups: normalizeOwOGroups(data as Record<string, unknown>, baseUrl),
      imports,
    }
  }

  return {
    groups: [],
    imports,
  }
}

const collectSettledGroups = async (
  tasks: Promise<ArtalkEmoticonGroup[]>[],
) => {
  const settledGroups = await Promise.allSettled(tasks)

  return settledGroups.flatMap(result =>
    result.status === "fulfilled" ? result.value : [],
  )
}

const loadSingleEmoticonSource = async (
  source: string,
  visited: Set<string>,
): Promise<ArtalkEmoticonGroup[]> => {
  if (visited.has(source)) {
    return []
  }

  visited.add(source)

  const data = await $fetch<unknown>(source)
  const { groups, imports } = normalizeEmoticonData(data, source)
  const importedGroups = await collectSettledGroups(
    imports.map(url => loadSingleEmoticonSource(url, visited)),
  )

  return groups.concat(importedGroups)
}

const loadInlineEmoticonData = async (
  data: unknown[] | Record<string, unknown>,
  visited: Set<string>,
): Promise<ArtalkEmoticonGroup[]> => {
  const { groups, imports } = normalizeEmoticonData(data)
  const importedGroups = await collectSettledGroups(
    imports.map(url => loadSingleEmoticonSource(url, visited)),
  )

  return groups.concat(importedGroups)
}

const isStringSourceList = (value: unknown[]): value is string[] =>
  value.every(item => typeof item === "string")

export const loadArtalkEmoticonGroups = async (
  sources: ArtalkEmoticonSource | string[],
): Promise<ArtalkEmoticonGroup[]> => {
  if (typeof sources === "string") {
    return loadSingleEmoticonSource(sources, new Set())
  }

  if (Array.isArray(sources)) {
    if (isStringSourceList(sources)) {
      const groups = await collectSettledGroups(
        sources.map(source => loadSingleEmoticonSource(source, new Set())),
      )

      return groups
    }

    return loadInlineEmoticonData(sources, new Set())
  }

  return loadInlineEmoticonData(sources, new Set())
}

export const createFallbackEmoticonGroups = (): ArtalkEmoticonGroup[] =>
  fallbackEmoticons.map(group => ({
    key: group.key,
    label: group.label,
    type: "emoji",
    icons: [...group.icons].map(icon => ({
      key: icon,
      val: icon,
      type: "emoji",
      group: group.label,
    })),
  }))

export const createArtalkImageEmoticonMap = (
  groups: ArtalkEmoticonGroup[],
) => {
  const result = new Map<string, ArtalkEmoticonItem>()

  groups.forEach(group => {
    group.icons.forEach(icon => {
      if (icon.type === "image" && icon.token) {
        result.set(icon.token, icon)
      }
    })
  })

  return result
}

export const splitArtalkEmoticonTokens = (
  content: string,
  imageMap: Map<string, ArtalkEmoticonItem>,
): CommentContentPart[] => {
  const result: CommentContentPart[] = []
  const source = content || ""
  let lastIndex = 0

  for (const match of source.matchAll(ARTALK_EMOTICON_TOKEN_RE)) {
    const token = match[0]
    const index = match.index || 0
    const image = imageMap.get(token)

    if (!image) {
      continue
    }

    if (index > lastIndex) {
      result.push({
        type: "text",
        value: source.slice(lastIndex, index),
      })
    }

    result.push({
      type: "image",
      value: image,
    })

    lastIndex = index + token.length
  }

  if (lastIndex < source.length) {
    result.push({
      type: "text",
      value: source.slice(lastIndex),
    })
  }

  if (!result.length) {
    result.push({
      type: "text",
      value: source,
    })
  }

  return result
}

const escapeHtmlAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

export const renderArtalkImageEmoticonTokens = (
  html: string,
  imageMap: Map<string, ArtalkEmoticonItem>,
) =>
  html.replace(ARTALK_EMOTICON_TOKEN_RE, token => {
    const image = imageMap.get(token)

    if (!image) {
      return token
    }

    return `<img class="artalk-emoticon" src="${escapeHtmlAttr(
      image.val,
    )}" alt="${escapeHtmlAttr(
      image.key || image.group,
    )}" loading="lazy" referrerpolicy="no-referrer" draggable="false" />`
  })
