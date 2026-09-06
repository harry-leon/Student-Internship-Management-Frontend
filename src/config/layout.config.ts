export const layoutConfig = {
  sidebar: {
    width: 228,
    collapsedWidth: 80,
    zIndex: 50,
    widthClass: 'w-[228px]',
    contentOffsetClass: 'lg:pl-[228px]',
    headerOffsetClass: 'lg:left-[228px]',
  },

  header: {
    height: 56,
    heightClass: 'h-[56px]',
    contentOffsetClass: 'pt-[56px]',
    zIndex: 40,
    padding: 'px-4 sm:px-6 lg:px-7',
    navOffset: 'lg:ml-2',
    navGap: 'gap-1.5',
    navTypography: 'text-[12.5px] sm:text-[13px]',
  },

  content: {
    maxWidth: 'max-w-[1480px]',
    wrapperClass: 'w-full max-w-[1480px] mx-auto p-3 sm:p-4 lg:p-4.5',
    gap: 'space-y-3.5',
  },

  page: {
    headerPadding: 'p-3.5 sm:p-4',
    titleSize: 'text-xl font-bold tracking-tight text-[#0b1c30] dark:text-white',
    subtitleSize: 'mt-0.5 text-xs text-slate-500 dark:text-slate-400',
  },
} as const;
