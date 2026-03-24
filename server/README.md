# Sintech Backend

## 本地运行

```bash
cd server
npm install
export API_KEY=your-strong-api-key
npm start
```

服务默认启动在 `http://localhost:4000`。

## 关键脚本

- `npm test`：运行自动化测试并输出覆盖率（阈值 80%）。
- `npm run perf`：压测 `/api/v1/health`。

## 负载均衡部署

```bash
docker compose -f ../docker-compose.backend.yml up --build
```

访问入口：
- `http://localhost:8080/api/v1/health`

## 文档

- 架构文档：`docs/ARCHITECTURE.md`
- API 文档：`docs/API.md`
- OpenAPI：`docs/openapi.yaml`
