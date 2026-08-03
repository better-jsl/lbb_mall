type Merchant = {
  name: string
  pinyin: string
}

type PackageCard = {
  title: string
  price: string
  points: string
  tag: string
  gifts: string[]
  tone: string
}

const merchants: Merchant[] = [
  { name: '梦田', pinyin: 'meng tian' },
  { name: '柏林之声', pinyin: 'bai lin zhi sheng' },
  { name: '欢唱', pinyin: 'huan chang' },
  { name: '欢乐迪', pinyin: 'huan le di' },
]

const packageGroups: PackageCard[][] = [
  [
    { title: '名仕洋酒套餐', price: '1580', points: '1264', tag: '赠送', gifts: ['¥1000 抵扣券', '精美果盘 1 份'], tone: 'whiskey' },
    { title: '喜力啤酒套餐', price: '498', points: '398', tag: '赠送', gifts: ['¥100 抵用券', '小吃拼盘 1 份'], tone: 'lager' },
    { title: '野格欢喜套餐', price: '298', points: '238', tag: '赠送', gifts: ['¥1000 抵扣券', '小吃拼盘 1 份'], tone: 'ruby' },
    { title: '百威小酌套餐', price: '39.9', points: '32', tag: '赠送', gifts: ['神秘酒水 1 份', '限定小食 1 份'], tone: 'club' },
  ],
  [
    { title: '黑方威士忌套餐', price: '1288', points: '1030', tag: '赠送', gifts: ['¥800 抵扣券', '精品果盘 1 份'], tone: 'whiskey' },
    { title: '科罗娜欢聚套餐', price: '568', points: '454', tag: '赠送', gifts: ['¥120 抵用券', '特色小吃 1 份'], tone: 'lager' },
    { title: '特调鸡尾酒套餐', price: '368', points: '294', tag: '赠送', gifts: ['双人小食拼盘', '驻唱点歌券'], tone: 'ruby' },
  ],
  [
    { title: '欢唱尊享套餐', price: '888', points: '710', tag: '赠送', gifts: ['¥500 包厢券', '欢唱时长 1 小时'], tone: 'club' },
    { title: '百威畅饮套餐', price: '468', points: '374', tag: '赠送', gifts: ['小食拼盘 1 份', '欢唱时长 30 分钟'], tone: 'lager' },
    { title: '野格派对套餐', price: '328', points: '262', tag: '赠送', gifts: ['派对礼帽 2 个', '定制果盘 1 份'], tone: 'ruby' },
  ],
  [
    { title: '欢乐迪派对套餐', price: '1088', points: '870', tag: '赠送', gifts: ['¥600 包厢券', '豪华果盘 1 份'], tone: 'whiskey' },
    { title: '青岛啤酒套餐', price: '398', points: '318', tag: '赠送', gifts: ['小吃拼盘 1 份', '欢唱时长 30 分钟'], tone: 'lager' },
    { title: '微醺畅玩套餐', price: '258', points: '206', tag: '赠送', gifts: ['特调酒水 2 杯', '零食拼盘 1 份'], tone: 'club' },
  ],
]

Page({
  data: {
    activeMerchant: 0,
    menuButtonTop: 0,
    showPackageAnimation: true,
    merchants,
    packages: packageGroups[0],
  },

  onLoad() {
    const app = getApp<IAppOption>()

    this.setData({
      menuButtonTop: app.globalData.menuButtonTop,
    })

    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#f4f6fb',
    })
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()

    if (tabBar) {
      tabBar.setData({ selected: 0 })
    }

  },

  selectMerchant(event: WechatMiniprogram.TouchEvent) {
    const index = Number(event.currentTarget.dataset.index)
    const packages = packageGroups[index]

    if (!packages) {
      return
    }

    this.setData(
      {
        activeMerchant: index,
        packages,
        showPackageAnimation: false,
      },
      () => {
        wx.nextTick(() => this.setData({ showPackageAnimation: true }))
      },
    )
  },

  showPackageDetail(event: WechatMiniprogram.TouchEvent) {
    const { title, price, points } = event.currentTarget.dataset

    wx.navigateTo({
      url: `/pages/package-detail/package-detail?title=${encodeURIComponent(String(title))}&price=${encodeURIComponent(String(price))}&points=${encodeURIComponent(String(points))}`,
    })
  },
})
