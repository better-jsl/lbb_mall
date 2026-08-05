import { request } from '../../api/client'

type PointRecord = { id: string; title: string; time: string; change: number }

Page({
  data: { menuButtonTop: 0, menuButtonHeight: 0, records: [] as PointRecord[], networkError: false },
  onLoad() { const app = getApp<IAppOption>(); this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight }); this.loadRecords() },
  async loadRecords() { try { this.setData({ records: await request<PointRecord[]>('/points/records'), networkError: false }) } catch { this.setData({ networkError: true }); wx.showToast({ title: '加载积分记录失败', icon: 'none' }) } },
  retryNetwork() { this.setData({ networkError: false }); this.loadRecords() },
  goBack() { wx.navigateBack() },
})
