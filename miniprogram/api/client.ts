export const API_BASE_URL = 'http://192.168.31.96:8080/api/v1'

type APIResponse<T> = { data: T }
type APIErrorResponse = { data?: { message?: string } }

export function request<T>(path: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request<APIResponse<T>>({
      url: `${API_BASE_URL}${path}`,
      method,
      data,
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
