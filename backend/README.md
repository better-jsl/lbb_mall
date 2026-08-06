# 乐伴伴商家严选 API

## 本地代码部署

本地不使用 Docker。只需安装并启动 PostgreSQL 17；API 会连接本机 `quanzhou` 数据库，并自行创建隔离的 `lbb_mall` schema、全部业务表和演示数据。

在本目录执行：

```powershell
go mod tidy
go run .
```

服务默认监听 `http://127.0.0.1:8080`。GORM 会自动创建表、时间戳字段、级联外键关系，并执行演示数据初始化。健康检查为 `GET /healthz`。

## 用户登录

- 小程序使用 `POST /api/v1/auth/wechat/login` 换取登录令牌，再通过 `POST /api/v1/me/phone` 授权手机号。
- H5 使用 `POST /api/v1/auth/phone/login` 登录；短信服务接入前，验证码仅校验为 4 至 6 位数字。
- 微信授权手机号已存在 H5 账户时，后端会在事务中绑定微信身份并合并积分、订单、优惠券、地址、任务和游戏记录。
- 用户数据接口要求 `Authorization: Bearer <token>`，令牌有效期为 30 天。

微信登录需配置 `WECHAT_APP_ID`、`WECHAT_APP_SECRET` 和随机生成的 `AUTH_TOKEN_SECRET`。真实密钥只放在未提交的 `.env` 中，并通过 `start-local.ps1` 加载。

## 云端 Docker 部署

云端使用 `Dockerfile` 和 `compose.cloud.yml`：

```bash
POSTGRES_PASSWORD=change-me docker compose -f compose.cloud.yml up -d --build
```

通过 `PORT` 与 `DATABASE_URL` 覆盖运行环境配置。
