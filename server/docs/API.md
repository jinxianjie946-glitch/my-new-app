# Sintech Backend API

Base URL: `/api/v1`

## 认证

- 受保护接口需要请求头：`x-api-key: <API_KEY>`
- 受保护接口：`GET /metrics`、`PATCH /verticals/:id/home`
- `GET /metrics` 启用每分钟请求频率限制，超限返回 `429`

## 通用响应结构

### 成功
```json
{
  "success": true,
  "data": {}
}
```

### 失败
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "error message"
  }
}
```

## 接口列表

### 1) 健康检查
- `GET /health`

### 2) 监控指标
- `GET /metrics`

### 3) 垂类列表
- `GET /verticals`

### 4) 单个垂类全量数据
- `GET /verticals/:id`

### 5) 垂类 Home 数据
- `GET /verticals/:id/home`

### 6) 垂类 Industry 数据
- `GET /verticals/:id/industry`

### 7) 垂类 Consumer 数据
- `GET /verticals/:id/consumer`

### 8) 更新 Home 数据（局部）
- `PATCH /verticals/:id/home`
- Body 示例：
```json
{
  "marketSize": "$700B",
  "asp": "$420"
}
```

## 错误码约定

- `NOT_FOUND`
- `VERTICAL_NOT_FOUND`
- `HOME_NOT_FOUND`
- `INDUSTRY_NOT_FOUND`
- `CONSUMER_NOT_FOUND`
- `INVALID_PAYLOAD`
- `UNAUTHORIZED`
- `CORS_FORBIDDEN`
- `RATE_LIMITED`
- `INTERNAL_SERVER_ERROR`
