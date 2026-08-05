import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  ClipboardList,
  Clock3,
  EyeOff,
  Gift,
  Home,
  MapPin,
  ReceiptText,
  ScanLine,
  UserRound,
  createIcons,
} from 'lucide'
import { areaList } from '@vant/area-data'
import './styles/base.css'

const app = document.querySelector('#app')
const toastElement = document.querySelector('#toast')
const apiOrigin = `${location.protocol}//${location.hostname}:8080`
const apiBase = `${apiOrigin}/api/v1`
const icons = { Bell, ChevronLeft, ChevronRight, CircleCheck, CircleX, ClipboardList, Clock3, EyeOff, Gift, Home, MapPin, ReceiptText, ScanLine, UserRound }
let cleanupPage = () => {}
let toastTimer = 0
let routeVersion = 0

const routes = {
  mall: { style: 'index', render: renderMall },
  package: { style: 'package-detail', render: renderPackageDetail },
  benefits: { style: 'benefits', render: renderBenefits },
  tasks: { style: 'daily-tasks', render: renderDailyTasks },
  games: { style: 'game-points', render: renderGames },
  game: { style: 'game-player', render: renderGamePlayer },
  orders: { style: 'orders', render: renderOrders },
  order: { style: 'order-detail', render: renderOrderDetail },
  mine: { style: 'mine', render: renderMine },
  address: { style: 'common-address', render: renderAddress },
  points: { style: 'points-record', render: renderPoints },
  coupons: { style: 'coupons', render: renderCoupons },
}

function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function attr(value = '') {
  return escapeHTML(value)
}

function icon(name, className = '') {
  const lucideName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  return `<i data-lucide="${lucideName}" class="icon ${className}" aria-hidden="true"></i>`
}

function miniTabIcon(name) {
  return `<i class="mini-tab-icon mini-tab-icon-${name}" aria-hidden="true"></i>`
}

function activateIcons() {
  createIcons({ icons })
}

function showToast(message) {
  window.clearTimeout(toastTimer)
  toastElement.textContent = message
  toastElement.classList.add('show')
  toastTimer = window.setTimeout(() => toastElement.classList.remove('show'), 1900)
}

function errorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback
}

async function request(path, method = 'GET', data) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  })
  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  if (!response.ok) throw new Error(payload?.data?.message || `请求失败（${response.status}）`)
  return payload?.data
}

function resolveImage(source = '') {
  if (!source) return ''
  if (/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$)/i.test(source)) {
    const url = new URL(source)
    return `${apiOrigin}${url.pathname}${url.search}${url.hash}`
  }
  if (/^https?:\/\//i.test(source) || source.startsWith('data:') || source.startsWith('blob:')) return source
  if (source.startsWith('/uploads/')) return `${apiOrigin}${source}`
  if (source.startsWith('/assets/')) return source
  return source.startsWith('/') ? `${apiOrigin}${source}` : source
}

function normalizePage(response) {
  return Array.isArray(response) ? { items: response, hasMore: false } : response
}

async function requestGames() {
  const games = await request('/admin/games')
  return (games || []).filter((game) => game.active)
}

function loading() {
  app.innerHTML = '<view class="loading-screen"><view class="loading-dots"><i></i><i></i><i></i></view></view>'
}

function navigate(name, params = {}, replace = false) {
  const query = new URLSearchParams(params).toString()
  const hash = `#/${name}${query ? `?${query}` : ''}`
  if (replace) location.replace(hash)
  else location.hash = hash
}

function goBack() {
  if (history.length > 1) history.back()
  else navigate('mall', {}, true)
}

function currentRoute() {
  const value = location.hash.replace(/^#\/?/, '') || 'mall'
  const [name, query = ''] = value.split('?')
  return { name: routes[name] ? name : 'mall', params: Object.fromEntries(new URLSearchParams(query)) }
}

async function setPageStyle(name, version) {
  let link = document.querySelector(`link[data-page-style="${name}"]`)
  if (!link) {
    link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `/styles/${name}.css`
    link.dataset.pageStyle = name
    document.head.append(link)
  }
  if (link.dataset.loaded !== 'true') {
    await new Promise((resolve) => {
      const complete = () => {
        link.dataset.loaded = 'true'
        resolve()
      }
      if (link.sheet) complete()
      else {
        link.addEventListener('load', complete, { once: true })
        link.addEventListener('error', complete, { once: true })
      }
    })
  }
  if (version !== routeVersion) return false
  link.id = 'page-style'
  link.dataset.name = name
  return link
}

const tabRoutes = [
  ['mall', '商城', 'home-filled'],
  ['benefits', '福利', 'gift-filled'],
  ['orders', '订单', 'bill-filled'],
  ['mine', '我的', 'user-filled'],
]
const tabbarElement = document.createElement('nav')
tabbarElement.className = 'bottom-tabbar'
tabbarElement.setAttribute('aria-label', '主导航')
tabbarElement.innerHTML = tabRoutes.map(([name, label, iconName]) => `
  <button class="bottom-tab" data-route="${name}" aria-label="${label}">
    ${miniTabIcon(iconName)}<text>${label}</text>
  </button>`).join('')
document.body.append(tabbarElement)

function setActiveBottomTab(name, animate = false) {
  const visible = tabRoutes.some(([route]) => route === name)
  tabbarElement.hidden = !visible
  if (!visible) return
  tabbarElement.querySelectorAll('.bottom-tab').forEach((button) => {
    const active = button.dataset.route === name
    if (active && animate) {
      button.classList.remove('active')
      void button.offsetWidth
    }
    button.classList.toggle('active', active)
  })
}

tabbarElement.addEventListener('click', (event) => {
  const button = event.target.closest('.bottom-tab')
  if (!button) return
  setActiveBottomTab(button.dataset.route, true)
  navigate(button.dataset.route)
})

function bottomTabbar(active) {
  return ''

  const tabs = [
    ['mall', '商城', 'home-filled'],
    ['benefits', '福利', 'gift-filled'],
    ['orders', '订单', 'bill-filled'],
    ['mine', '我的', 'user-filled'],
  ]
  return `<nav class="bottom-tabbar" aria-label="主导航">${tabs.map(([route, label, iconName]) => `
    <button class="bottom-tab ${active === route ? 'active' : ''}" data-route="${route}" aria-label="${label}">
      ${miniTabIcon(iconName)}<text>${label}</text>
    </button>`).join('')}</nav>`
}

function bindBottomTabs(root = app) {
  root.querySelectorAll('.bottom-tab').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.route))
  })
}

function openGameLink(title, link) {
  if (!link) {
    showToast('游戏链接暂未配置')
    return
  }
  navigate('game', { title, link })
}

function backButton(className) {
  return `<view class="${className} back-control" role="button" tabindex="0" aria-label="返回">${icon('ChevronLeft')}</view>`
}

function bindBack(root = app) {
  root.querySelectorAll('.back-control').forEach((button) => button.addEventListener('click', goBack))
}

function emptyState(title, description, classPrefix) {
  return `<view class="${classPrefix}-empty-state">
    <view class="${classPrefix}-empty-illustration">${icon('EyeOff')}</view>
    <text class="${classPrefix}-empty-title">${title}</text>
    <text class="${classPrefix}-empty-description">${description}</text>
  </view>`
}

function attachPullRefresh(container, indicator, refresh) {
  if (!container || !indicator) return () => {}
  let startY = 0
  let pull = 0
  let tracking = false
  const start = (event) => {
    if (container.scrollTop > 0) return
    startY = event.touches[0].clientY
    tracking = true
  }
  const move = (event) => {
    if (!tracking) return
    pull = Math.max(0, event.touches[0].clientY - startY)
    const scale = Math.min(1, pull / 90) * 1.35
    indicator.style.opacity = pull ? '1' : '0'
    indicator.style.transform = `translateY(-36px) scale(${scale})`
  }
  const end = async () => {
    if (!tracking) return
    tracking = false
    if (pull < 72) {
      indicator.style.opacity = '0'
      pull = 0
      return
    }
    indicator.classList.add('is-refreshing')
    indicator.style.opacity = '1'
    indicator.style.transform = 'translateY(-36px) scale(1.35)'
    const startedAt = Date.now()
    await refresh()
    await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, 520 - (Date.now() - startedAt))))
    pull = 0
  }
  container.addEventListener('touchstart', start, { passive: true })
  container.addEventListener('touchmove', move, { passive: true })
  container.addEventListener('touchend', end)
  return () => {
    container.removeEventListener('touchstart', start)
    container.removeEventListener('touchmove', move)
    container.removeEventListener('touchend', end)
  }
}

async function route() {
  const version = ++routeVersion
  cleanupPage()
  cleanupPage = () => {}
  const { name, params } = currentRoute()
  const target = routes[name]
  setActiveBottomTab(name)
  const styleLink = await setPageStyle(target.style, version)
  if (!styleLink) return
  if (!tabRoutes.some(([routeName]) => routeName === name)) loading()
  const cleanup = (await target.render(params)) || (() => {})
  if (version !== routeVersion) {
    cleanup()
    return
  }
  document.querySelectorAll('link[data-page-style]').forEach((item) => {
    if (item !== styleLink) item.remove()
  })
  cleanupPage = cleanup
  activateIcons()
}

async function renderMall() {
  const state = {
    tab: sessionStorage.getItem('mallActiveTab') || 'merchants',
    merchants: [], packages: [], activeMerchant: 0, packagePage: 1, packageHasMore: false, packageLoading: false,
    categories: [], allExchangeItems: [], activeCategory: 0, exchangePage: 1, exchangeHasMore: false, exchangeLoading: false,
    affordableOnly: false, points: '--', selected: null, shipping: null, dialog: '', redeeming: false,
  }
  sessionStorage.removeItem('mallActiveTab')

  try {
    const [merchants, summary, categories] = await Promise.all([
      request('/merchants'), request('/me/summary'), request('/points/categories'),
    ])
    state.merchants = merchants || []
    state.categories = categories || []
    state.points = summary?.stats?.find((item) => item.label === '积分')?.value || '--'
    for (let index = 0; index < state.merchants.length; index += 1) {
      const page = normalizePage(await request(`/merchants/${encodeURIComponent(state.merchants[index].id)}/packages?page=1&pageSize=10`))
      if (page.items.length) {
        state.activeMerchant = index
        state.packages = page.items
        state.packageHasMore = page.hasMore
        break
      }
    }
    if (state.categories.length) {
      const page = normalizePage(await request(`/points/products?category=${encodeURIComponent(state.categories[0].id)}&page=1&pageSize=10`))
      state.allExchangeItems = page.items
      state.exchangeHasMore = page.hasMore
    }
  } catch (error) {
    showToast(errorMessage(error, '商城数据加载失败'))
  }

  function exchangeItems() {
    if (!state.affordableOnly) return state.allExchangeItems
    const points = Number(String(state.points).replace(/[^\d.]/g, '')) || 0
    return state.allExchangeItems.filter((item) => item.points <= points)
  }

  function refresh() {
    const packages = state.packages.length ? state.packages.map((item, index) => `
      <view class="package-card ${attr(item.tone)} package-enter" style="animation-delay:${index * 75}ms" data-package="${attr(item.id)}">
        ${item.coverImage ? `<img class="package-cover" src="${attr(resolveImage(item.coverImage))}" alt="" />` : ''}
        <view class="package-mask"></view>
        <view class="package-text"><text class="package-title">${escapeHTML(item.title)}</text><view class="gift-area"><text class="gift-tag">${escapeHTML(item.tag)}</text>${(item.gifts || []).map((gift) => `<view class="gift-row"><view class="gift-dot"></view><text>${escapeHTML(gift)}</text></view>`).join('')}</view></view>
        <view class="price-area"><view class="price-line"><text class="currency">¥</text><text class="price">${escapeHTML(item.price)}</text></view><text class="points-label">赠送积分</text><text class="points">${escapeHTML(item.points)}</text></view>
      </view>`).join('') : emptyState('该商家暂未上架套餐', '敬请期待', 'package')

    const items = exchangeItems()
    const exchange = items.length ? items.map((item, index) => `
      <view class="exchange-card" data-exchange="${index}">
        <view class="exchange-icon"><text>${escapeHTML(item.emoji)}</text></view>
        <view class="exchange-copy"><view class="exchange-title-scroll"><text class="exchange-title">${escapeHTML(item.title)}</text></view><view class="exchange-value-row"><text class="exchange-value">价值${escapeHTML(item.value)}元</text><text class="exchange-method">${escapeHTML(item.redemptionMethod)}</text></view><view class="exchange-action"><view class="exchange-points"><text>${escapeHTML(item.points)}</text><text class="exchange-unit">积分</text></view><button class="redeem-button" data-exchange="${index}"><text>兑换</text></button></view></view>
      </view>`).join('') : emptyState('暂无可兑换物品', '继续攒积分再来看看', 'exchange')

    app.innerHTML = `<view class="mall-page">
      <view class="mall-tabs top-tabs" style="--tab-count:2"><button class="top-tab ${state.tab === 'merchants' ? 'active' : ''}" data-mall-tab="merchants">严选商家</button><button class="top-tab ${state.tab === 'exchange' ? 'active' : ''}" data-mall-tab="exchange">积分兑换</button></view>
      ${state.tab === 'merchants' ? `<view class="shop-body">
        <scroll-view class="category-list">${state.merchants.map((item, index) => `<view class="category-card ${state.activeMerchant === index ? 'active' : ''}" data-merchant="${index}"><text class="category-name">${escapeHTML(item.name)}</text><text class="category-pinyin">距你 ${escapeHTML(item.distance)}km</text></view>`).join('')}</scroll-view>
        <view class="package-list-area"><scroll-view class="package-list"><view class="list-refresher" style="opacity:0;transform:translateY(-36px) scale(0)"><view class="list-refresh-dot"></view><view class="list-refresh-dot"></view><view class="list-refresh-dot"></view><text class="list-refresh-label">正在刷新</text></view>${packages}${state.packageLoading ? '<view class="list-load-status">加载中...</view>' : state.packages.length && !state.packageHasMore ? '<view class="list-load-status">没有更多套餐了</view>' : ''}</scroll-view>${state.packages.length ? '<view class="package-list-fade package-list-fade-top"></view><view class="package-list-fade package-list-fade-bottom"></view>' : ''}</view>
      </view>` : `<view class="exchange-section"><view class="exchange-toolbar"><label class="affordable-filter"><input class="affordable-filter-switch web-switch" type="checkbox" ${state.affordableOnly ? 'checked' : ''}/><text class="affordable-filter-label">仅看可兑换</text></label><view class="exchange-summary">我的积分：<text class="exchange-summary-value">${escapeHTML(state.points)}</text></view></view><view class="exchange-body"><scroll-view class="exchange-category-list">${state.categories.map((item, index) => `<view class="exchange-category-card ${state.activeCategory === index ? 'active' : ''}" data-category="${index}"><text class="exchange-category-emoji">${escapeHTML(item.emoji)}</text><text class="exchange-category-name">${escapeHTML(item.label)}</text></view>`).join('')}</scroll-view><scroll-view class="exchange-list"><view class="list-refresher" style="opacity:0;transform:translateY(-36px) scale(0)"><view class="list-refresh-dot"></view><view class="list-refresh-dot"></view><view class="list-refresh-dot"></view><text class="list-refresh-label">正在刷新</text></view>${exchange}${state.exchangeLoading ? '<view class="list-load-status">加载中...</view>' : state.allExchangeItems.length && !state.exchangeHasMore ? '<view class="list-load-status">没有更多物品了</view>' : ''}</scroll-view></view></view>`}
      ${dialogHTML()}${bottomTabbar('mall')}
    </view>`
    bind()
    activateIcons()
  }

  function dialogHTML() {
    if (!state.selected || !state.dialog) return ''
    const item = state.selected
    if (state.dialog === 'shipping') return `<view class="exchange-dialog-layer" data-close-dialog><view class="exchange-dialog shipping-dialog" data-dialog><view class="exchange-dialog-icon"><text>${escapeHTML(item.emoji)}</text></view><text class="exchange-dialog-title">${escapeHTML(item.title)}</text><view class="exchange-dialog-points shipping-points"><text>${escapeHTML(item.points)}</text><text class="exchange-dialog-unit">积分</text></view><view class="exchange-dialog-divider"></view><text class="shipping-title">确认邮寄到以下地址？</text><view class="shipping-address-card"><text class="shipping-contact">${escapeHTML(state.shipping.contactName)} ${escapeHTML(state.shipping.contactPhone)}</text><text class="shipping-address">${escapeHTML(`${state.shipping.region.join(' ')} ${state.shipping.detail}`)}</text></view><view class="shipping-actions"><button class="shipping-edit" data-edit-address>修改地址</button><button class="shipping-confirm" data-confirm-redeem>确认邮寄</button></view></view></view>`
    return `<view class="exchange-dialog-layer" data-close-dialog><view class="exchange-dialog" data-dialog><view class="exchange-dialog-icon"><text>${escapeHTML(item.emoji)}</text></view><text class="exchange-dialog-title">${escapeHTML(item.title)}</text><text class="exchange-dialog-value">价值${escapeHTML(item.value)}元</text><view class="exchange-dialog-points"><text>${escapeHTML(item.points)}</text><text class="exchange-dialog-unit">积分</text></view><view class="exchange-dialog-divider"></view><text class="exchange-dialog-note">兑换后可在我的订单中查看</text><button class="exchange-dialog-confirm" data-confirm-redeem>立即兑换</button></view></view>`
  }

  async function loadPackages(page = 1, append = false) {
    const merchant = state.merchants[state.activeMerchant]
    if (!merchant || state.packageLoading) return
    state.packageLoading = true
    const response = normalizePage(await request(`/merchants/${encodeURIComponent(merchant.id)}/packages?page=${page}&pageSize=10`))
    state.packages = append ? [...state.packages, ...response.items] : response.items
    state.packagePage = page
    state.packageHasMore = response.hasMore
    state.packageLoading = false
  }

  async function loadExchange(page = 1, append = false) {
    const category = state.categories[state.activeCategory]
    if (!category || state.exchangeLoading) return
    state.exchangeLoading = true
    const response = normalizePage(await request(`/points/products?category=${encodeURIComponent(category.id)}&page=${page}&pageSize=10`))
    state.allExchangeItems = append ? [...state.allExchangeItems, ...response.items] : response.items
    state.exchangePage = page
    state.exchangeHasMore = response.hasMore
    state.exchangeLoading = false
  }

  async function openExchange(index) {
    const item = exchangeItems()[index]
    if (!item) return
    state.selected = item
    if (item.redemptionMethod === '快递邮寄') {
      state.shipping = await request('/me/address').catch(() => null)
      const complete = state.shipping?.region?.length === 3 && state.shipping.detail && state.shipping.contactName && state.shipping.contactPhone
      if (!complete) {
        if (window.confirm('邮寄兑换需要先填写联系人、联系电话和收货地址。现在去设置吗？')) navigate('address')
        return
      }
      state.dialog = 'shipping'
    } else state.dialog = 'exchange'
    refresh()
  }

  async function redeem() {
    if (!state.selected || state.redeeming) return
    state.redeeming = true
    try {
      const result = await request(`/points/products/${encodeURIComponent(state.selected.id)}/redeem`, 'POST')
      state.points = String(result.points)
      state.dialog = ''
      state.selected = null
      showToast('兑换成功')
    } catch (error) {
      showToast(errorMessage(error, '兑换失败'))
    } finally {
      state.redeeming = false
      refresh()
    }
  }

  function bind() {
    bindBottomTabs()
    app.querySelectorAll('[data-mall-tab]').forEach((button) => button.addEventListener('click', () => { state.tab = button.dataset.mallTab; refresh() }))
    app.querySelectorAll('[data-merchant]').forEach((card) => card.addEventListener('click', async () => { state.activeMerchant = Number(card.dataset.merchant); await loadPackages(); refresh() }))
    app.querySelectorAll('[data-package]').forEach((card) => card.addEventListener('click', () => navigate('package', { id: card.dataset.package })))
    app.querySelectorAll('[data-category]').forEach((card) => card.addEventListener('click', async () => { state.activeCategory = Number(card.dataset.category); await loadExchange(); refresh() }))
    app.querySelector('.affordable-filter-switch')?.addEventListener('change', (event) => { state.affordableOnly = event.currentTarget.checked; refresh() })
    app.querySelectorAll('[data-exchange]').forEach((card) => card.addEventListener('click', (event) => { event.stopPropagation(); openExchange(Number(card.dataset.exchange)) }))
    app.querySelector('[data-close-dialog]')?.addEventListener('click', () => { state.dialog = ''; refresh() })
    app.querySelector('[data-dialog]')?.addEventListener('click', (event) => event.stopPropagation())
    app.querySelector('[data-edit-address]')?.addEventListener('click', () => navigate('address'))
    app.querySelector('[data-confirm-redeem]')?.addEventListener('click', redeem)
    const packageList = app.querySelector('.package-list')
    const exchangeList = app.querySelector('.exchange-list')
    const detachPull = attachPullRefresh(packageList || exchangeList, app.querySelector('.list-refresher'), async () => {
      if (packageList) await loadPackages()
      else await loadExchange()
      refresh()
    })
    if (packageList) packageList.addEventListener('scroll', async () => { if (packageList.scrollTop + packageList.clientHeight >= packageList.scrollHeight - 40 && state.packageHasMore && !state.packageLoading) { await loadPackages(state.packagePage + 1, true); refresh() } })
    if (exchangeList) exchangeList.addEventListener('scroll', async () => { if (exchangeList.scrollTop + exchangeList.clientHeight >= exchangeList.scrollHeight - 40 && state.exchangeHasMore && !state.exchangeLoading) { await loadExchange(state.exchangePage + 1, true); refresh() } })
    state.detachPull = detachPull
  }

  refresh()
  return () => state.detachPull?.()
}

async function renderPackageDetail(params) {
  let detail = { title: '', price: '', points: '', contents: [], notices: [], coverImage: '', images: [] }
  try {
    detail = await request(`/packages/${encodeURIComponent(params.id || '')}`)
  } catch (error) {
    showToast(errorMessage(error, '加载套餐失败'))
  }
  const images = (detail.images?.length ? detail.images : detail.coverImage ? [detail.coverImage] : []).map(resolveImage)
  app.innerHTML = `<view class="detail-page">
    <scroll-view class="detail-scroll">
      <view class="hero"><view class="hero-swiper">${images.map((source, index) => `<img class="hero-image" src="${attr(source)}" alt="${escapeHTML(detail.title)}" data-hero-image="${index}" />`).join('')}</view><view class="hero-indicators">${images.map((_, index) => `<view class="hero-indicator ${index === 0 ? 'active' : ''}" data-indicator="${index}"></view>`).join('')}</view><view class="hero-fade"></view></view>
      <view class="detail-content"><view class="summary-card"><view class="summary-heading"><text class="summary-title">${escapeHTML(detail.title)}</text><text class="availability">限时可用</text></view><view class="summary-price-row"><view><view class="summary-price"><text class="summary-currency">¥</text><text>${escapeHTML(detail.price)}</text></view></view><view class="summary-points"><text>赠送积分</text><text class="summary-points-value">${escapeHTML(detail.points)}</text></view></view></view>
        <view class="detail-card"><text class="section-title">套餐内容</text>${(detail.contents || []).map((item, index) => `<view class="content-row"><text class="row-index">${String(index + 1).padStart(2, '0')}</text><text class="row-name">${escapeHTML(item.name)}</text><text class="row-count">${escapeHTML(item.count)}</text></view>`).join('')}</view>
        <view class="detail-card"><text class="section-title">赠送内容</text><view class="points-gift"><text class="row-index">01</text><view class="gift-copy"><text class="row-name">乐伴伴商城积分</text><text class="gift-note">可用于商城购买酒水 / 茶叶等</text></view><text class="gift-points">${escapeHTML(detail.points)}</text></view><view class="content-row no-border"><text class="row-index">02</text><text class="row-name">到店专属服务</text><text class="row-count">1 次</text></view></view>
        <view class="detail-card notice-card"><text class="section-title">使用须知</text>${(detail.notices || []).map((notice) => `<text class="notice-line">${escapeHTML(notice)}</text>`).join('')}</view>
      </view>
    </scroll-view>
    <view class="detail-nav-shell"><view class="detail-nav-background" style="opacity:0"></view><view class="floating-nav">${backButton('back-button')}<text class="floating-nav-title">套餐详情</text></view></view>
    <view class="purchase-bar"><view class="purchase-price"><text>¥</text><text class="purchase-price-value">${escapeHTML(detail.price)}</text></view><button class="purchase-button">立即购买</button></view>
  </view>`
  const scroller = app.querySelector('.detail-scroll')
  const navBackground = app.querySelector('.detail-nav-background')
  scroller?.addEventListener('scroll', () => { navBackground.style.opacity = String(Math.min(scroller.scrollTop / 160, 1)) })
  const hero = app.querySelector('.hero-swiper')
  hero?.addEventListener('scroll', () => {
    const current = Math.round(hero.scrollLeft / hero.clientWidth)
    app.querySelectorAll('[data-indicator]').forEach((dot) => dot.classList.toggle('active', Number(dot.dataset.indicator) === current))
  })
  bindBack()
  app.querySelector('.purchase-button')?.addEventListener('click', async () => {
    try {
      await request('/orders', 'POST', { packageId: params.id })
      showToast('下单成功')
    } catch (error) {
      showToast(errorMessage(error, '下单失败'))
    }
  })
  app.querySelectorAll('[data-hero-image]').forEach((imageElement) => imageElement.addEventListener('click', () => window.open(imageElement.src, '_blank')))
  activateIcons()
}

async function renderOrders() {
  const state = { status: 'pending', orders: [], page: 1, hasMore: false, loading: false, detachPull: null }

  async function load(page = 1, append = false) {
    if (state.loading) return
    state.loading = true
    try {
      const response = normalizePage(await request(`/orders?status=${state.status}&page=${page}&pageSize=10`))
      state.orders = append ? [...state.orders, ...response.items] : response.items
      state.page = page
      state.hasMore = response.hasMore
    } catch (error) {
      showToast(errorMessage(error, '加载订单失败'))
    } finally {
      state.loading = false
    }
  }

  function refresh() {
    app.innerHTML = `<view class="orders-page">
      <view class="orders-tabs top-tabs" style="--tab-count:3"><button class="top-tab ${state.status === 'pending' ? 'active' : ''}" data-status="pending">待核销</button><button class="top-tab ${state.status === 'verified' ? 'active' : ''}" data-status="verified">已核销</button><button class="top-tab ${state.status === 'expired' ? 'active' : ''}" data-status="expired">已失效</button></view>
      <scroll-view class="order-list"><view class="list-refresher" style="opacity:0;transform:translateY(-36px) scale(0)"><view class="list-refresh-dot"></view><view class="list-refresh-dot"></view><view class="list-refresh-dot"></view><text class="list-refresh-label">正在刷新</text></view>${state.orders.map((item, index) => `<view class="order-card order-enter" style="animation-delay:${index * 75}ms" data-order="${attr(item.id)}"><view class="order-main"><text class="order-title">${escapeHTML(item.title)}</text><text class="order-merchant">${escapeHTML(item.merchant)}</text></view><view class="order-meta"><text class="order-price">${escapeHTML(item.priceText)}</text><text class="order-status">${escapeHTML(item.status)}</text></view></view>`).join('')}${state.loading ? '<view class="order-load-status">加载中...</view>' : state.orders.length && !state.hasMore ? '<view class="order-load-status">没有更多订单了</view>' : ''}</scroll-view>${bottomTabbar('orders')}</view>`
    bindBottomTabs()
    app.querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', async () => { state.status = button.dataset.status; await load(); refresh() }))
    app.querySelectorAll('[data-order]').forEach((card) => card.addEventListener('click', () => navigate('order', { id: card.dataset.order })))
    const list = app.querySelector('.order-list')
    state.detachPull = attachPullRefresh(list, app.querySelector('.list-refresher'), async () => { await load(); refresh() })
    list?.addEventListener('scroll', async () => { if (list.scrollTop + list.clientHeight >= list.scrollHeight - 40 && state.hasMore && !state.loading) { await load(state.page + 1, true); refresh() } })
    activateIcons()
  }

  await load()
  refresh()
  return () => state.detachPull?.()
}

async function renderOrderDetail(params) {
  let detail = { title: '', merchant: '', priceText: '', status: '', statusIcon: 'time', statusNote: '', canUsePoints: false, canVerify: false, sectionTitle: '套餐信息', contents: [], orderNo: '', createdAt: '' }
  async function load() {
    try {
      detail = await request(`/orders/${encodeURIComponent(params.id || '')}`)
    } catch (error) {
      showToast(errorMessage(error, '加载订单失败'))
    }
  }
  function statusIcon() {
    if (detail.statusIcon?.includes('check')) return 'CircleCheck'
    if (detail.statusIcon?.includes('close') || detail.statusIcon?.includes('error')) return 'CircleX'
    return 'Clock3'
  }
  function refresh() {
    app.innerHTML = `<view class="order-detail-page"><view class="page-header">${backButton('back-button')}<text class="page-title">订单详情</text></view>
      <view class="status-card"><view class="status-icon">${icon(statusIcon())}</view><view class="status-copy"><text class="status-title">${escapeHTML(detail.status)}</text><text class="status-note">${escapeHTML(detail.statusNote)}</text></view></view>
      <view class="detail-card"><text class="card-title">${escapeHTML(detail.sectionTitle)}</text><view class="package-row"><view><text class="package-title">${escapeHTML(detail.title)}</text><text class="package-merchant">${escapeHTML(detail.merchant)}</text></view><text class="package-price">${escapeHTML(detail.priceText)}</text></view><view class="package-content-list">${(detail.contents || []).map((item) => `<view class="package-content-row"><text class="content-name">${escapeHTML(item.name)}</text><view class="content-value"><text class="content-count">${escapeHTML(item.count)}</text>${item.isPoints && detail.canUsePoints ? '<button class="use-points-button" data-open-exchange>立即使用</button>' : ''}</view></view>`).join('')}</view></view>
      <view class="detail-card"><text class="card-title">订单信息</text><view class="info-row"><text>订单编号</text><text>${escapeHTML(detail.orderNo)}</text></view><view class="info-row"><text>下单时间</text><text>${escapeHTML(detail.createdAt)}</text></view><view class="info-row no-border"><text>支付金额</text><text class="payment">${escapeHTML(detail.priceText)}</text></view></view>
      ${detail.canVerify ? '<view class="verify-bar"><button class="verify-order-button" data-verify>我要核销</button></view>' : ''}</view>`
    bindBack()
    app.querySelector('[data-open-exchange]')?.addEventListener('click', () => { sessionStorage.setItem('mallActiveTab', 'exchange'); navigate('mall') })
    app.querySelector('[data-verify]')?.addEventListener('click', verify)
    activateIcons()
  }
  async function verify() {
    const code = window.prompt('请输入核销码')
    if (!code) return
    try {
      await request('/orders/verify', 'POST', { code, orderId: params.id })
      showToast('核销成功')
      await load()
      refresh()
    } catch (error) {
      showToast(errorMessage(error, '核销失败'))
    }
  }
  await load()
  refresh()
}

async function renderBenefits() {
  const state = { points: '--', leaderboard: [], items: [], games: [], notices: [], promos: [], enterpriseDialog: null, dialog: false, noticeIndex: 0 }
  try {
    const [summary, payload, leaderboard, games] = await Promise.all([request('/me/summary'), request('/benefits'), request('/points/leaderboard'), requestGames().catch(() => [])])
    state.points = summary?.stats?.find((item) => item.label === '积分')?.value || '--'
    state.items = payload?.items || []
    state.games = games || []
    state.notices = payload?.notices || []
    state.promos = payload?.promos || []
    state.enterpriseDialog = payload?.enterpriseDialog || null
    const topFive = (leaderboard || []).filter((item) => item.rank <= 5)
    const current = (leaderboard || []).find((item) => item.isCurrent)
    state.leaderboard = current && current.rank > 5
      ? [...topFive.slice(0, 3), { isEllipsis: true, rank: -1 }, current]
      : topFive
  } catch (error) {
    showToast(errorMessage(error, '加载福利内容失败'))
  }

  function refresh() {
    const gamesMarkup = `<view class="benefit-games">${state.games.slice(0, 3).map((game) => `<button class="benefit-game-item" data-game-title="${attr(game.title)}" data-game-link="${attr(game.link)}">${game.image ? `<img class="benefit-game-image" src="${attr(resolveImage(game.image))}" alt="${attr(game.title)}"/>` : '<view class="benefit-game-fallback"></view>'}</button>`).join('')}<button class="benefit-game-item benefit-more-games" data-more-games><img class="benefit-game-image" src="/assets/more-games.png" alt="更多游戏"/></button></view>`
    const dialog = state.dialog && state.enterpriseDialog ? `<view class="enterprise-dialog-layer" data-close-enterprise><view class="enterprise-dialog" data-enterprise-dialog><view class="enterprise-dialog-header"><text class="enterprise-dialog-title">${escapeHTML(state.enterpriseDialog.title)}</text><button class="enterprise-dialog-close" data-close-enterprise>×</button></view><view class="enterprise-dialog-content"><img class="enterprise-qr-image" src="${attr(resolveImage(state.enterpriseDialog.image))}" alt="企业微信二维码"/><text class="enterprise-dialog-primary">${escapeHTML(state.enterpriseDialog.primary)}</text><text class="enterprise-dialog-secondary">${escapeHTML(state.enterpriseDialog.secondary)}</text></view></view></view>` : ''
    app.innerHTML = `<view class="benefits-page">
      <view class="benefit-points-card"><text class="benefit-points-label">我的积分</text><view class="benefit-points-value"><text class="benefit-points-number">${escapeHTML(state.points)}</text></view></view>
      <view class="benefit-leaderboard"><view class="leaderboard-header"><text class="leaderboard-title">积分排行榜</text><text class="leaderboard-subtitle">TOP 5</text></view>${state.leaderboard.map((item) => item.isEllipsis ? '<view class="leaderboard-ellipsis"><text>•••</text></view>' : `<view class="leaderboard-item ${item.isCurrent ? 'is-current' : ''}"><view class="leaderboard-rank rank-${item.rank}"><text>${escapeHTML(item.rank)}</text></view><view class="leaderboard-avatar"><text>${escapeHTML(item.initial)}</text></view><text class="leaderboard-name">${escapeHTML(item.nickname)}</text><text class="leaderboard-points">${escapeHTML(item.points)}</text></view>`).join('')}</view>
      <view class="benefit-grid">${state.items.map((item) => `<view class="benefit-grid-item" data-benefit="${attr(item.action)}"><view class="benefit-emoji">${escapeHTML(item.emoji)}</view><text class="benefit-label">${escapeHTML(item.label)}</text></view>`).join('')}</view>
      <view class="benefit-notice"><text class="benefit-notice-icon">🔊</text><view class="benefit-notice-swiper"><view class="benefit-notice-item"><text class="benefit-notice-text">${escapeHTML(state.notices[state.noticeIndex] || '')}</text></view></view><text class="benefit-notice-arrow">›</text></view>
      <view class="benefit-promos">${state.promos.map((promo) => `<view class="benefit-promo" data-benefit="${attr(promo.action)}"><img class="benefit-promo-image" src="${attr(resolveImage(promo.image))}" alt=""/></view>`).join('')}</view>${dialog}${bottomTabbar('benefits')}</view>`
    app.querySelector('.benefit-grid')?.insertAdjacentHTML('afterend', gamesMarkup)
    bindBottomTabs()
    app.querySelectorAll('[data-benefit]').forEach((item) => item.addEventListener('click', () => openBenefit(item.dataset.benefit)))
    app.querySelectorAll('[data-game-link]').forEach((item) => item.addEventListener('click', () => openGameLink(item.dataset.gameTitle, item.dataset.gameLink)))
    app.querySelector('[data-more-games]')?.addEventListener('click', () => navigate('games'))
    app.querySelectorAll('[data-close-enterprise]').forEach((item) => item.addEventListener('click', (event) => { event.stopPropagation(); state.dialog = false; refresh() }))
    app.querySelector('[data-enterprise-dialog]')?.addEventListener('click', (event) => event.stopPropagation())
    activateIcons()
  }
  function openBenefit(action) {
    if (action === 'enterprise') { state.dialog = true; refresh(); return }
    if (action === 'game') { navigate('games'); return }
    if (action === 'daily') { navigate('tasks'); return }
    showToast('功能即将上线')
  }
  refresh()
  const timer = window.setInterval(() => {
    if (state.notices.length < 2 || state.dialog) return
    state.noticeIndex = (state.noticeIndex + 1) % state.notices.length
    const item = app.querySelector('.benefit-notice-item')
    const text = app.querySelector('.benefit-notice-text')
    if (!item || !text) return
    item.classList.remove('is-entering')
    void item.offsetWidth
    text.textContent = state.notices[state.noticeIndex]
    item.classList.add('is-entering')
  }, 2600)
  return () => window.clearInterval(timer)
}

async function renderDailyTasks() {
  let tasks = []
  function actionText(task) {
    if (task.completed) return '已完成'
    if (task.action === 'check-in') return '签到'
    if (task.action === 'share') return '去分享'
    return '去浏览'
  }
  async function load() {
    try { tasks = await request('/daily-tasks') || [] }
    catch (error) { showToast(errorMessage(error, '加载每日任务失败')) }
  }
  function refresh() {
    app.innerHTML = `<view class="daily-page"><view class="daily-header"><view class="daily-nav-row">${backButton('daily-back')}<text class="daily-page-title">每日任务</text></view></view><view class="daily-task-list">${tasks.map((item) => `<view class="daily-task-card"><view class="daily-task-icon"><text>${escapeHTML(item.emoji)}</text></view><view class="daily-task-copy"><text class="daily-task-title">${escapeHTML(item.title)}</text><text class="daily-task-reward">+${escapeHTML(item.reward)}积分</text></view><button class="daily-task-action ${item.completed ? 'is-completed' : ''}" data-task="${attr(item.id)}">${actionText(item)}</button></view>`).join('')}</view></view>`
    bindBack()
    app.querySelectorAll('[data-task]').forEach((button) => button.addEventListener('click', () => complete(button.dataset.task)))
    activateIcons()
  }
  async function complete(id) {
    const task = tasks.find((item) => item.id === id)
    if (!task || task.completed) return
    try {
      const result = task.action === 'check-in'
        ? await request('/me/daily-check-in', 'POST')
        : await request(`/daily-tasks/${encodeURIComponent(id)}/complete`, 'POST')
      await load()
      showToast(result.awarded ? `任务完成，获得${result.reward}积分` : '今日已完成')
      refresh()
      if (task.action === 'mall') { sessionStorage.setItem('mallActiveTab', 'exchange'); navigate('mall') }
      if (task.action === 'share' && navigator.share) navigator.share({ title: '乐伴伴商城', url: location.href }).catch(() => {})
    } catch (error) {
      showToast(errorMessage(error, '任务完成失败'))
    }
  }
  await load()
  refresh()
}

async function renderGames() {
  let games = []
  async function load() {
    try { games = await requestGames() }
    catch (error) { showToast(errorMessage(error, '加载游戏失败')) }
  }
  function refresh() {
    app.innerHTML = `<view class="game-page"><view class="game-header"><view class="game-nav-row">${backButton('game-back')}<text class="game-page-title">全部游戏</text></view></view><scroll-view class="game-list">${games.map((item, index) => `<button class="game-tile" data-game-title="${attr(item.title)}" data-game-link="${attr(item.link)}" style="--tile-delay:${Math.floor(index / 3) * 110}ms">${item.image ? `<img class="game-tile-image" src="${attr(resolveImage(item.image))}" alt="${attr(item.title)}"/>` : '<view class="game-tile-fallback"></view>'}</button>`).join('')}</scroll-view></view>`
    bindBack()
    app.querySelectorAll('[data-game-link]').forEach((item) => item.addEventListener('click', () => openGameLink(item.dataset.gameTitle, item.dataset.gameLink)))
    activateIcons()
  }
  await load()
  refresh()
}

async function renderGamePlayer(params) {
  const title = params.title || '游戏'
  const link = params.link || ''
  app.innerHTML = `<view class="game-player-page"><view class="game-player-titlebar">${backButton('game-player-back')}<text class="game-player-title">${escapeHTML(title)}</text></view>${link ? `<iframe class="game-player-frame" src="${attr(link)}" title="${attr(title)}"></iframe>` : '<view class="game-player-empty">游戏链接暂未配置</view>'}</view>`
  bindBack()
  activateIcons()
}

async function renderMine() {
  let summary = { profile: { nickname: '' }, stats: [] }
  let address = null
  try {
    ;[summary, address] = await Promise.all([request('/me/summary'), request('/me/address')])
  } catch (error) {
    showToast(errorMessage(error, '加载个人信息失败'))
  }
  app.innerHTML = `<view class="mine-page">
    <view class="profile"><view class="avatar">${icon('UserRound')}</view><view class="profile-text"><text class="nickname">${escapeHTML(summary?.profile?.nickname || '乐伴伴会员')}</text><text class="profile-subtitle">精选酒吧套餐与专属服务</text></view><view class="verification-action"><button class="verification-button" data-verify>${icon('ScanLine')}<text>我要核销</text></button></view></view>
    <view class="stats">${(summary?.stats || []).map((item, index) => `<view class="stat-item" data-stat="${index}"><text class="stat-value">${escapeHTML(item.value)}</text><text class="stat-label">${escapeHTML(item.label)}</text></view>`).join('')}</view>
    <view class="entry-list"><view class="entry-item" data-entry="address"><view class="entry-icon">${icon('MapPin')}</view><text class="entry-label">地址设置</text>${address ? `<text class="entry-summary">${escapeHTML(address.region.join(' '))}</text>` : ''}${icon('ChevronRight')}</view><view class="entry-item" data-entry="orders"><view class="entry-icon">${icon('ClipboardList')}</view><text class="entry-label">我的订单</text>${icon('ChevronRight')}</view></view>${bottomTabbar('mine')}</view>`
  bindBottomTabs()
  app.querySelectorAll('[data-stat]').forEach((item) => item.addEventListener('click', () => {
    const index = Number(item.dataset.stat)
    if (index === 0) navigate('points')
    if (index === 1) navigate('coupons')
  }))
  app.querySelector('[data-entry="address"]')?.addEventListener('click', () => navigate('address'))
  app.querySelector('[data-entry="orders"]')?.addEventListener('click', () => navigate('orders'))
  app.querySelector('[data-verify]')?.addEventListener('click', async () => {
    const code = window.prompt('请输入核销码')
    if (!code) return
    try { await request('/orders/verify', 'POST', { code }); showToast('核销成功') }
    catch (error) { showToast(errorMessage(error, '核销失败')) }
  })
  activateIcons()
}

function areaOptions(source) {
  return Object.entries(source).map(([code, name]) => ({ code, name }))
}

function cityOptions(provinceCode) {
  return areaOptions(areaList.city_list).filter((item) => item.code.startsWith(provinceCode.slice(0, 2)))
}

function countyOptions(cityCode) {
  return areaOptions(areaList.county_list).filter((item) => item.code.startsWith(cityCode.slice(0, 4)))
}

function optionByName(options, name) {
  return options.find((item) => item.name === name) || options[0] || { code: '', name: '' }
}

function regionSelection(region = []) {
  const province = optionByName(areaOptions(areaList.province_list), region[0])
  const city = optionByName(cityOptions(province.code), region[1])
  const county = optionByName(countyOptions(city.code), region[2])
  return { province: province.code, city: city.code, county: county.code }
}

function regionNames(selection) {
  const province = areaList.province_list[selection.province] || ''
  const city = areaList.city_list[selection.city] || ''
  const county = areaList.county_list[selection.county] || ''
  return [province, city, county].filter(Boolean)
}

async function renderAddress() {
  let saved = null
  try { saved = await request('/me/address') }
  catch (error) { showToast(errorMessage(error, '地址加载失败')) }
  const state = {
    contactName: saved?.contactName || '',
    contactPhone: saved?.contactPhone || '',
    detail: saved?.detail || '',
    selection: regionSelection(saved?.region),
    draft: null,
    pickerOpen: false,
  }

  function updateDraft(level, code) {
    const draft = { ...state.draft }
    if (level === 'province') {
      draft.province = code
      draft.city = cityOptions(code)[0]?.code || ''
      draft.county = countyOptions(draft.city)[0]?.code || ''
    }
    if (level === 'city') {
      draft.city = code
      draft.county = countyOptions(code)[0]?.code || ''
    }
    if (level === 'county') draft.county = code
    state.draft = draft
    refreshPickerColumns()
  }

  function pickerColumnsHTML() {
    const draft = state.draft
    const provinces = areaOptions(areaList.province_list)
    const cities = cityOptions(draft.province)
    const counties = countyOptions(draft.city)
    return `<scroll-view class="area-picker-column">${provinces.map((item) => `<button class="area-picker-option ${draft.province === item.code ? 'active' : ''}" data-area-level="province" data-area-code="${item.code}">${item.name}</button>`).join('')}</scroll-view><scroll-view class="area-picker-column">${cities.map((item) => `<button class="area-picker-option ${draft.city === item.code ? 'active' : ''}" data-area-level="city" data-area-code="${item.code}">${item.name}</button>`).join('')}</scroll-view><scroll-view class="area-picker-column">${counties.map((item) => `<button class="area-picker-option ${draft.county === item.code ? 'active' : ''}" data-area-level="county" data-area-code="${item.code}">${item.name}</button>`).join('')}</scroll-view>`
  }

  function pickerHTML() {
    if (!state.pickerOpen) return ''
    return `<view class="area-picker-layer" data-cancel-area><view class="area-picker" data-area-picker><view class="area-picker-header"><button class="area-picker-cancel" data-cancel-area>取消</button><text class="area-picker-title">所在地区</text><button class="area-picker-confirm" data-confirm-area>确定</button></view><view class="area-picker-columns">${pickerColumnsHTML()}</view></view></view>`
  }

  function bindPickerOptions(scope = app) {
    scope.querySelectorAll('[data-area-level]').forEach((button) => button.addEventListener('click', () => updateDraft(button.dataset.areaLevel, button.dataset.areaCode)))
  }

  function refreshPickerColumns() {
    const columns = app.querySelector('.area-picker-columns')
    if (!columns) return
    columns.innerHTML = pickerColumnsHTML()
    bindPickerOptions(columns)
  }

  function refresh() {
    const regionText = regionNames(state.selection).join(' ')
    app.innerHTML = `<view class="address-page"><view class="address-nav">${backButton('address-back')}<text class="address-title">地址设置</text></view>
      <view class="address-form"><label class="address-field address-detail-field"><text class="field-label">联系人</text><input class="detail-input" name="contactName" maxlength="20" value="${attr(state.contactName)}" placeholder="请填写联系人"/></label><view class="address-divider"></view>
        <label class="address-field address-detail-field"><text class="field-label">联系人电话</text><input class="detail-input" name="contactPhone" inputmode="numeric" maxlength="11" value="${attr(state.contactPhone)}" placeholder="请填写联系电话"/></label><view class="address-divider"></view>
        <view class="address-field address-region-field"><text class="field-label">所在地区</text><button class="address-region-button" data-open-area><text class="${regionText ? 'field-selected' : 'field-placeholder'}">${escapeHTML(regionText || '请选择省、市、区县')}</text>${icon('ChevronRight')}</button></view><view class="address-divider"></view>
        <label class="address-field address-detail-field"><text class="field-label">详细地址</text><input class="detail-input" name="detail" maxlength="80" value="${attr(state.detail)}" placeholder="街道、门牌号、楼栋等"/></label></view>
      <button class="save-address">保存地址</button>${pickerHTML()}</view>`
    bindBack()
    app.querySelectorAll('.detail-input').forEach((input) => input.addEventListener('input', () => { state[input.name] = input.value }))
    app.querySelector('[data-open-area]')?.addEventListener('click', () => { state.draft = { ...state.selection }; state.pickerOpen = true; refresh() })
    bindPickerOptions()
    app.querySelectorAll('[data-cancel-area]').forEach((button) => button.addEventListener('click', () => { state.pickerOpen = false; state.draft = null; refresh() }))
    app.querySelector('[data-area-picker]')?.addEventListener('click', (event) => event.stopPropagation())
    app.querySelector('[data-confirm-area]')?.addEventListener('click', () => { state.selection = { ...state.draft }; state.pickerOpen = false; state.draft = null; refresh() })
    app.querySelector('.save-address')?.addEventListener('click', save)
    activateIcons()
  }

  async function save() {
    const contactName = state.contactName.trim()
    const contactPhone = state.contactPhone.trim()
    const detail = state.detail.trim()
    const region = regionNames(state.selection)
    if (!contactName) return showToast('请填写联系人')
    if (!contactPhone) return showToast('请填写联系人电话')
    if (region.length !== 3 || !detail) return showToast('请完善地址信息')
    try { await request('/me/address', 'PUT', { region, detail, contactName, contactPhone }); showToast('地址已保存') }
    catch (error) { showToast(errorMessage(error, '地址保存失败')) }
  }

  refresh()
}

async function renderPoints() {
  let records = []
  let currentPoints = '--'
  try {
    const [items, summary] = await Promise.all([request('/points/records'), request('/me/summary')])
    records = items || []
    currentPoints = summary?.stats?.find((item) => item.label === '积分')?.value || '--'
  } catch (error) {
    showToast(errorMessage(error, '加载积分记录失败'))
  }
  app.innerHTML = `<view class="points-page"><view class="page-header">${backButton('back-button')}<text class="page-title">积分记录</text></view><view class="points-summary"><text class="summary-label">当前积分</text><text class="summary-value">${escapeHTML(currentPoints)}</text><text class="summary-note">积分可用于商城兑换与专属福利</text></view><view class="record-list">${records.map((item) => `<view class="record-item"><view class="record-main"><text class="record-title">${escapeHTML(item.title)}</text><text class="record-time">${escapeHTML(item.time)}</text></view><text class="record-points ${item.change > 0 ? 'income' : 'expense'}">${item.change > 0 ? '+' : ''}${escapeHTML(item.change)}</text></view>`).join('')}</view></view>`
  bindBack()
  activateIcons()
}

async function renderCoupons() {
  const state = { status: 'available', coupons: [] }
  async function load() {
    try { state.coupons = await request(`/coupons?status=${state.status}`) || [] }
    catch (error) { showToast(errorMessage(error, '加载优惠券失败')) }
  }
  function refresh() {
    app.innerHTML = `<view class="coupons-page"><view class="page-header">${backButton('back-button')}<text class="page-title">优惠券</text></view><view class="coupon-tabs top-tabs" style="--tab-count:3"><button class="top-tab ${state.status === 'available' ? 'active' : ''}" data-status="available">待使用</button><button class="top-tab ${state.status === 'used' ? 'active' : ''}" data-status="used">已使用</button><button class="top-tab ${state.status === 'expired' ? 'active' : ''}" data-status="expired">已过期</button></view><view class="coupon-list">${state.coupons.map((item) => `<view class="coupon-card ${attr(item.state)}"><view class="coupon-value"><text class="coupon-currency">¥</text><text>${escapeHTML(item.value)}</text></view><view class="coupon-copy"><text class="coupon-title">${escapeHTML(item.title)}</text><text class="coupon-note">${escapeHTML(item.note)}</text><text class="coupon-date">${escapeHTML(item.date)}</text></view><text class="coupon-state">${escapeHTML(item.status)}</text></view>`).join('')}</view></view>`
    bindBack()
    app.querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', async () => { state.status = button.dataset.status; await load(); refresh() }))
    activateIcons()
  }
  await load()
  refresh()
}

window.addEventListener('hashchange', route)
window.addEventListener('popstate', route)
route()
