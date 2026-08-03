type OrderContent = {
  name: string
  count: string
  isPoints?: boolean
}

type StatusConfig = {
  icon: string
  note: string
}

const defaultContents: OrderContent[] = [
  { name: '套餐商品', count: '1 份' },
  { name: '到店专属服务', count: '1 次' },
  { name: '赠送积分', count: '100', isPoints: true },
]

const contentsByTitle: Record<string, OrderContent[]> = {
  '名仕洋酒套餐': [
    { name: '名仕洋酒', count: '1 瓶' },
    { name: '精选果盘', count: '1 份' },
    { name: '小吃拼盘', count: '1 份' },
    { name: '赠送积分', count: '1264', isPoints: true },
  ],
  '喜力啤酒套餐': [
    { name: '喜力啤酒', count: '12 瓶' },
    { name: '小吃拼盘', count: '1 份' },
    { name: '赠送积分', count: '398', isPoints: true },
  ],
  '百威小酌套餐': [
    { name: '百威啤酒', count: '6 瓶' },
    { name: '限定小食', count: '1 份' },
    { name: '赠送积分', count: '32', isPoints: true },
  ],
  '野格欢喜套餐': [
    { name: '野格利口酒', count: '1 瓶' },
    { name: '小吃拼盘', count: '1 份' },
    { name: '赠送积分', count: '238', isPoints: true },
  ],
}

const statusConfig: Record<string, StatusConfig> = {
  '待核销': { icon: 'time', note: '请在有效期内到店使用' },
  '已核销': { icon: 'check-circle', note: '该订单已完成核销' },
  '已失效': { icon: 'close-circle', note: '该订单已超过有效期' },
}

Page({
  data: {
    menuButtonTop: 0,
    menuButtonHeight: 0,
    title: '',
    merchant: '',
    price: '',
    status: '',
    statusIcon: 'time',
    statusNote: '',
    canUsePoints: false,
    contents: defaultContents,
    orderNo: 'LBB202608031520',
  },

  onLoad(options: Record<string, string | undefined>) {
    const app = getApp<IAppOption>()

    const title = options.title ? decodeURIComponent(options.title) : ''
    const status = options.status ? decodeURIComponent(options.status) : ''
    const detailStatus = statusConfig[status] || statusConfig['待核销']

    this.setData({
      menuButtonTop: app.globalData.menuButtonTop,
      menuButtonHeight: app.globalData.menuButtonHeight,
      title,
      merchant: options.merchant ? decodeURIComponent(options.merchant) : '',
      price: options.price ? decodeURIComponent(options.price) : '',
      status,
      statusIcon: detailStatus.icon,
      statusNote: detailStatus.note,
      canUsePoints: status === '已核销',
      contents: contentsByTitle[title] || defaultContents,
    })
  },

  goBack() {
    wx.navigateBack()
  },
})
