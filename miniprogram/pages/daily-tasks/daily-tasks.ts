import { request } from '../../api/client'

type DailyTask = {
  id: string
  emoji: string
  title: string
  reward: number
  action: string
  actionText: string
  completed: boolean
}

type TaskResult = { completed: boolean; awarded: boolean; reward: number; points: number }

function actionText(task: Omit<DailyTask, 'actionText'>) {
  if (task.completed) return '已完成'
  if (task.action === 'check-in') return '签到'
  if (task.action === 'share') return '去分享'
  return '去浏览'
}

Page({
  data: {
    menuButtonTop: 0,
    menuButtonHeight: 0,
    tasks: [] as DailyTask[],
    networkError: false,
  },

  onLoad() {
    const app = getApp<IAppOption>()
    this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight })
    wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#f4f6fb' })
  },

  onShow() {
    this.loadTasks()
  },

  async loadTasks() {
    try {
      const tasks = await request<Omit<DailyTask, 'actionText'>[]>('/daily-tasks')
      this.setData({ tasks: tasks.map((task) => ({ ...task, actionText: actionText(task) })), networkError: false })
    } catch {
      this.setData({ networkError: true })
      wx.showToast({ title: '加载每日任务失败', icon: 'none' })
    }
  },

  retryNetwork() { this.setData({ networkError: false }); this.loadTasks() },

  async handleTask(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id)
    const task = this.data.tasks.find((item) => item.id === id)
    if (!task || task.completed) return

    try {
      let result: TaskResult
      if (task.action === 'check-in') {
        const checkIn = await request<{ checkedIn: boolean; awarded: boolean; reward: number; points: number }>('/me/daily-check-in', 'POST')
        result = { completed: checkIn.checkedIn, awarded: checkIn.awarded, reward: checkIn.reward, points: checkIn.points }
      } else {
        result = await request<TaskResult>(`/daily-tasks/${encodeURIComponent(task.id)}/complete`, 'POST')
      }
      await this.loadTasks()
      wx.showToast({ title: result.awarded ? `任务完成，获得${result.reward}积分` : '今日已完成', icon: 'none' })

      if (task.action === 'mall') {
        wx.setStorageSync('mallActiveTab', 'exchange')
        wx.switchTab({ url: '/pages/index/index' })
      } else if (task.action === 'share') {
        wx.showShareMenu({ withShareTicket: false })
      }
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '任务完成失败', icon: 'none' })
    }
  },

  goBack() {
    wx.navigateBack()
  },
})
