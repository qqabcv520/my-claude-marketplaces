---
title: "选择 JWT 而非 Session 作为认证方案"
category: decisions
tags: [auth, jwt, session, api, security]
created: 2026-02-26
updated: 2026-02-26
related: []
---

## Background
项目需要为 REST API 选择认证方案。主要候选方案是 JWT（无状态令牌）和 Session（服务端状态）。

## Content
经过评估，选择 JWT 作为认证方案，原因如下：

1. **无状态性**：JWT 不需要服务端存储 session，适合水平扩展
2. **跨服务通信**：微服务架构下，JWT 可以在服务间传递用户身份
3. **移动端友好**：不依赖 cookie，适合移动端和第三方集成

权衡取舍：
- JWT 无法即时撤销（通过短过期时间 + refresh token 缓解）
- Token 体积比 session ID 大（可接受的开销）
- 需要安全存储 secret key

实现要点：
- Access token 过期时间：15 分钟
- Refresh token 过期时间：7 天
- 使用 RS256 算法签名

## Key Takeaways
- JWT 适合无状态 API 和微服务架构
- 短过期时间 + refresh token 是标准安全实践
- 需要配套实现 token 刷新和黑名单机制
