export const ADMIN_SECTIONS = [
  { permission: 'dashboard', label: 'Dashboard', path: '/admin', icon: 'mdi:view-dashboard-outline', group: 'Overview' },
  { permission: 'reports', label: 'Reports', path: '/admin/reports', icon: 'mdi:chart-box-outline', group: 'Overview' },
  { permission: 'orders', label: 'Orders', path: '/admin/orders', icon: 'mdi:receipt-text-outline', group: 'Sales' },
  { permission: 'coupons', label: 'Coupons', path: '/admin/coupons', icon: 'mdi:ticket-percent-outline', group: 'Sales' },
  { permission: 'products', label: 'Products', path: '/admin/products', icon: 'mdi:package-variant-closed', group: 'Catalog' },
  { permission: 'reviews', label: 'Reviews', path: '/admin/reviews', icon: 'mdi:star-outline', group: 'Catalog' },
  { permission: 'newsletter', label: 'Newsletter', path: '/admin/newsletter', icon: 'mdi:email-outline', group: 'Marketing' },
  { permission: 'shipping', label: 'Shipping', path: '/admin/shipping', icon: 'mdi:truck-outline', group: 'Settings' },
  { permission: 'settings', label: 'Store settings', path: '/admin/settings', icon: 'mdi:storefront-outline', group: 'Settings' },
] as const

export type AdminPermission = (typeof ADMIN_SECTIONS)[number]['permission']

export const ADMIN_PERMISSIONS: AdminPermission[] = ADMIN_SECTIONS.map((section) => section.permission)

// Products at or below this stock count as "low stock" in the dashboard.
export const LOW_STOCK_LIMIT = 2

export interface AdminAccess {
  email: string
  isOwner: boolean
  permissions: AdminPermission[]
}

// Activity log areas (the part of an action before the dot) and the section each belongs to.
// Every admin sees the log of the sections they can open; changes to admins are the owner's only.
const ACTIVITY_AREAS: Record<string, AdminPermission | null> = {
  product: 'products', order: 'orders', coupon: 'coupons', settings: 'settings',
  shipping: 'shipping', review: 'reviews', newsletter: 'newsletter', admin: null,
}

export function activityAreasFor(access: AdminAccess | null | undefined) {
  if (!access) return []
  return Object.entries(ACTIVITY_AREAS)
    .filter(([, permission]) => access.isOwner || (permission !== null && access.permissions.includes(permission)))
    .map(([area]) => area)
}
