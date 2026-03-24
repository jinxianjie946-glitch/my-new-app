# Sintech Backend Architecture

## 1. 业务需求拆解

当前前端系统是智能硬件行业分析看板，核心后端能力需求包括：
- 多垂类数据读取（Home / Industry / Consumer 三大域）
- 指标数据可更新（运营后台写入）
- 稳定的 API 协议供前端与外部系统复用
- 具备观测能力（日志、健康状态、请求统计）
- 可通过横向扩展支持高并发读请求

## 2. 分层架构

后端采用经典 3 层 + 横切能力设计：

- 表现层（Presentation Layer）
  - 目录：`src/routes` + `src/controllers`
  - 职责：HTTP 协议处理、参数解析、响应包装、状态码规范

- 业务逻辑层（Business Layer）
  - 目录：`src/services`
  - 职责：业务规则封装（如查询聚合、局部更新策略）

- 数据访问层（Data Access Layer）
  - 目录：`src/repositories` + `src/db`
  - 职责：SQL 访问、持久化、种子数据加载

- 横切层（Cross-cutting）
  - 目录：`src/middlewares` / `src/monitoring` / `src/logger`
  - 职责：统一异常处理、请求链路追踪、日志输出、指标统计

## 3. 技术选型

- Node.js + Express：轻量、成熟、生态完善，适合 REST API。
- SQLite（better-sqlite3）：单机部署简洁，读性能高，便于 demo 与快速迭代。
- Pino / pino-http：高性能结构化日志。
- Jest + Supertest：接口测试 + 覆盖率统计。
- Nginx：负载均衡反向代理。

## 4. 高可用与可扩展策略

- 无状态 API 设计：便于多实例扩容。
- 水平扩展：`docker-compose.backend.yml` 提供 `api1` + `api2` 双实例。
- 负载均衡：Nginx `least_conn` 分发策略。
- 健康检查：`GET /api/v1/health`。
- 指标采集：`GET /api/v1/metrics` 提供请求总量/状态码分布。

## 5. 错误处理与日志

- 统一错误响应结构：
  - `success: false`
  - `error.code`
  - `error.message`
- 全局中间件处理 404 与异常。
- 每次请求自动注入 `x-request-id` 用于日志关联分析。

## 6. 目录结构

```text
server/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config.js
│   ├── logger.js
│   ├── db/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── monitoring/
│   └── utils/
├── tests/
├── scripts/
├── docs/
└── Dockerfile
```
