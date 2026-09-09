export const themeConfig = {
  colors: {
    primary: {
      brand: '#004ac6',
      hover: '#003896',
      active: '#2563eb',
      subtle: '#eff4ff',
      border: '#dce9ff',
    },
    success: 'emerald',
    warning: 'amber',
    danger: 'rose',
    neutral: 'slate',
    info: 'blue',
  },

  surface: {
    app: 'bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100',
    card: 'bg-white text-slate-950 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800',
    muted: 'bg-slate-50 dark:bg-slate-800/60',
    elevated: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl',
    tableHeader: 'bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    tableRowHover: 'hover:bg-blue-50/40 dark:hover:bg-slate-800/50',
  },

  input: {
    base: 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#004ac6] focus:bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900',
    select: 'bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 focus:border-[#004ac6] dark:focus:border-blue-500',
  },

  status: {
    // Normal normalized keys
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    completed: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    error: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    invited: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',

    // Uppercase mapping for direct status constants
    'ACTIVE': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    'IN PROGRESS': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
    'CANCELLED': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    'UPCOMING': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    'DRAFT': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    'SUBMITTED': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
    'REVIEWED': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    'NEEDS_REVISION': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    'LATE': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
  },

  roles: {
    Admin: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    Mentor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    Student: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    Manager: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
  },

  buttons: {
    primary: 'bg-[#004ac6] hover:bg-[#003896] text-white shadow-2xs focus-visible:ring-[#004ac6]/30',
    secondary: 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-[#dce9ff] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-300 dark:border-slate-700',
    outline: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs focus-visible:ring-rose-500/30',
  },
} as const;

export type ThemeStatusKey = keyof typeof themeConfig.status;
export type ThemeRoleKey = keyof typeof themeConfig.roles;
export type ThemeButtonVariant = keyof typeof themeConfig.buttons;
