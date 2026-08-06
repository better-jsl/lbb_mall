/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    menuButtonBottom: number,
    menuButtonTop: number,
    menuButtonHeight: number,
    authToken: string,
    loginReady: Promise<void>,
    needsProfile: boolean,
    profile?: { nickname: string, avatar: string, phone: string },
    login: () => void,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
