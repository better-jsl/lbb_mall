Component({
  data: {
    selected: 0,
    tabs: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        icon: 'home',
      },
      {
        pagePath: 'pages/orders/orders',
        text: '订单',
        icon: 'file-1',
      },
      {
        pagePath: 'pages/mine/mine',
        text: '我的',
        icon: 'user',
      },
    ],
  },

  lifetimes: {
    attached(this: any) {
      this.updateSelected()
    },
  },

  pageLifetimes: {
    show(this: any) {
      this.updateSelected()
    },
  },

  methods: {
    updateSelected(this: any) {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentRoute = currentPage ? currentPage.route : ''
      const selected = this.data.tabs.findIndex((item: { pagePath: string }) => item.pagePath === currentRoute)

      if (selected >= 0) {
        this.setData({ selected })
      }
    },

    onTabChange(this: any, event: WechatMiniprogram.CustomEvent<{ value: number }>) {
      const index = Number(event.detail.value)
      const tab = this.data.tabs[index]

      if (!tab) {
        return
      }

      this.setData({ selected: index })
      wx.switchTab({ url: `/${tab.pagePath}` })
    },
  },
})
