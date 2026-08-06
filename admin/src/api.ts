export type PackageContent = { name: string; count: string }

export type AdminPackage = {
  id: string
  merchantId: string
  title: string
  coverImage: string
  price: number
  points: number
  contents: PackageContent[]
  gifts: string[]
  images: string[]
  notices: string[]
  sortOrder: number
}

export type Merchant = {
  id: string
  name: string
  subtitle: string
  pinyin: string
  location: string
  sortOrder: number
  packages: AdminPackage[]
}

export type User = {
  id: string
  nickname: string
  avatar: string
  phone: string
  points: number
  orderCount: number
}

export type Order = {
  id: string
  orderNo: string
  createdAt: string
  status: string
  nickname: string
  phone: string
  content: string
  price: number
  paymentType: 'money' | 'points'
}

export type AdminOrderDetail = Order & {
  merchantName: string
  packageTitle: string
  points: number
  coverImage: string
  contents: PackageContent[]
  gifts: string[]
  images: string[]
  notices: string[]
}

export type ListResult<T> = { items: T[]; total: number; page: number; size: number }

export type PointsCategory = { id: string; label: string; emoji: string; image: string }
export type PointsMallItem = { id: string; category: string; title: string; description: string; redemptionMethod: string; value: number; image: string; emoji: string; points: number }
export type AdminGame = { id: string; image: string; title: string; description: string; link: string; active: boolean }
export type ChartItem = { label: string; value: number }
export type DashboardData = { incomeSources: ChartItem[]; incomeTrend: ChartItem[]; merchantIncome: ChartItem[] }
export type PointsCatalog = { categories: PointsCategory[]; items: PointsMallItem[] }

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/v1/admin${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.data?.message || '操作未完成，请稍后重试')
  return payload.data as T
}

export async function uploadImages(files: FileList | File[]): Promise<string[]> {
  const uploads = Array.from(files).map(async (file) => {
    const form = new FormData()
    form.append('file', file)
    const response = await fetch('/api/v1/admin/uploads', { method: 'POST', body: form })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.data?.message || '图片上传失败')
    return String(payload.data?.url || '')
  })
  return Promise.all(uploads)
}
