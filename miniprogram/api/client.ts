export const API_BASE_URL = 'http://192.168.3.77:8080/api/v1'

type APIResponse<T> = { data: T }
type APIErrorResponse = { data?: { message?: string } }
type LoginResponse = { token: string; profile: { nickname: string; avatar: string; phone: string }; needsProfile: boolean }

function requestHeaders() {
  const token = getApp<IAppOption>().globalData.authToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function rawRequest<T>(path: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request<APIResponse<T>>({
      url: `${API_BASE_URL}${path}`,
      method,
      data,
      header: requestHeaders(),
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve((response.data as APIResponse<T>).data)
          return
        }

        const errorPayload = response.data as unknown as APIErrorResponse
        reject(new Error(errorPayload.data && errorPayload.data.message ? errorPayload.data.message : `API request failed: ${response.statusCode}`))
      },
      fail: reject,
    })
  })
}

export function request<T>(path: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: Record<string, unknown>): Promise<T> {
  return getApp<IAppOption>().globalData.loginReady.then(() => rawRequest<T>(path, method, data))
}

export async function loginWithWeChat(code: string) {
  return rawRequest<LoginResponse>('/auth/wechat/login', 'POST', { code })
}

export function authorizeWechatPhone(phoneCode: string) {
  return rawRequest<LoginResponse>('/me/phone', 'POST', { phoneCode })
}

export function updateWechatProfile(data: { nickname: string; avatar: string }) {
  return rawRequest<LoginResponse['profile']>('/me/profile', 'PUT', data)
}

export function uploadWechatAvatar(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE_URL}/auth/wechat/avatar`,
      filePath,
      name: 'file',
      header: requestHeaders(),
      success(response) {
        try {
          const payload = JSON.parse(response.data) as APIResponse<{ url: string }>
          if (response.statusCode >= 200 && response.statusCode < 300 && payload.data.url) {
            resolve(payload.data.url)
            return
          }
          reject(new Error('头像上传失败'))
        } catch {
          reject(new Error('头像上传失败'))
        }
      },
      fail: reject,
    })
  })
}
