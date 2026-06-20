# selffarmbot / QQ 经典农场自动化面板

本项目基于 `qq-farm-bot-ui` / `qq-farm-bot` 相关开源实现继续整理，目标是把原本容易散落、容易失效的运行时参数统一管理，并提升安全性、可维护性和部署体验。

> 注意：协议类自动化天然依赖官方后端接口、客户端版本和登录 Code 的有效性。项目只做学习研究和自用自动化实验，不保证长期可用，也不建议拿生产账号冒险。若官方协议变化，请优先停用账号，再更新运行时配置。

## 本次 90+ 升级重点

- 登录协议参数集中到 `core/src/config/protocol.js`，版本号、网关、UA、设备信息、心跳、重连策略都可统一维护。
- 支持用环境变量覆盖协议参数，避免把版本号、设备字段写死到业务代码里。
- WASM 加密失败默认停止发送协议包，不再自动降级发明文包。
- 登录响应异常时不再继续启动心跳和自动化任务。
- WebSocket 增加握手超时、终止错误识别、指数退避重连。
- 新增协议配置测试：`pnpm -C core test`。
- 新增文档：[`docs/protocol-runtime.md`](./docs/protocol-runtime.md)。

## 功能特性

### 多账号管理

- 账号新增、编辑、删除、启动、停止
- 手动输入 Code
- 账号被踢下线自动停止
- 账号离线推送通知（支持 Bark、自定义 Webhook 等）

### 自动化能力

- 农场：收获、种植、浇水、除草、除虫、铲除、土地升级
- 仓库：收获后自动出售果实
- 好友：自动偷菜 / 帮忙 / 捣乱
- 任务：自动检查并领取
- 好友黑名单：跳过指定好友
- 静默时段：指定时间段内不执行好友操作

### Web 面板

- 概览 / 农场 / 背包 / 好友 / 分析 / 账号 / 设置页面
- 实时日志，支持按账号、模块、事件、级别、关键词、时间范围筛选
- 深色 / 浅色主题切换

## 部署使用方法

### 环境要求及启动流程

建议通过 Docker 部署。

```bash
# 构建并后台启动
docker compose up -d --build
```

启动后访问：

- 本机：`http://localhost:3000`
- 局域网：`http://<部署设备IP>:3000`

### 更新方法

```bash
docker compose down
git pull
docker compose up -d --build
```

### 查看日志

```bash
docker compose logs -f
```

## 登录协议运行时配置

常用环境变量：

```bash
FARM_CLIENT_VERSION=1.7.0.9_20260313 \
FARM_PLATFORM=qq \
FARM_OS=iOS \
FARM_DEVICE_SYS_SOFTWARE='iOS 18.7' \
docker compose up -d --build
```

完整说明见：[`docs/protocol-runtime.md`](./docs/protocol-runtime.md)。

## 开发命令

```bash
pnpm install -r
pnpm -C core test
pnpm build:web
pnpm dev
```

## 特别感谢

- 原项目功能：[Penty-d/qq-farm-bot-ui](https://github.com/Penty-d/qq-farm-bot-ui)
- 核心功能：[linguo2625469/qq-farm-bot](https://github.com/linguo2625469/qq-farm-bot)
- 部分功能：[QianChenJun/qq-farm-bot](https://github.com/QianChenJun/qq-farm-bot)

## 免责声明

本项目仅供学习与研究技术用途，完全开源免费。使用协议类工具可能违反相关服务条款，并可能造成账号限制、封禁等后果。由此产生的一切后果由使用者自行承担。
