type AMapPoint = {
  getLng: () => number
  getLat: () => number
}

type AMapMap = {
  add: (overlay: AMapMarker) => void
  on: (event: 'click', listener: (event: { lnglat: AMapPoint }) => void) => void
  destroy: () => void
}

type AMapMarker = {
  setPosition: (position: [number, number]) => void
}

export type MapCoordinates = {
  longitude: number
  latitude: number
}

export type AMapApi = {
  Map: new (container: HTMLElement, options: { zoom: number; center: [number, number] }) => AMapMap
  Marker: new (options: { position: [number, number] }) => AMapMarker
}

declare global {
  interface Window {
    AMap?: AMapApi
    _AMapSecurityConfig?: { securityJsCode: string }
  }
}

let amapLoader: Promise<AMapApi> | null = null

export function loadAMap(): Promise<AMapApi> {
  if (window.AMap) return Promise.resolve(window.AMap)
  if (amapLoader) return amapLoader

  const key = import.meta.env.VITE_AMAP_WEB_JS_KEY
  const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE
  if (!key || !securityJsCode) return Promise.reject(new Error('未配置高德地图密钥'))

  window._AMapSecurityConfig = { securityJsCode }
  amapLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`
    script.async = true
    script.onload = () => window.AMap ? resolve(window.AMap) : reject(new Error('高德地图加载失败'))
    script.onerror = () => reject(new Error('高德地图加载失败，请检查网络和密钥配置'))
    document.head.appendChild(script)
  })
  return amapLoader
}

export function parseCoordinates(value: string): MapCoordinates | null {
  const [longitude, latitude] = value.split(',').map((item) => Number(item.trim()))
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return null
  return { longitude, latitude }
}

export function formatCoordinates({ longitude, latitude }: MapCoordinates) {
  return `${longitude.toFixed(6)},${latitude.toFixed(6)}`
}
