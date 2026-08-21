# 云端部署与同步说明

更新时间：2026-08-20

## 当前状态

- 云服务器：`106.55.35.162`，SSH 用户为 `ubuntu`。
- 部署目录：`/opt/lbb_mall/backend`。
- 正在运行：PostgreSQL 17 和 API Docker 容器。
- 已恢复本机数据库（11 个商家、8 个套餐、17 个用户）和 `backend/uploads/` 图片。
- 生产密钥、`.env`、上传图片和 PostgreSQL 数据卷均只保存在服务器，不纳入 Git，也不会被日常代码同步覆盖。
- `WECHAT_PAY_ENABLED=true`，支付已启用，等待真机小额交易验证。
- Nginx 已提供 `mall.lebb.chat` 的 HTTPS 反向代理，证书每日自动检查续期。
- 后台管理站点已部署至 `https://mall.lebb.chat/admin/`，静态文件位于服务器 `backend/www/admin/`。

## 当前阻塞

生产域名为 `mall.lebb.chat`，HTTPS 已签发并验证通过。微信支付已启用，等待真机联调。

处理顺序：

1. 在微信公众平台将 `https://mall.lebb.chat` 配置为合法请求、上传和下载域名。
2. 将小程序 API 切到 `https://mall.lebb.chat/api/v1`。
3. 确认微信支付商户号已绑定小程序 AppID 且开通 JSAPI 支付。
4. 用真机小额订单验证支付面板、微信支付回调、订单状态和后台营收。

若 HTTP 验证失败，改用 DNS TXT 验证申请证书，不依赖 A 记录的 HTTP 访问。

## 本地开发

在项目根目录运行：

```powershell
.\start-local.ps1
```

它会启动：

- 后端：`http://127.0.0.1:8080`
- 后台：`http://127.0.0.1:5173`
- H5：`http://127.0.0.1:5174`

小程序模拟器走 `http://127.0.0.1:8080/api/v1`；真机本地调试走 `miniprogram/api/client.ts` 与 `.js` 中的 `LAN_API_BASE_URL`。手机需和电脑处于同一 Wi-Fi。

本地 `.env`、生产 `.env`、私钥、平台证书和上传文件均不得提交 Git。

## 云端小程序切换

HTTPS 证书签发成功前，真机不能安全地切换到云端。证书成功后，将以下两个文件中的 `LAN_API_BASE_URL` 改为云端地址，并保持内容一致：

- `miniprogram/api/client.ts`
- `miniprogram/api/client.js`

云端地址：

```text
https://mall.lebb.chat/api/v1
```

切换后使用微信开发者工具重新编译/上传小程序。回到本地调试时恢复原有规则：模拟器使用 `127.0.0.1`，真机使用局域网 IP。

H5 与后台当前没有生产静态站点部署。它们继续通过本机 Vite 服务开发；待需要对外发布时，再单独配置静态文件构建和 Nginx 站点，不能把开发服务器直接暴露到公网。

## 日常后端代码同步

执行 `backend/deploy-cloud.ps1` 会：

1. 打包 `backend/` 源码。
2. 排除 `.env`、`secrets/`、`uploads/`、编译缓存和本地二进制。
3. 上传到服务器并覆盖同名代码文件。
4. 执行 `docker compose ... up -d --build api`，重新构建并滚动重启 API。

执行示例：

```powershell
.\backend\deploy-cloud.ps1 -KeyPath 'C:\Users\50258\Desktop\edge_download\key0820.pem'
```

该操作不会同步数据库内容或图片。新增 SQL 迁移文件后，API 重启会自行执行迁移；涉及已有生产数据的批量修改，应先备份数据库，再单独执行经过确认的迁移脚本。

若同时改了 Nginx 配置且 HTTPS 已可用：

```powershell
.\backend\deploy-cloud.ps1 -KeyPath 'C:\Users\50258\Desktop\edge_download\key0820.pem' -RestartNginx
```

## 数据与故障处理

- 代码：用 `deploy-cloud.ps1` 同步。
- 数据库：生产数据以云端为准，不在日常代码发布时从本机覆盖。
- 上传图片：生产图片以云端 `backend/uploads/` 为准；需要迁移新图片时单独确认后同步。
- 日志：`ssh` 登录服务器后，在 `/opt/lbb_mall/backend` 执行 `sudo docker compose -f compose.cloud.yml logs -f api`。
- 健康检查：服务器本机 `http://127.0.0.1:8080/healthz`；HTTPS 启用后使用 `https://mall.lebb.chat/api/v1/health`。

## 禁止事项

- 不要将 `backend/.env`、`backend/secrets/`、私钥、APIv3 密钥或数据库备份提交到 Git。
- 不要在未备份的情况下把本机数据库直接覆盖云端生产数据库。
- 不要在 HTTPS 回调未验证前开启 `WECHAT_PAY_ENABLED`。
