import { ClipboardEvent, FormEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode, useEffect, useMemo, useRef, useState, WheelEvent } from 'react'
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit3,
  Gift,
  Gamepad2,
  GripVertical,
  ImagePlus,
  LoaderCircle,
  LogOut,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react'
import { AdminGame, AdminOrderDetail, AdminPackage, api, ChartItem, DashboardData, GameCategory, ListResult, Merchant, Order, PackageContent, PointsCatalog, PointsCategory, PointsMallItem, uploadImages, User } from './api'
import { AMapApi, formatCoordinates, loadAMap, MapCoordinates, parseCoordinates } from './amap'

type PageName = 'dashboard' | 'merchants' | 'points-mall' | 'games' | 'users' | 'orders' | 'settings'
type DragMerchant = { id: string; startIds: string[] }
type DragPackage = { merchantId: string; id: string; startIds: string[] }

const emptyPackage = (merchantId = '') => ({
  merchantId,
  title: '',
  coverImage: '',
  price: 0,
  points: 0,
  contents: [] as PackageContent[],
  gifts: [] as string[],
  images: [] as string[],
  notices: [] as string[],
  active: true,
  stock: -1,
  sellStart: null as string | null,
  sellEnd: null as string | null,
  purchaseLimit: 0,
  validityDays: 30,
})

function localDateTimeValue(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const redemptionMethods = ['现场核销', '快递邮寄', 'APP抵用券']
const gameCategories: Array<{ id: GameCategory; label: string }> = [
  { id: 'drinking', label: '喝酒游戏' },
  { id: 'multiplayer', label: '多人游戏' },
  { id: 'single', label: '单人游戏' },
]

const chartColors = ['#182743', '#ffb000', '#00bcd4', '#ff4f8b']
const chartGradients = [
  ['#182743', '#4267ff'],
  ['#ffb000', '#ff6b2d'],
  ['#00d4ff', '#00b894'],
  ['#ff4f8b', '#8b5cf6'],
]
const adminAuthKey = 'lbb-admin-authenticated'
const adminBasePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')

function adminPath(path: string) {
  return `${adminBasePath}${path}`
}

function currentPage(): PageName {
  const path = adminBasePath && window.location.pathname.startsWith(adminBasePath) ? window.location.pathname.slice(adminBasePath.length) || '/' : window.location.pathname
  if (path.startsWith('/dashboard')) return 'dashboard'
  if (path.startsWith('/points-mall')) return 'points-mall'
  if (path.startsWith('/games')) return 'games'
  if (path.startsWith('/settings')) return 'settings'
  if (path.startsWith('/users')) return 'users'
  if (path.startsWith('/orders')) return 'orders'
  return 'merchants'
}

function move<T>(items: T[], source: number, target: number) {
  const next = [...items]
  next.splice(target, 0, next.splice(source, 1)[0])
  return next
}

function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function restrictDecimalInput(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key.length !== 1 || /\d/.test(event.key)) return
  if (event.key === '.' && !event.currentTarget.value.includes('.')) return
  event.preventDefault()
}

function restrictDecimalPaste(event: ClipboardEvent<HTMLInputElement>) {
  const input = event.currentTarget
  const start = input.selectionStart || 0
  const end = input.selectionEnd || start
  const next = `${input.value.slice(0, start)}${event.clipboardData.getData('text')}${input.value.slice(end)}`
  if (!/^\d*\.?\d*$/.test(next)) event.preventDefault()
}

function restrictIntegerInput(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key.length === 1 && !/\d/.test(event.key)) event.preventDefault()
}

function restrictIntegerPaste(event: ClipboardEvent<HTMLInputElement>) {
  if (!/^\d*$/.test(event.clipboardData.getData('text'))) event.preventDefault()
}

function numericCount(value: string, fallback = '') {
  return String(value).replace(/\D/g, '') || fallback
}

function giftRow(value: string): PackageContent {
  const matched = String(value).match(/^(.*?)(?:\s*[x×]\s*|\s+)(\d+)$/)
  return matched ? { name: matched[1].trim(), count: matched[2] } : { name: value, count: '1' }
}

function statusLabel(status: string) {
  return ({ pending: '待核销', verified: '已核销', expired: '已失效', refunding: '退款中', refunded: '已退款' } as Record<string, string>)[status] || status
}

export default function App() {
  const page = currentPage()
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem(adminAuthKey) === 'true')

  const login = (username: string, password: string) => {
    if (username !== 'jsl' || password !== 'jsl') return false
    localStorage.setItem(adminAuthKey, 'true')
    setAuthenticated(true)
    return true
  }

  const logout = () => {
    localStorage.removeItem(adminAuthKey)
    setAuthenticated(false)
  }

  if (!authenticated) return <LoginPage onLogin={login} />

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href={adminPath('/merchants')}><span>乐伴伴</span> 商城后台</a>
        <nav aria-label="后台导航">
          <NavItem active={page === 'dashboard'} href={adminPath('/dashboard')} icon={<BarChart3 size={17} />}>数据看板</NavItem>
          <NavItem active={page === 'merchants'} href={adminPath('/merchants')} icon={<Store size={17} />}>商家管理</NavItem>
          <NavItem active={page === 'points-mall'} href={adminPath('/points-mall')} icon={<Gift size={17} />}>积分商城</NavItem>
          <NavItem active={page === 'games'} href={adminPath('/games')} icon={<Gamepad2 size={17} />}>游戏管理</NavItem>
          <NavItem active={page === 'orders'} href={adminPath('/orders')} icon={<ShoppingBag size={17} />}>订单管理</NavItem>
          <NavItem active={page === 'users'} href={adminPath('/users')} icon={<UsersRound size={17} />}>用户管理</NavItem>
          <NavItem active={page === 'settings'} href={adminPath('/settings')} icon={<Settings size={17} />}>系统设置</NavItem>
        </nav>
        <div className="operator"><button type="button" onClick={logout}><LogOut size={17} />退出</button></div>
      </header>
      <main className="workspace">
        {page === 'dashboard' && <DashboardPage />}
        {page === 'merchants' && <MerchantPage />}
        {page === 'points-mall' && <PointsMallPage />}
        {page === 'games' && <GamesPage />}
        {page === 'users' && <UsersPage />}
        {page === 'orders' && <OrdersPage />}
        {page === 'settings' && <SettingsPage />}
      </main>
    </div>
  )
}

function LoginPage({ onLogin }: { onLogin: (username: string, password: string) => boolean }) {
  const [error, setError] = useState('')

  const moveBackground = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    event.currentTarget.style.setProperty('--login-shift-x', `${x * -72}px`)
    event.currentTarget.style.setProperty('--login-shift-y', `${y * -52}px`)
  }

  const resetBackground = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--login-shift-x', '0px')
    event.currentTarget.style.setProperty('--login-shift-y', '0px')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const username = String(form.get('username') || '').trim()
    const password = String(form.get('password') || '').trim()
    if (onLogin(username, password)) return
    setError('账号或密码不正确')
  }

  return <main className="login-page" onMouseMove={moveBackground} onMouseLeave={resetBackground}>
    <section className="login-panel">
      <h1>乐伴伴商家严选 管理平台</h1>
      <form onSubmit={submit} className="login-form">
        <Field label="管理员账号"><input name="username" autoComplete="username" autoFocus required /></Field>
        <Field label="管理员密码"><input name="password" type="password" autoComplete="current-password" required /></Field>
        {error && <div className="login-error" role="alert">{error}</div>}
        <button className="primary-button" type="submit">登录</button>
      </form>
    </section>
  </main>
}

function NavItem({ active, href, icon, children }: { active: boolean; href: string; icon: ReactNode; children: ReactNode }) {
  return <a className={`nav-item${active ? ' active' : ''}`} href={href}>{icon}{children}</a>
}

function MerchantPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [merchantDraft, setMerchantDraft] = useState<Merchant | null | undefined>(undefined)
  const [packageDraft, setPackageDraft] = useState<{ value: Partial<AdminPackage>; merchantId: string } | null>(null)
  const [selectedMerchantID, setSelectedMerchantID] = useState('')
  const [dragMerchant, setDragMerchant] = useState<DragMerchant | null>(null)
  const [dragPackage, setDragPackage] = useState<DragPackage | null>(null)
  const [merchantTabsExpanded, setMerchantTabsExpanded] = useState(false)
  const [merchantTabsOverflow, setMerchantTabsOverflow] = useState(false)
  const [merchantTabsCollapsing, setMerchantTabsCollapsing] = useState(false)
  const [merchantTabsHeight, setMerchantTabsHeight] = useState<number | null>(null)
  const merchantsRef = useRef<Merchant[]>([])
  const dragMerchantRef = useRef<DragMerchant | null>(null)
  const dragPackageRef = useRef<DragPackage | null>(null)
  const merchantTabsRef = useRef<HTMLElement | null>(null)

  const refresh = async () => {
    setLoading(true)
    try { setMerchants(await api<Merchant[]>('/merchants')) } catch (error) { alertMessage(error) } finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [])
  useEffect(() => { merchantsRef.current = merchants }, [merchants])
  useEffect(() => {
    if (!merchants.some((merchant) => merchant.id === selectedMerchantID)) setSelectedMerchantID(merchants[0]?.id || '')
  }, [merchants, selectedMerchantID])
  useEffect(() => {
    if (merchantTabsExpanded) return
    const tabs = merchantTabsRef.current
    if (!tabs) return
    const measure = () => setMerchantTabsOverflow(tabs.scrollWidth > tabs.clientWidth + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(tabs)
    return () => observer.disconnect()
  }, [merchants, merchantTabsExpanded])

  const selectedMerchant = merchants.find((merchant) => merchant.id === selectedMerchantID) || merchants[0]

  const toggleMerchantTabs = () => {
    const tabs = merchantTabsRef.current
    if (!tabs || merchantTabsHeight !== null) return
    if (merchantTabsExpanded) {
      const collapsedHeight = tabs.querySelector<HTMLElement>('.merchant-tab')?.offsetHeight || tabs.offsetHeight
      setMerchantTabsHeight(tabs.offsetHeight)
      setMerchantTabsCollapsing(true)
      requestAnimationFrame(() => setMerchantTabsHeight(collapsedHeight))
      return
    }
    setMerchantTabsHeight(tabs.offsetHeight)
    setMerchantTabsExpanded(true)
    requestAnimationFrame(() => {
      const expandedTabs = merchantTabsRef.current
      if (expandedTabs) setMerchantTabsHeight(expandedTabs.scrollHeight)
    })
  }

  const finishMerchantTabsAnimation = (event: React.TransitionEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'height') return
    if (merchantTabsCollapsing) {
      setMerchantTabsExpanded(false)
      setMerchantTabsCollapsing(false)
    }
    setMerchantTabsHeight(null)
  }

  const beginMerchantDrag = (merchantId: string) => {
    const state = { id: merchantId, startIds: merchantsRef.current.map((item) => item.id) }
    dragMerchantRef.current = state
    setDragMerchant(state)
  }

  const previewMerchantOrder = (targetId: string) => {
    const drag = dragMerchantRef.current
    if (!drag || drag.id === targetId) return
    setMerchants((current) => {
      const source = current.findIndex((item) => item.id === drag.id)
      const target = current.findIndex((item) => item.id === targetId)
      if (source < 0 || target < 0 || source === target) return current
      const next = move(current, source, target)
      merchantsRef.current = next
      return next
    })
  }

  const finishMerchantDrag = async () => {
    const drag = dragMerchantRef.current
    const ids = merchantsRef.current.map((item) => item.id)
    dragMerchantRef.current = null
    setDragMerchant(null)
    if (!drag || sameOrder(drag.startIds, ids)) return
    try { await api('/merchants/reorder', 'PATCH', { ids }) } catch (error) { alertMessage(error); void refresh() }
  }

  const beginPackageDrag = (merchantId: string, packageId: string) => {
    const merchant = merchantsRef.current.find((item) => item.id === merchantId)
    const state = { merchantId, id: packageId, startIds: merchant?.packages.map((item) => item.id) || [] }
    dragPackageRef.current = state
    setDragPackage(state)
  }

  const previewPackageOrder = (merchantId: string, targetId: string) => {
    const drag = dragPackageRef.current
    if (!drag || drag.merchantId !== merchantId || drag.id === targetId) return
    setMerchants((current) => {
      const next = current.map((merchant) => {
        if (merchant.id !== merchantId) return merchant
        const source = merchant.packages.findIndex((item) => item.id === drag.id)
        const target = merchant.packages.findIndex((item) => item.id === targetId)
        if (source < 0 || target < 0 || source === target) return merchant
        return { ...merchant, packages: move(merchant.packages, source, target) }
      })
      merchantsRef.current = next
      return next
    })
  }

  const finishPackageDrag = async () => {
    const drag = dragPackageRef.current
    dragPackageRef.current = null
    setDragPackage(null)
    if (!drag) return
    const merchant = merchantsRef.current.find((item) => item.id === drag.merchantId)
    const ids = merchant?.packages.map((item) => item.id) || []
    if (sameOrder(drag.startIds, ids)) return
    try { await api('/packages/reorder', 'PATCH', { merchantId: drag.merchantId, ids }) } catch (error) { alertMessage(error); void refresh() }
  }

  const deleteMerchant = async (merchant: Merchant) => {
    if (!window.confirm(`删除“${merchant.name}”及其全部套餐？`)) return
    try { await api(`/merchants/${merchant.id}`, 'DELETE'); await refresh() } catch (error) { alertMessage(error) }
  }

  const deletePackage = async (item: AdminPackage) => {
    if (!window.confirm(`删除套餐“${item.title}”？`)) return
    try { await api(`/packages/${item.id}`, 'DELETE'); await refresh() } catch (error) { alertMessage(error) }
  }

  return <>
    {loading ? <Loading /> : <>
      <div className="merchant-tabs-row">
      <section ref={merchantTabsRef} className={`merchant-tabs merchant-tabs-merchants${merchantTabsExpanded ? ' expanded' : ''}`} style={merchantTabsHeight === null ? undefined : { height: merchantTabsHeight }} onTransitionEnd={finishMerchantTabsAnimation} role="tablist" aria-label="商家列表">
        {merchants.map((merchant) => <button
          className={`merchant-tab${merchant.id === selectedMerchant?.id ? ' active' : ''}${dragMerchant?.id === merchant.id ? ' dragging' : ''}`}
          key={merchant.id}
          role="tab"
          aria-selected={merchant.id === selectedMerchant?.id}
          draggable
          onClick={() => setSelectedMerchantID(merchant.id)}
          onDragStart={() => beginMerchantDrag(merchant.id)}
          onDragEnter={() => previewMerchantOrder(merchant.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => event.preventDefault()}
          onDragEnd={() => void finishMerchantDrag()}
        ><GripVertical size={16} /><span className="merchant-tab-copy"><span>{merchant.name}</span>{merchant.subtitle && <span className="merchant-tab-subtitle">{merchant.subtitle}</span>}</span><small>{merchant.packages.length}</small></button>)}
      </section>
      {merchantTabsOverflow && <button className="quiet-button merchant-tabs-toggle" type="button" aria-expanded={merchantTabsExpanded} disabled={merchantTabsHeight !== null} onClick={toggleMerchantTabs}>{merchantTabsExpanded ? '收起' : '全部'}{merchantTabsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>}
      <div className="merchant-tab-actions"><IconButton label="刷新商家列表" onClick={() => void refresh()}><RefreshCw size={18} /></IconButton><button className="primary-button" onClick={() => setMerchantDraft(null)}><Plus size={18} />新增商家</button></div>
      </div>
      {selectedMerchant && <section className="selected-merchant" aria-label={`${selectedMerchant.name}套餐列表`}>
        <div className="merchant-row">
          <div className="merchant-name"><strong>{selectedMerchant.name}</strong><span>{selectedMerchant.packages.length} 个套餐</span></div>
          <div className="row-actions">
            <IconButton label={`编辑${selectedMerchant.name}`} onClick={() => setMerchantDraft(selectedMerchant)}><Edit3 size={17} /></IconButton>
            <IconButton label={`删除${selectedMerchant.name}`} danger onClick={() => void deleteMerchant(selectedMerchant)}><Trash2 size={17} /></IconButton>
            <button className="quiet-button" onClick={() => setPackageDraft({ value: emptyPackage(selectedMerchant.id), merchantId: selectedMerchant.id })}><PackagePlus size={16} />新增套餐</button>
          </div>
        </div>
        <div className="package-vertical-list">
          {selectedMerchant.packages.length === 0 && <div className="empty-state">暂无套餐</div>}
          {selectedMerchant.packages.map((item) => <article className={`package-vertical-item${dragPackage?.id === item.id ? ' dragging' : ''}`} key={item.id} draggable onDragStart={() => beginPackageDrag(selectedMerchant.id, item.id)} onDragEnter={() => previewPackageOrder(selectedMerchant.id, item.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => event.preventDefault()} onDragEnd={() => void finishPackageDrag()}>
            <span className="drag-handle" title="拖拽排序"><GripVertical size={18} /></span>
            <Thumbnail src={item.coverImage} alt="" />
            <div className="package-vertical-main"><div className="package-vertical-title"><strong>{item.title}</strong><small className="package-title-sale-meta">{!item.active ? '已下架 · ' : ''}有效期 {item.validityDays} 天 · {item.stock === 0 ? '已售罄' : item.stock === -1 ? '不限库存' : `库存 ${item.stock}`}</small></div><span>{item.contents.map((content) => `${content.name} ${content.count}`).join('、') || '未设置套餐内容'}</span></div>
            <div className="package-vertical-meta"><span>¥{item.price.toFixed(2)}</span><small>赠送 {item.points} 积分</small></div>
            <div className="row-actions"><IconButton label={`编辑${item.title}`} onClick={() => setPackageDraft({ value: item, merchantId: selectedMerchant.id })}><Edit3 size={17} /></IconButton><IconButton label={`删除${item.title}`} danger onClick={() => void deletePackage(item)}><Trash2 size={17} /></IconButton></div>
          </article>)}
        </div>
      </section>}
    </>}
    {merchantDraft !== undefined && <MerchantModal value={merchantDraft} onClose={() => setMerchantDraft(undefined)} onSaved={refresh} />}
    {packageDraft && <PackageModal merchantId={packageDraft.merchantId} value={packageDraft.value} onClose={() => setPackageDraft(null)} onSaved={refresh} />}
  </>
}

function MerchantModal({ value, onClose, onSaved }: { value: Merchant | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [location, setLocation] = useState(value?.location || '')
  const [pickingLocation, setPickingLocation] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    try {
      const subtitle = String(form.get('subtitle') || '').trim()
      const location = String(form.get('location') || '').trim()
      const phone = String(form.get('phone') || '').trim()
      await api(value ? `/merchants/${value.id}` : '/merchants', value ? 'PATCH' : 'POST', { name, subtitle, location, phone })
      await onSaved(); onClose()
    } catch (error) { alertMessage(error) }
  }
  return <><Modal title={value ? '编辑商家' : '新增商家'} onClose={onClose}><form onSubmit={submit} className="form-grid"><Field label="商家名称" required><input name="name" defaultValue={value?.name || ''} autoFocus required /></Field><Field label="次标题"><input name="subtitle" defaultValue={value?.subtitle || ''} placeholder="如：丰泽店" /></Field><Field label="位置" required action={<button type="button" className="quiet-button map-picker-trigger" onClick={() => setPickingLocation(true)}>从地图选取</button>}><input name="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="如：118.6599,24.9219" required /></Field><Field label="联系电话" required><input name="phone" type="tel" defaultValue={value?.phone || ''} placeholder="如：0595-12345678" required /></Field><FormActions onClose={onClose} /></form></Modal>{pickingLocation && <LocationPicker initialLocation={location} onClose={() => setPickingLocation(false)} onConfirm={(coordinates) => { setLocation(formatCoordinates(coordinates)); setPickingLocation(false) }} />}</>
}

const defaultMerchantCoordinates: MapCoordinates = { longitude: 118.675675, latitude: 24.874492 }

function LocationPicker({ initialLocation, onClose, onConfirm }: { initialLocation: string; onClose: () => void; onConfirm: (coordinates: MapCoordinates) => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [coordinates, setCoordinates] = useState(() => parseCoordinates(initialLocation) || defaultMerchantCoordinates)
  const [status, setStatus] = useState('正在加载地图')
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let map: InstanceType<AMapApi['Map']> | null = null
    let marker: InstanceType<AMapApi['Marker']> | null = null

    void loadAMap().then((AMap) => {
      if (cancelled || !mapRef.current) return
      map = new AMap.Map(mapRef.current, { zoom: 15, center: [coordinates.longitude, coordinates.latitude] })
      marker = new AMap.Marker({ position: [coordinates.longitude, coordinates.latitude] })
      map.add(marker)
      map.on('click', (event) => {
        const next = { longitude: event.lnglat.getLng(), latitude: event.lnglat.getLat() }
        marker?.setPosition([next.longitude, next.latitude])
        setCoordinates(next)
      })
      setStatus('点击地图选择位置')
      setMapReady(true)
    }).catch((error: unknown) => {
      if (!cancelled) setStatus(error instanceof Error ? error.message : '高德地图加载失败')
    })

    return () => { cancelled = true; map?.destroy() }
  }, [])

  return <Modal title="从地图选取位置" onClose={onClose} wide><div className="map-picker"><div className="map-picker-canvas" ref={mapRef}><span className="map-picker-status">{status}</span></div><div className="map-picker-coordinate">经度 {coordinates.longitude.toFixed(6)}，纬度 {coordinates.latitude.toFixed(6)}</div><div className="form-actions"><button type="button" className="quiet-button" onClick={onClose}>取消</button><button type="button" className="primary-button" disabled={!mapReady} onClick={() => onConfirm(coordinates)}>确认选点</button></div></div></Modal>
}

function PackageModal({ merchantId, value, onClose, onSaved }: { merchantId: string; value: Partial<AdminPackage>; onClose: () => void; onSaved: () => Promise<void> }) {
  const [cover, setCover] = useState(value.coverImage || '')
  const [images, setImages] = useState(value.images || [])
  const [contents, setContents] = useState<PackageContent[]>(() => (value.contents || []).map((item) => ({ ...item, count: numericCount(item.count) })))
  const [gifts, setGifts] = useState<PackageContent[]>(() => (value.gifts || []).map(giftRow))
  const [notices, setNotices] = useState<string[]>(value.notices || [])
  const [active, setActive] = useState(value.active ?? true)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ images: string[]; activeIndex: number; isCover: boolean } | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const upload = async (files: FileList | null, multiple = false) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = await uploadImages(files)
      if (multiple) setImages((current) => [...current, ...urls.filter((url) => !current.includes(url))])
      else { setCover(urls[0] || ''); setPreview(null) }
    } catch (error) { alertMessage(error) } finally { setUploading(false) }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!cover) { alertMessage(new Error('请上传封面图片')); return }
    const payload = {
      merchantId, title: String(form.get('title') || '').trim(), coverImage: cover,
      price: Number(form.get('price') || 0), points: Number(form.get('points') || 0),
      active, stock: Number(form.get('stock') || 0),
      sellStart: form.get('sellStart') ? new Date(String(form.get('sellStart'))).toISOString() : null,
      sellEnd: form.get('sellEnd') ? new Date(String(form.get('sellEnd'))).toISOString() : null,
      purchaseLimit: Number(form.get('purchaseLimit') || 0),
      validityDays: Number(form.get('validityDays') || 0),
      contents: contents.filter((item) => item.name.trim()), gifts: gifts.filter((item) => item.name.trim()).map((item) => `${item.name.trim()} ${item.count || '1'}`),
      images, notices: notices.map((item) => item.trim()).filter(Boolean),
    }
    try {
      await api(value.id ? `/packages/${value.id}` : '/packages', value.id ? 'PATCH' : 'POST', payload)
      await onSaved(); onClose()
    } catch (error) { alertMessage(error) }
  }
  return <><Modal title={value.id ? '编辑套餐' : '新增套餐'} onClose={onClose} wide><form onSubmit={submit} className="form-grid package-form">
    <div className="package-column package-media">
      <Field label="套餐名称" className="package-name"><input name="title" defaultValue={value.title || ''} required /></Field>
      <Field label="价格" className="package-inline-field package-price"><input name="price" type="number" min="0" step="any" inputMode="decimal" defaultValue={value.price ?? 0} onKeyDown={restrictDecimalInput} onPaste={restrictDecimalPaste} required /></Field>
      <Field label="赠送积分" className="package-inline-field package-points"><input name="points" type="number" min="0" step="1" inputMode="decimal" defaultValue={value.points ?? 0} onKeyDown={restrictDecimalInput} onPaste={restrictDecimalPaste} required /></Field>
      <Field label="封面图片" hint="*横版图，建议图片主体居中"><div className="cover-image-editor"><input ref={coverInputRef} hidden type="file" accept="image/*" onChange={(event) => void upload(event.target.files)} /><button className="image-upload-tile" type="button" title={cover ? '预览封面图片' : '选择封面图片'} aria-label={cover ? '预览封面图片' : '选择封面图片'} onClick={() => cover ? setPreview({ images: [cover], activeIndex: 0, isCover: true }) : coverInputRef.current?.click()} disabled={uploading}>{cover ? <img src={cover} alt="封面预览" /> : <ImagePlus size={24} />}</button></div></Field>
      <Field label="套餐图片" hint="*横版图"><div className="image-editor"><div className="image-grid"><label className="image-upload-tile" title="添加套餐图片"><input type="file" accept="image/*" multiple onChange={(event) => void upload(event.target.files, true)} disabled={uploading} /><ImagePlus size={24} /></label>{images.map((src, index) => <div className="image-tile" key={src}><button className="image-preview-trigger" type="button" title="预览套餐图片" aria-label="预览套餐图片" onClick={() => setPreview({ images, activeIndex: index, isCover: false })}><img src={src} alt="套餐图片" /></button><button className="icon-button danger" type="button" aria-label="移除图片" title="移除图片" onClick={() => setImages((current) => current.filter((item) => item !== src))}><X size={15} /></button></div>)}</div></div></Field>
    </div>
    <div className="package-column package-details">
      <Field label="套餐内容" action={<button className="add-row" type="button" onClick={() => setContents((current) => [...current, { name: '', count: '1' }])}><Plus size={16} />新增一行</button>}><ContentRows values={contents} onChange={setContents} /></Field>
      <Field label="赠送内容" action={<button className="add-row" type="button" onClick={() => setGifts((current) => [...current, { name: '', count: '1' }])}><Plus size={16} />新增一行</button>}><ContentRows values={gifts} onChange={setGifts} /></Field>
      <Field label="使用须知" action={<button className="add-row" type="button" onClick={() => setNotices((current) => [...current, ''])}><Plus size={16} />新增一行</button>}><TextRows values={notices} onChange={setNotices} /></Field>
    </div>
    <div className="package-column package-sale-controls">
      <div className="field package-status-field"><div className="package-status-row"><span>上架状态</span><div className="package-active-control"><span>{active ? '已上架' : '已下架'}</span><button className={`status-switch${active ? ' active' : ''}`} type="button" role="switch" aria-checked={active} aria-label={active ? '已上架' : '已下架'} onClick={() => setActive((current) => !current)}><span /></button></div></div></div>
      <Field label="库存" hint="-1 表示不限量"><input name="stock" type="number" min="-1" step="1" inputMode="numeric" defaultValue={value.stock ?? -1} required /></Field>
      <Field label="每人限购" hint="0 表示不限购"><input name="purchaseLimit" type="number" min="0" step="1" inputMode="numeric" defaultValue={value.purchaseLimit ?? 0} required /></Field>
      <Field label="套餐有效期" hint="支付成功后开始计算"><input name="validityDays" type="number" min="1" step="1" inputMode="numeric" defaultValue={value.validityDays ?? 30} required /></Field>
      <Field label="售卖开始时间"><DateTimeInput name="sellStart" defaultValue={localDateTimeValue(value.sellStart)} /></Field>
      <Field label="售卖结束时间"><DateTimeInput name="sellEnd" defaultValue={localDateTimeValue(value.sellEnd)} /></Field>
    </div>
    <FormActions onClose={onClose} />
  </form></Modal>{preview && <PackageImagePreview images={preview.images} initialIndex={preview.activeIndex} isCover={preview.isCover} uploading={uploading} onClose={() => setPreview(null)} onChangeCover={() => coverInputRef.current?.click()} />}</>
}

function PackageImagePreview({ images, initialIndex, isCover, uploading, onClose, onChangeCover }: { images: string[]; initialIndex: number; isCover: boolean; uploading: boolean; onClose: () => void; onChangeCover: () => void }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null)
  const image = images[activeIndex]
  const resetTransform = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
    setDragging(false)
    dragRef.current = null
  }

  useEffect(() => { resetTransform() }, [activeIndex])
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  const selectImage = (index: number) => {
    if (index === activeIndex) return
    setActiveIndex(index)
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    setScale((current) => {
      const next = Math.min(4, Math.max(1, current * (event.deltaY < 0 ? 1.16 : .86)))
      if (next === 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: offset.x, originY: offset.y }
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const limitX = event.currentTarget.clientWidth * (scale - 1) / 2
    const limitY = event.currentTarget.clientHeight * (scale - 1) / 2
    setOffset({ x: Math.max(-limitX, Math.min(limitX, drag.originX + event.clientX - drag.startX)), y: Math.max(-limitY, Math.min(limitY, drag.originY + event.clientY - drag.startY)) })
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return <div className="preview-mask" role="presentation" onMouseDown={onClose}>
    <section className="preview-dialog" role="dialog" aria-modal="true" aria-label="图片预览" onMouseDown={(event) => event.stopPropagation()}>
      <button className="preview-close" type="button" aria-label="关闭图片预览" onClick={onClose}><X size={20} /></button>
      <div className={`preview-canvas${scale > 1 ? ' is-zoomed' : ''}${dragging ? ' is-dragging' : ''}`} onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <img key={image} className="preview-image" src={image} alt={isCover ? '封面图片大图预览' : '套餐图片大图预览'} draggable={false} style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }} />
      </div>
      <div className="preview-indicator">
        <button type="button" aria-label="上一张图片" disabled={activeIndex === 0} onClick={() => selectImage(activeIndex - 1)}><ChevronLeft size={18} /></button>
        <span>{activeIndex + 1} / {images.length}</span>
        <button type="button" aria-label="下一张图片" disabled={activeIndex === images.length - 1} onClick={() => selectImage(activeIndex + 1)}><ChevronRight size={18} /></button>
      </div>
      <p className="preview-hint">*鼠标置于图片上，可用鼠标滚轮缩放图片</p>
      {isCover && <button className="quiet-button preview-change-button" type="button" onClick={onChangeCover} disabled={uploading}><ImagePlus size={16} />更换</button>}
    </section>
  </div>
}

function ContentRows({ values, onChange }: { values: PackageContent[]; onChange: (values: PackageContent[]) => void }) {
  return <div className="row-editor">{values.map((item, index) => <div className="edit-row" key={index}><input value={item.name} onChange={(event) => onChange(values.map((value, i) => i === index ? { ...value, name: event.target.value } : value))} placeholder="名称" /><input className="row-count" value={item.count} inputMode="numeric" onKeyDown={restrictIntegerInput} onPaste={restrictIntegerPaste} onChange={(event) => onChange(values.map((value, i) => i === index ? { ...value, count: numericCount(event.target.value) } : value))} placeholder="数量" /><IconButton label="删除此行" danger onClick={() => onChange(values.filter((_, i) => i !== index))}><X size={15} /></IconButton></div>)}</div>
}

function TextRows({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  return <div className="row-editor">{values.map((item, index) => <div className="edit-row" key={index}><input value={item} onChange={(event) => onChange(values.map((value, i) => i === index ? event.target.value : value))} placeholder="请输入内容" /><IconButton label="删除此行" danger onClick={() => onChange(values.filter((_, i) => i !== index))}><X size={15} /></IconButton></div>)}</div>
}

function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<DashboardData>('/dashboard')
      .then(setData)
      .catch(alertMessage)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) return <Loading />
  const { incomeSources, incomeTrend, merchantIncome } = data
  const totalIncome = incomeSources.reduce((sum, item) => sum + item.value, 0)
  const currentMonth = incomeTrend[incomeTrend.length - 1]?.value || 0
  const previousMonth = incomeTrend[incomeTrend.length - 2]?.value || 0
  const growthRate = previousMonth ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100) : 0
  const averageIncome = incomeTrend.length ? Math.round(incomeTrend.reduce((sum, item) => sum + item.value, 0) / incomeTrend.length) : 0

  return <>
    <section className="dashboard-summary">
      <div><span>累计收益</span><strong>¥{totalIncome.toLocaleString()}</strong></div>
      <div><span>本月收益</span><strong>¥{currentMonth.toLocaleString()}</strong></div>
      <div><span>环比增长</span><strong>{growthRate}%</strong></div>
      <div><span>月均收益</span><strong>¥{averageIncome.toLocaleString()}</strong></div>
    </section>
    <section className="dashboard-grid">
      <ChartPanel title="收益构成" subtitle="按业务来源拆分">
        <PieChartView items={incomeSources} />
      </ChartPanel>
      <ChartPanel title="收益趋势" subtitle="近 6 个月">
        <LineChartView items={incomeTrend} />
      </ChartPanel>
      <ChartPanel title="商家收益排行" subtitle="当前周期">
        <BarChartView items={merchantIncome} />
      </ChartPanel>
    </section>
  </>
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <section className="chart-panel"><header><div><h2>{title}</h2><span>{subtitle}</span></div></header>{children}</section>
}

function PieChartView({ items }: { items: ChartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  let startAngle = 0

  return <div className="pie-layout">
    <svg className="chart-svg pie-svg" viewBox="0 0 220 220" role="img" aria-label="收益构成饼图">
      <defs>
        {items.map((item, index) => <linearGradient key={item.label} id={`pie-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={chartGradients[index % chartGradients.length][0]} />
          <stop offset="100%" stopColor={chartGradients[index % chartGradients.length][1]} />
        </linearGradient>)}
      </defs>
      {items.map((item, index) => {
        const angle = total ? (item.value / total) * 360 : 0
        const path = piePath(110, 110, 82, startAngle, startAngle + angle)
        startAngle += angle
        return <path key={item.label} d={path} fill={`url(#pie-gradient-${index})`} />
      })}
      <circle cx="110" cy="110" r="52" className="pie-ring" />
      <circle cx="110" cy="110" r="39" fill="#fff" />
      <text x="110" y="104" textAnchor="middle" className="chart-center-label">总收益</text>
      <text x="110" y="126" textAnchor="middle" className="chart-center-value">¥{Math.round(total / 10000)}万</text>
    </svg>
    <div className="chart-legend">{items.map((item, index) => <span key={item.label}><i style={{ background: `linear-gradient(135deg, ${chartGradients[index % chartGradients.length][0]}, ${chartGradients[index % chartGradients.length][1]})` }} />{item.label}<b>{Math.round((item.value / total) * 100)}%</b><em>¥{item.value.toLocaleString()}</em></span>)}</div>
  </div>
}

function LineChartView({ items }: { items: ChartItem[] }) {
  const width = 520
  const height = 240
  const padding = 34
  const max = Math.max(...items.map((item) => item.value))
  const min = Math.min(...items.map((item) => item.value))
  const range = Math.max(1, max - min)
  const points = items.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, items.length - 1)
    const y = height - padding - ((item.value - min) / range) * (height - padding * 2)
    return { ...item, x, y }
  })
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
  const gridLines = [0, 1, 2, 3].map((item) => padding + (item * (height - padding * 2)) / 3)

  return <svg className="chart-svg line-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="收益趋势折线图">
    <defs>
      <linearGradient id="line-stroke-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#182743" />
        <stop offset="50%" stopColor="#00bcd4" />
        <stop offset="100%" stopColor="#ffb000" />
      </linearGradient>
      <linearGradient id="line-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00bcd4" stopOpacity=".28" />
        <stop offset="100%" stopColor="#ffb000" stopOpacity=".04" />
      </linearGradient>
    </defs>
    {gridLines.map((y) => <line key={y} x1={padding} x2={width - padding} y1={y} y2={y} className="chart-grid-line" />)}
    <path d={areaPath} className="line-area" />
    <path d={path} className="line-path" />
    {points.map((point) => <g key={point.label}>
      <circle cx={point.x} cy={point.y} r="4" className="line-dot" />
      <text x={point.x} y={point.y - 12} textAnchor="middle" className="line-value">¥{Math.round(point.value / 1000)}k</text>
      <text x={point.x} y={height - 10} textAnchor="middle" className="axis-label">{point.label}</text>
    </g>)}
  </svg>
}

function BarChartView({ items }: { items: ChartItem[] }) {
  const max = Math.max(...items.map((item) => item.value))
  return <div className="bar-chart" role="img" aria-label="商家收益柱图">
    {items.map((item, index) => <div className="bar-item" key={item.label}>
      <div className="bar-track"><span style={{ height: `${Math.max(8, (item.value / max) * 100)}%`, background: `linear-gradient(180deg, ${chartGradients[index % chartGradients.length][0]}, ${chartGradients[index % chartGradients.length][1]})` }}><i /></span></div>
      <strong>¥{item.value.toLocaleString()}</strong>
      <div className="bar-share"><span style={{ width: `${Math.round((item.value / max) * 100)}%` }} /></div>
      <small>{item.label}</small>
    </div>)}
  </div>
}

function piePath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, radius, endAngle)
  const end = polarPoint(cx, cy, radius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) }
}

function PointsMallPage() {
  const [categories, setCategories] = useState<PointsCategory[]>([])
  const [mallItems, setMallItems] = useState<PointsMallItem[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [categoryDraft, setCategoryDraft] = useState<PointsCategory | null | undefined>(null)
  const [itemDraft, setItemDraft] = useState<PointsMallItem | null | undefined>(null)
  const items = useMemo(() => mallItems.filter((item) => item.category === activeCategory), [activeCategory, mallItems])

  const refresh = async () => {
    setLoading(true)
    try {
      const catalog = await api<PointsCatalog>('/points/catalog')
      setCategories(catalog.categories)
      setMallItems(catalog.items)
      setActiveCategory((current) => catalog.categories.some((item) => item.id === current) ? current : catalog.categories[0]?.id || '')
    } catch (error) {
      alertMessage(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void refresh() }, [])

  const saveCategory = async (category: PointsCategory) => {
    await api(category.id ? `/points/categories/${category.id}` : '/points/categories', category.id ? 'PATCH' : 'POST', category)
    await refresh()
  }

  const saveItem = async (value: PointsMallItem) => {
    await api(value.id ? `/points/products/${value.id}` : '/points/products', value.id ? 'PATCH' : 'POST', value)
    await refresh()
    setActiveCategory(value.category)
  }

  const deleteItem = async (item: PointsMallItem) => {
    if (!window.confirm(`删除“${item.title}”？`)) return
    try {
      await api(`/points/products/${item.id}`, 'DELETE')
      await refresh()
    } catch (error) {
      alertMessage(error)
    }
  }

  return <>
    {loading ? <Loading /> : <>
    <div className="merchant-tabs-row">
      <section className="merchant-tabs" role="tablist" aria-label="积分商城分类">
        {categories.map((category) => {
          const count = mallItems.filter((item) => item.category === category.id).length
          return <button
            className={`merchant-tab${category.id === activeCategory ? ' active' : ''}`}
            key={category.id}
            role="tab"
            aria-selected={category.id === activeCategory}
            onClick={() => setActiveCategory(category.id)}
          >{category.image ? <img className="category-tab-image" src={category.image} alt="" /> : <span className="category-tab-icon">{category.emoji || '🎁'}</span>}<span>{category.label}</span><small>{count}</small></button>
        })}
      </section>
      <div className="merchant-tab-actions">
        <button className="quiet-button" disabled={!activeCategory} onClick={() => setCategoryDraft(categories.find((category) => category.id === activeCategory))}><Edit3 size={16} />编辑当前分类</button>
        <button className="quiet-button" onClick={() => setCategoryDraft(undefined)}><Plus size={16} />新增积分分类</button>
        <button className="primary-button" onClick={() => setItemDraft(undefined)}><Plus size={18} />新增兑换物品</button>
      </div>
    </div>
    <section className="table-surface">
      <table className="data-table points-mall-table">
        <thead><tr><th>标题</th><th>描述</th><th>兑换方式</th><th>价值</th><th>图片</th><th>所需积分</th><th>操作</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}>
          <td><strong>{item.title}</strong></td>
          <td><span className="points-description">{item.description || '未填写'}</span></td>
          <td><span className="redemption-method">{item.redemptionMethod}</span></td>
          <td className="number">¥{item.value.toFixed(2)}</td>
          <td><Thumbnail src={item.image} alt={item.title} /></td>
          <td className="points-required">{item.points} 积分</td>
          <td><div className="row-actions"><IconButton label={`编辑${item.title}`} onClick={() => setItemDraft(item)}><Edit3 size={17} /></IconButton><IconButton label={`删除${item.title}`} danger onClick={() => void deleteItem(item)}><Trash2 size={17} /></IconButton></div></td>
        </tr>)}
        {items.length === 0 && <tr><td colSpan={7} className="empty-row">暂无兑换物品</td></tr>}</tbody>
      </table>
    </section>
    </>}
    {categoryDraft !== null && <PointsCategoryModal value={categoryDraft} onClose={() => setCategoryDraft(null)} onSaved={saveCategory} />}
    {itemDraft !== null && <PointsItemModal categories={categories} activeCategory={activeCategory} value={itemDraft} onClose={() => setItemDraft(null)} onSaved={saveItem} />}
  </>
}

function GamesPage() {
  const [games, setGames] = useState<AdminGame[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingID, setUpdatingID] = useState('')
  const [gameDraft, setGameDraft] = useState<AdminGame | null | undefined>(null)
  const [activeCategory, setActiveCategory] = useState<GameCategory>('drinking')
  const visibleGames = useMemo(() => games.filter((game) => (game.category || 'drinking') === activeCategory), [activeCategory, games])

  const refresh = async () => {
    setLoading(true)
    try {
      setGames(await api<AdminGame[]>('/games'))
    } catch (error) {
      alertMessage(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void refresh() }, [])

  const toggleActive = async (game: AdminGame) => {
    setUpdatingID(game.id)
    try {
      await api(`/games/${game.id}`, 'PATCH', { active: !game.active })
      setGames((items) => items.map((item) => item.id === game.id ? { ...item, active: !item.active } : item))
    } catch (error) {
      alertMessage(error)
    } finally {
      setUpdatingID('')
    }
  }

  const saveGame = async (game: AdminGame) => {
    await api(game.id ? `/games/${game.id}` : '/games', game.id ? 'PATCH' : 'POST', game)
    await refresh()
  }

  if (loading) return <Loading />
  return <>
    <div className="game-tabs-row">
      <section className="game-category-tabs" role="tablist" aria-label="游戏分类">
        {gameCategories.map((category) => <button
          key={category.id}
          className={`game-category-tab${activeCategory === category.id ? ' active' : ''}`}
          role="tab"
          aria-selected={activeCategory === category.id}
          onClick={() => setActiveCategory(category.id)}
        >{category.label}<small>{games.filter((game) => (game.category || 'drinking') === category.id).length}</small></button>)}
      </section>
      <div className="page-toolbar"><button className="primary-button" onClick={() => setGameDraft(undefined)}><Plus size={18} />新增游戏</button></div>
    </div>
    <section className="table-surface">
    <table className="data-table games-table">
      <thead><tr><th>图片</th><th>标题</th><th>介绍</th><th>链接</th><th>广告奖励积分</th><th>是否开启</th><th>操作</th></tr></thead>
      <tbody>{visibleGames.map((game) => <tr key={game.id}>
        <td><Thumbnail src={game.image} alt={game.title} /></td>
        <td><strong>{game.title}</strong></td>
        <td><span className="game-description">{game.description || '未填写'}</span></td>
        <td>{game.link ? <a className="game-link" href={game.link} target="_blank" rel="noreferrer">{game.link}</a> : <span className="muted-value">未填写</span>}</td>
        <td className="number">{game.rewardPoints}</td>
        <td><button className={`status-switch${game.active ? ' active' : ''}`} type="button" role="switch" aria-checked={game.active} aria-label={`${game.title}${game.active ? '已开启' : '已关闭'}`} disabled={updatingID === game.id} onClick={() => void toggleActive(game)}><span /></button></td>
        <td><IconButton label={`编辑${game.title}`} onClick={() => setGameDraft(game)}><Edit3 size={17} /></IconButton></td>
      </tr>)}
      {visibleGames.length === 0 && <tr><td colSpan={7} className="empty-row">当前分类暂无游戏</td></tr>}</tbody>
    </table>
  </section>
  {gameDraft !== null && <GameModal value={gameDraft} initialCategory={activeCategory} onClose={() => setGameDraft(null)} onSaved={saveGame} />}
  </>
}

function GameModal({ value, initialCategory, onClose, onSaved }: { value: AdminGame | undefined; initialCategory: GameCategory; onClose: () => void; onSaved: (game: AdminGame) => Promise<void> }) {
  const [image, setImage] = useState(value?.image || '')
  const [active, setActive] = useState(value?.active ?? true)
  const [category, setCategory] = useState<GameCategory>(value?.category || initialCategory)
  const [uploading, setUploading] = useState(false)

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = await uploadImages(files)
      setImage(urls[0] || '')
    } catch (error) {
      alertMessage(error)
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') || '').trim()
    const rewardPoints = Number(form.get('rewardPoints'))
    if (!title) { alertMessage(new Error('游戏标题不能为空')); return }
    if (!Number.isInteger(rewardPoints) || rewardPoints < 0) { alertMessage(new Error('广告奖励积分必须是大于或等于 0 的整数')); return }
    try {
      await onSaved({ id: value?.id || '', image, title, description: String(form.get('description') || '').trim(), link: String(form.get('link') || '').trim(), rewardPoints, active, category })
      onClose()
    } catch (error) {
      alertMessage(error)
    }
  }

  return <Modal title={value ? '编辑游戏' : '新增游戏'} onClose={onClose}><form onSubmit={submit} className="form-grid game-form">
    <Field label="图片"><label className="image-upload-tile" title="选择游戏图片"><input type="file" accept="image/*" onChange={(event) => void upload(event.target.files)} disabled={uploading} />{image ? <img src={image} alt="游戏图片预览" /> : <ImagePlus size={24} />}</label></Field>
    <div className="game-title-row">
      <Field label="标题"><input name="title" defaultValue={value?.title || ''} autoFocus required /></Field>
      <Field label="是否开启" className="game-active-field"><button className={`status-switch${active ? ' active' : ''}`} type="button" role="switch" aria-checked={active} aria-label={active ? '已开启' : '已关闭'} onClick={() => setActive((current) => !current)}><span /></button></Field>
    </div>
    <Field label="游戏分类"><select value={category} onChange={(event) => setCategory(event.target.value as GameCategory)}>{gameCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
    <Field label="链接"><input name="link" type="text" defaultValue={value?.link || ''} placeholder="/h5/#/游戏路由 或 https://..." /></Field>
    <Field label="看广告奖励积分"><input name="rewardPoints" type="number" min="0" step="1" defaultValue={value?.rewardPoints ?? 0} required /></Field>
    <Field label="介绍"><textarea name="description" defaultValue={value?.description || ''} /></Field>
    <FormActions onClose={onClose} />
  </form></Modal>
}

function PointsCategoryModal({ value, onClose, onSaved }: { value: PointsCategory | undefined; onClose: () => void; onSaved: (category: PointsCategory) => Promise<void> }) {
  const [image, setImage] = useState(value?.image || '')
  const [uploading, setUploading] = useState(false)

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = await uploadImages(files)
      setImage(urls[0] || '')
    } catch (error) {
      alertMessage(error)
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const label = String(new FormData(event.currentTarget).get('label') || '').trim()
    if (!label) { alertMessage(new Error('分类名称不能为空')); return }
    try { await onSaved({ id: value?.id || '', label, emoji: value?.emoji || '🎁', image }); onClose() } catch (error) { alertMessage(error) }
  }

  return <Modal title={value ? '编辑积分分类' : '新增积分分类'} onClose={onClose}><form onSubmit={submit} className="form-grid">
    <Field label="分类名称"><input name="label" defaultValue={value?.label || ''} autoFocus required /></Field>
    <Field label="分类图片" hint="*方形图"><label className="image-upload-tile" title="选择分类图片"><input type="file" accept="image/*" onChange={(event) => void upload(event.target.files)} disabled={uploading} />{image ? <img src={image} alt="分类图片预览" /> : <ImagePlus size={24} />}</label></Field>
    <FormActions onClose={onClose} />
  </form></Modal>
}

function PointsItemModal({ categories, activeCategory, value, onClose, onSaved }: { categories: PointsCategory[]; activeCategory: string; value: PointsMallItem | undefined; onClose: () => void; onSaved: (value: PointsMallItem) => Promise<void> }) {
  const [category, setCategory] = useState(value?.category || activeCategory)
  const [redemptionMethod, setRedemptionMethod] = useState(value?.redemptionMethod || redemptionMethods[0])
  const [image, setImage] = useState(value?.image || '')
  const [uploading, setUploading] = useState(false)

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = await uploadImages(files)
      setImage(urls[0] || '')
    } catch (error) { alertMessage(error) } finally { setUploading(false) }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') || '').trim()
    if (!title) { alertMessage(new Error('兑换物品标题不能为空')); return }
    try {
      await onSaved({
        id: value?.id || '',
        category,
        title,
        description: String(form.get('description') || '').trim(),
        redemptionMethod,
        value: Number(form.get('value') || 0),
        image,
        emoji: value?.emoji || '🎁',
        points: Number(form.get('points') || 0),
      })
      onClose()
    } catch (error) { alertMessage(error) }
  }

  return <Modal title={value ? '编辑兑换物品' : '新增兑换物品'} onClose={onClose}><form onSubmit={submit} className="form-grid points-item-form">
    <Field label="所属分类"><PointsCategorySelect categories={categories} value={category} onChange={setCategory} /></Field>
    <Field label="标题" hint="请填写兑换物品标题"><input name="title" defaultValue={value?.title || ''} autoFocus required /></Field>
    <Field label="所需积分"><input name="points" type="number" min="0" step="1" defaultValue={value?.points ?? 0} required /></Field>
    <Field label="领取方式"><RedemptionMethodSelect value={redemptionMethod} onChange={setRedemptionMethod} /></Field>
    <Field label="价值"><input name="value" type="number" min="0" step="0.01" defaultValue={value?.value ?? 0} required /></Field>
    <Field label="图片" hint="*正方形图"><label className="image-upload-tile" title="选择兑换物品图片"><input type="file" accept="image/*" onChange={(event) => void upload(event.target.files)} disabled={uploading} />{image ? <img src={image} alt="兑换物品预览" /> : <ImagePlus size={24} />}</label></Field>
    <Field label="描述"><textarea name="description" defaultValue={value?.description || ''} /></Field>
    <FormActions onClose={onClose} />
  </form></Modal>
}

function RedemptionMethodSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const selected = redemptionMethods.includes(value) ? value : redemptionMethods[0]

  return <div className={`custom-select${open ? ' open' : ''}`}>
    <button className="custom-select-trigger" type="button" onClick={() => setOpen((current) => !current)}>
      <span>{selected}</span><ChevronDown size={17} />
    </button>
    {open && <div className="custom-select-menu" role="listbox">
      {redemptionMethods.map((method) => <button
        className={method === selected ? 'active' : ''}
        key={method}
        type="button"
        role="option"
        aria-selected={method === selected}
        onClick={() => { onChange(method); setOpen(false) }}
      >{method}</button>)}
    </div>}
  </div>
}

function PointsCategorySelect({ categories, value, onChange }: { categories: PointsCategory[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const selected = categories.find((category) => category.id === value) || categories[0]

  return <div className={`custom-select${open ? ' open' : ''}`}>
    <input type="hidden" name="category" value={selected?.id || ''} />
    <button className="custom-select-trigger" type="button" onClick={() => setOpen((current) => !current)}>
      <span>{selected?.label || '请选择分类'}</span><ChevronDown size={17} />
    </button>
    {open && <div className="custom-select-menu" role="listbox">
      {categories.map((category) => <button
        className={category.id === selected?.id ? 'active' : ''}
        key={category.id}
        type="button"
        role="option"
        aria-selected={category.id === selected?.id}
        onClick={() => { onChange(category.id); setOpen(false) }}
      >{category.label}</button>)}
    </div>}
  </div>
}

function SettingsPage() {
  return <section className="table-surface">
    <div className="empty-state">暂无系统设置</div>
  </section>
}

function UsersPage() { return <ListPage title="用户管理" icon={<UsersRound size={19} />} fetcher={(page, query) => api<ListResult<User>>(`/users?page=${page}&q=${encodeURIComponent(query)}`)} render={({ items }) => <table className="data-table"><thead><tr><th>用户</th><th>手机号码</th><th>积分</th><th>操作</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="user-cell"><img src={item.avatar} alt="" /><strong>{item.nickname || '未设置'}</strong></div></td><td>{item.phone || '未设置'}</td><td className="number">{item.points}</td><td><div className="table-actions"><button className="quiet-button table-action" type="button" onClick={() => { window.location.href = adminPath(`/orders?userId=${encodeURIComponent(item.id)}&paymentType=money`) }}>下单记录({item.orderCount}笔)</button><button className="quiet-button table-action" type="button" onClick={() => { window.location.href = adminPath(`/orders?userId=${encodeURIComponent(item.id)}&paymentType=points`) }}>积分兑换记录</button></div></td></tr>)}</tbody></table>} /> }

function OrdersPage() {
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null)
  const userID = new URLSearchParams(window.location.search).get('userId') || ''
  const paymentType = new URLSearchParams(window.location.search).get('paymentType') || ''
  const showDetail = async (orderID: string) => {
    try { setDetail(await api<AdminOrderDetail>(`/orders/${orderID}`)) } catch (error) { alertMessage(error) }
  }
  return <>
    <ListPage title="订单管理" icon={<ShoppingBag size={19} />} fetcher={(page, query) => api<ListResult<Order>>(`/orders?page=${page}&q=${encodeURIComponent(query)}&userId=${encodeURIComponent(userID)}&paymentType=${encodeURIComponent(paymentType)}`)} render={({ items }) => <table className="data-table"><thead><tr><th>下单日期</th><th>订单号</th><th>下单用户</th><th>订单内容</th><th>金额</th><th>状态</th><th>操作</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.createdAt}</td><td className="order-no">{item.orderNo}</td><td><strong>{item.nickname}</strong><span className="subline">{item.phone}</span></td><td>{item.content}</td><td className="number">{item.paymentType === 'points' ? `${item.price.toFixed(0)} 积分` : `¥${item.price.toFixed(2)}`}</td><td><span className={`status ${item.status}`}>{statusLabel(item.status)}</span></td><td><button className="quiet-button table-action" onClick={() => void showDetail(item.id)}>查看详情</button></td></tr>)}</tbody></table>} />
    {detail && <OrderDetailModal value={detail} onClose={() => setDetail(null)} />}
  </>
}

function OrderDetailModal({ value, onClose }: { value: AdminOrderDetail; onClose: () => void }) {
  return <Modal title="订单详情" onClose={onClose}><div className="order-detail"><div className="order-summary">{value.coverImage && <Thumbnail src={value.coverImage} alt="订单图片" />}<div><strong>{value.packageTitle}</strong><span>{value.merchantName}</span></div><b>{value.paymentType === 'points' ? `${value.price.toFixed(0)} 积分` : `¥${value.price.toFixed(2)}`}</b></div><div className="detail-list"><span>订单号<strong>{value.orderNo}</strong></span><span>下单时间<strong>{value.createdAt}</strong></span>{value.paymentType === 'money' && value.expiresAt && <span>有效期至<strong>{value.expiresAt}</strong></span>}<span>订单状态<strong>{statusLabel(value.status)}</strong></span><span>下单用户<strong>{value.nickname} {value.phone}</strong></span>{value.paymentType === 'money' && <span>赠送积分<strong>{value.points}</strong></span>}</div><section className="detail-section order-timeline"><h3>订单时间线</h3>{value.events.length ? <div className="timeline-list">{value.events.map((event, index) => <div className="timeline-item" key={`${event.type}-${event.occurredAt}-${index}`}><span className="timeline-dot" /><div className="timeline-copy"><strong>{event.title}</strong>{event.detail && <span>{event.detail}</span>}</div><time>{event.occurredAt}</time></div>)}</div> : <div className="detail-line muted">暂无事件记录</div>}</section><section className="detail-section"><h3>{value.paymentType === 'points' ? '兑换内容' : '套餐内容'}</h3>{value.contents.length ? value.contents.map((item, index) => <div className="detail-line" key={`${item.name}-${index}`}><span>{item.name}</span><strong>{item.count}</strong></div>) : <div className="detail-line muted">暂无内容</div>}</section>{value.gifts.length > 0 && <section className="detail-section"><h3>赠送内容</h3>{value.gifts.map((item, index) => <div className="detail-line" key={`${item}-${index}`}>{item}</div>)}</section>}{value.notices.length > 0 && <section className="detail-section"><h3>使用须知</h3>{value.notices.map((item, index) => <div className="detail-line" key={`${item}-${index}`}>{item}</div>)}</section>}</div></Modal>
}

function ListPage<T extends { id: string }>({ title, icon, fetcher, render }: { title: string; icon: ReactNode; fetcher: (page: number, query: string) => Promise<ListResult<T>>; render: (result: ListResult<T>) => ReactNode }) {
  const [result, setResult] = useState<ListResult<T>>({ items: [], total: 0, page: 1, size: 10 })
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async (page = result.page, keyword = query) => { setLoading(true); try { setResult(await fetcher(page, keyword)) } catch (error) { alertMessage(error) } finally { setLoading(false) } }
  useEffect(() => { void load(1, '') }, [])
  const totalPages = Math.max(1, Math.ceil(result.total / result.size))
  return <>
    <section className="filter-bar"><form onSubmit={(event) => { event.preventDefault(); void load(1) }}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={title === '用户管理' ? '搜索昵称或手机号' : '搜索用户或套餐'} /><button className="quiet-button" type="submit">搜索</button></form><span>{icon} 共 {result.total} 条</span></section>
    <section className="table-surface">{loading ? <Loading /> : result.items.length ? render(result) : <div className="empty-state">暂无数据</div>}</section>
    <Pagination page={result.page} pages={totalPages} total={result.total} onChange={(page) => void load(page)} />
  </>
}

function Field({ label, hint, action, required, children, className = '' }: { label: string; hint?: string; action?: ReactNode; required?: boolean; children: ReactNode; className?: string }) { return <div className={`field ${className}`}><div className="field-label"><span>{required && <b className="field-required">*</b>}{label}</span>{hint && <small>{hint}</small>}{action && <span className="field-action">{action}</span>}</div>{children}</div> }
function DateTimeInput({ name, defaultValue }: { name: string; defaultValue: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [empty, setEmpty] = useState(!defaultValue)
  const showPicker = () => inputRef.current?.showPicker?.()
  return <div className={`datetime-input${empty ? ' is-empty' : ''}`} onClick={showPicker}><input ref={inputRef} name={name} type="datetime-local" defaultValue={defaultValue} onChange={(event) => setEmpty(!event.currentTarget.value)} />{empty && <span>点击选择时间</span>}</div>
}
function FormActions({ onClose }: { onClose: () => void }) { return <div className="form-actions"><button type="button" className="quiet-button" onClick={onClose}>取消</button><button className="primary-button" type="submit">保存</button></div> }
function IconButton({ label, children, danger, onClick }: { label: string; children: ReactNode; danger?: boolean; onClick: () => void }) { return <button type="button" className={`icon-button${danger ? ' danger' : ''}`} aria-label={label} title={label} onClick={onClick}>{children}</button> }
function Thumbnail({ src, alt }: { src: string; alt: string }) { return src ? <img className="thumbnail" src={src} alt={alt} /> : <span className="thumbnail placeholder" /> }
function Loading() { return <div className="loading"><LoaderCircle size={20} />加载中</div> }
function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) { return <div className="modal-mask" role="presentation" onMouseDown={onClose}><section className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><header><h2>{title}</h2><IconButton label="关闭" onClick={onClose}><X size={19} /></IconButton></header><div className="modal-content">{children}</div></section></div> }
function Pagination({ page, pages, total, onChange }: { page: number; pages: number; total: number; onChange: (page: number) => void }) { return <div className="pagination"><span>共 {total} 条</span><div><IconButton label="上一页" onClick={() => onChange(Math.max(1, page - 1))}><ChevronLeft size={18} /></IconButton><span>{page} / {pages}</span><IconButton label="下一页" onClick={() => onChange(Math.min(pages, page + 1))}><ChevronRight size={18} /></IconButton></div></div> }
function alertMessage(error: unknown) { alert(error instanceof Error ? error.message : '操作未完成，请稍后重试') }
