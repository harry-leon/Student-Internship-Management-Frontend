export const uiConfig = {
  radius: {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
    card: 'rounded-xl',
    button: 'rounded-lg',
    input: 'rounded-lg',
    badge: 'rounded-md',
  },

  spacing: {
    pageX: 'px-4 sm:px-5 lg:px-6',
    pageY: 'py-4 sm:py-5',
    sectionGap: 'space-y-3.5',
    cardPadding: 'p-4 sm:p-5',
    compactCardPadding: 'p-3 sm:p-3.5',
    filterGap: 'gap-2.5',
    tableCellPadding: 'px-3.5 py-2.5',
  },

  typography: {
    pageTitle: 'text-xl font-bold tracking-tight text-[#0b1c30] dark:text-white',
    pageSubtitle: 'text-xs text-slate-500 dark:text-slate-400',
    sectionTitle: 'text-sm font-semibold text-[#0b1c30] dark:text-slate-200',
    cardTitle: 'text-sm font-semibold text-[#0b1c30] dark:text-white',
    body: 'text-xs text-slate-600 dark:text-slate-300',
    caption: 'text-[11px] text-slate-400 dark:text-slate-500',
    label: 'text-xs font-medium text-slate-700 dark:text-slate-300',
  },

  density: {
    tableRow: 'h-11',
    compactTableRow: 'h-9',
    cardMinHeight: 'min-h-[100px]',
    inputHeight: 'h-9',
    buttonSm: 'h-8 px-2.5 text-xs',
    buttonMd: 'h-9 px-3.5 text-xs',
  },

  grid: {
    // Top stats cards
    stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
    // Main dual-pane content
    content: 'grid grid-cols-1 xl:grid-cols-3 gap-3.5',
    // Resource listings (Cards)
    list: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5',
    cards2Col: 'grid grid-cols-1 lg:grid-cols-2 gap-3.5',
    cards3Col: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5',
    cards4Col: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3',
  },
} as const;
