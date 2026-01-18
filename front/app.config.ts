export default defineAppConfig({
  ui: {
    // Make all @nuxt/ui "primary" components (UButton/UToggle/...) use a cool gray palette
    primary: "slate",
    gray: "slate",

    // Popover should be visually transparent; we render our own panel (`moments-modal-panel`) inside.
    popover: {
      base: "relative focus:outline-none overflow-visible",
      background: "bg-transparent",
      ring: "",
      rounded: "",
      shadow: "",
    },
  },
});

