---
title: "修复 WebSocket 连接在 Nginx 代理后断开的问题"
category: issues
tags: [websocket, nginx, proxy, connection, timeout]
created: 2026-02-26
updated: 2026-02-26
related: []
---

## Background
生产环境中 WebSocket 连接在 60 秒后自动断开，开发环境正常。排查发现是 Nginx 反向代理的默认超时配置导致。

## Content
### 问题现象
- WebSocket 连接建立成功后，空闲 60 秒自动断开
- 客户端收到 1006 错误码（异常关闭）
- 仅在经过 Nginx 代理时出现

### 根因分析
Nginx 的 `proxy_read_timeout` 默认值为 60 秒。WebSocket 空闲期间没有数据传输，Nginx 认为连接超时并主动关闭。

### 解决方案
1. 增加 Nginx 超时配置：
```nginx
location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

2. 实现应用层心跳（双重保障）：
- 客户端每 30 秒发送 ping
- 服务端响应 pong
- 超过 3 次未响应则重连

## Key Takeaways
- Nginx 代理 WebSocket 需要显式配置 upgrade 和超时
- 应用层心跳是 WebSocket 长连接的最佳实践
- 生产环境排查网络问题时优先检查代理层配置
