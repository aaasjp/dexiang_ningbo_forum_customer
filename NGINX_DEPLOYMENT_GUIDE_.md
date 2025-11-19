# 部署指南

本文档说明如何在生产环境部署论坛前端（`forum/`）与管理后台（`forum-management/`）两套应用，分别提供 **Docker 部署** 与 **非 Docker 部署** 两种方式。请根据自身环境与运维策略选择适合的方案。

---

## 项目概览

- 论坛前端：`forum/`，基于 Vue 3 + TypeScript + Vite。
- 管理后台：`forum-management/`，基于 Vue 3 + Vite。
- 默认通过 Nginx 服务静态资源，并将 `/api/` 代理到后端服务（需替换为实际后端地址）。

部署前建议将整个仓库同步到服务器目录（示例路径：`/opt/forum_code`）。

---

## 非 Docker 部署

### 环境要求

- Linux 服务器。
- Node.js 20.x 与 npm（或 pnpm/yarn）。
- Nginx 1.20+（或其他反向代理服务器）。

### 构建流程

两套前端需分别构建：

```bash
# 论坛前端
cd /opt/forum_code/forum
npm install
npm run build    # 产物位于 dist/

# 管理后台
cd /opt/forum_code/forum-management
npm install
npm run build    # 产物位于 dist/
```

将 `dist/` 目录部署到 Nginx 的站点根目录（示例：`/var/www/forum`、`/var/www/forum-admin`）。

### Nginx 配置示例

以下以单个站点配置示例（请为两个站点分别创建 server 块，并替换 `server_name` 与 `proxy_pass`）：

```1:58:forum/nginx.conf
server {
    listen 80;
    server_name forum.example.com;
    underscores_in_headers on;
    client_max_body_size 20M;

    root /var/www/forum;   # 替换为实际 dist 路径
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://your-backend-host:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass_request_headers on;
        proxy_set_header gw_session $http_gw_session;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    error_page 404 /index.html;
}
```

如需 HTTPS，将 `listen 443 ssl;`、`ssl_certificate`、`ssl_certificate_key` 等字段加入 server 块，并确保证书有效。

修改配置后执行：

```bash
sudo nginx -t        # 检查语法
sudo systemctl reload nginx
```

### 非 Docker 部署的日常运维

- 更新代码并重新打包：
  ```bash
  cd /opt/forum_code/forum
  git pull
  npm install
  npm run build
  sudo rsync -av dist/ /var/www/forum/
  ```
  管理后台同理。
- 查看 Nginx 日志：`/var/log/nginx/access.log`、`/var/log/nginx/error.log`。
- 配合 PM2/系统服务可进一步守护后端接口（若需要）。

---

