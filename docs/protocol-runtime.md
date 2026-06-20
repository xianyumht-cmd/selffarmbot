# 登录协议运行时配置说明

这次升级把登录链路里最容易失效、最容易误伤账号的内容集中到 `core/src/config/protocol.js`。
以后不需要全局搜索改代码，只需要改环境变量或 Web 面板里的运行时客户端配置。

## 可调环境变量

| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `FARM_SERVER_URL` | WebSocket 网关地址 | `wss://gate-obt.nqf.qq.com/prod/ws` |
| `FARM_CLIENT_VERSION` | 客户端版本号 | `1.7.0.9_20260313` |
| `FARM_PLATFORM` | 平台，支持 `qq` / `wx` | `qq` |
| `FARM_OS` | 登录上报系统 | `iOS` |
| `FARM_USER_AGENT` | WebSocket 握手 User-Agent | 内置移动端 UA |
| `FARM_WS_ORIGIN` | WebSocket Origin | `https://gate-obt.nqf.qq.com` |
| `FARM_DEVICE_SYS_SOFTWARE` | 设备系统版本 | `iOS 18.7` |
| `FARM_DEVICE_NETWORK` | 网络类型 | `wifi` |
| `FARM_DEVICE_MEMORY` | 设备内存字段 | `7672` |
| `FARM_DEVICE_ID` | 设备标识字段 | `iPhone X<iPhone18,3>` |
| `FARM_ALLOW_PLAINTEXT_PACKET` | 是否允许 WASM 加密失败后继续发明文包 | 默认不允许 |
| `FARM_RECONNECT_MIN_MS` | 重连最小等待 | `3000` |
| `FARM_RECONNECT_MAX_MS` | 重连最大等待 | `60000` |
| `FARM_WS_HANDSHAKE_TIMEOUT_MS` | WebSocket 握手超时 | `15000` |
| `FARM_HEARTBEAT_TIMEOUT_MS` | 心跳响应超时 | `60000` |
| `FARM_HEARTBEAT_MAX_MISSES` | 连续丢失多少次心跳后重连 | `2` |

## 为什么这版更稳

1. 登录协议字段集中管理，后续更新版本号、UA、设备字段不用改业务代码。
2. WASM 加密失败默认直接停止发送，避免旧逻辑继续发未加密包。
3. 登录响应缺少基础账号信息时不会继续启动心跳和自动化。
4. WebSocket 增加握手超时、终止错误码识别、指数退避重连。
5. 新增最小协议配置测试：`pnpm -C core test`。

## 推荐运行方式

```bash
FARM_CLIENT_VERSION=你的版本号 \
FARM_USER_AGENT='你的UA' \
FARM_DEVICE_SYS_SOFTWARE='iOS 18.x' \
docker compose up -d --build
```

不要把未知来源的登录 Code、抓包参数、账号资料提交进仓库。需要更新时用环境变量或本地 `data/store.json`，不要写死在源码里。
