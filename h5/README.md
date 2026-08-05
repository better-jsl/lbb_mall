# 乐伴伴商城 H5

移动端 H5 版本，页面与当前微信小程序保持一致，使用现有后端 API。

```powershell
npm install
npm run dev
```

开发服务默认监听所有网卡。H5 会连接当前访问主机的 `8080` 端口，例如通过 `http://192.168.3.77:5173` 打开时，API 地址为 `http://192.168.3.77:8080/api/v1`。

生产构建：

```powershell
npm run build
```
