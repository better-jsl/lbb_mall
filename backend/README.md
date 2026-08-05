# 乐伴伴商城 API

## 本地代码部署

本地不使用 Docker。只需安装并启动 PostgreSQL 17；API 会连接本机 `quanzhou` 数据库，并自行创建隔离的 `lbb_mall` schema、全部业务表和演示数据。

在本目录执行：

```powershell
go mod tidy
go run .
```

服务默认监听 `http://127.0.0.1:8080`。GORM 会自动创建表、时间戳字段、级联外键关系，并执行演示数据初始化。健康检查为 `GET /healthz`。

## 云端 Docker 部署

云端使用 `Dockerfile` 和 `compose.cloud.yml`：

```bash
POSTGRES_PASSWORD=change-me docker compose -f compose.cloud.yml up -d --build
```

通过 `PORT` 与 `DATABASE_URL` 覆盖运行环境配置。
