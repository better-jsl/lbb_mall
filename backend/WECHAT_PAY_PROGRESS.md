# 微信支付接入进度

更新时间：2026-08-20

## 已具备的信息

- 小程序 AppID：已在后端微信登录配置中使用。
- 微信支付商户号：`1711686534`。
- 商户 API 私钥：已在本机 `backend/.env` 中配置私钥文件路径。
- 商户 API 证书序列号：`6062FED80AE8EF2894789FF6022D9C6EFA510798`。
- APIv3 密钥：已写入本机 `backend/.env`，不记录在本文件或 Git 中。
- 微信支付平台证书：已通过 `download-wechat-pay-platform-cert.ps1` 下载到本机受忽略的 `backend/secrets/`，回调验签配置已就位。

## 已完成的代码

- 后端 JSAPI 预下单：`POST /api/v1/payments/wechat/jsapi`。
- 后端支付回调：`POST /api/v1/payments/wechat/notify`。
- 微信支付 v3 请求签名、小程序支付参数签名、通知验签、AES-GCM 通知解密。
- 支付通知同时校验 AppID、商户号和套餐金额。
- 订单增加 `payment_status`、微信交易号与支付时间。只有收到有效支付成功通知后，订单才可展示、核销和计入后台营收。
- 小程序套餐详情已调用 `wx.requestPayment`。
- `go test ./...` 已通过，签名与通知解密有单元测试覆盖。

## 生产部署状态

- 服务器 `106.55.35.162` 已部署 PostgreSQL 17、API 和现有数据库、上传图片。
- 商户私钥与微信支付平台证书已存放在服务器受限权限目录并挂载给 API。
- `https://mall.lebb.chat/api/v1/health` 已通过验证；Nginx 反向代理与证书自动续期已启用。
- 当前 `WECHAT_PAY_ENABLED=true`；支付回调公网入口已验证可达，等待真实支付通知验证。

## 未完成项

1. 在微信公众平台配置 `https://mall.lebb.chat` 为小程序的合法请求、上传和下载域名。
2. 在微信支付商户平台确认小程序 AppID 已绑定该商户号，并开通小程序支付。
3. 用小额真实订单验证：预下单、支付面板、支付通知、订单显示、后台营收。

## 配置项

真实配置只写入未提交的 `backend/.env`。字段模板见 `.env.payment.example`。

```text
WECHAT_PAY_MCH_ID=
WECHAT_PAY_API_V3_KEY=
WECHAT_PAY_PRIVATE_KEY_PATH=
WECHAT_PAY_MCH_SERIAL_NO=
WECHAT_PAY_ENABLED=false
WECHAT_PAY_NOTIFY_URL=
WECHAT_PAY_PLATFORM_CERT_PATH=
```

不要将 APIv3 密钥、商户私钥或任何 `.env` 内容提交到 Git、粘贴到文档或发送到聊天中。

## 恢复联调时的顺序

1. 在微信公众平台配置新域名，并将小程序 API 切到 `https://mall.lebb.chat/api/v1`。
2. 确认微信支付 AppID 绑定和 JSAPI 支付权限。
3. 在真机小程序完成一笔小额支付，并确认订单仅在通知成功后变为“未使用”。
