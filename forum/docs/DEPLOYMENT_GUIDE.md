# 部署指南

本文档说明如何在生产环境部署论坛前端（`forum/`）与管理后台（`forum-management/`）两套应用，分别提供 **Docker 部署** 与 **非 Docker 部署** 两种方式。请根据自身环境与运维策略选择适合的方案。

---

## 项目概览

- 论坛前端：`forum/`，基于 Vue 3 + TypeScript + Vite。
- 管理后台：`forum-management/`，基于 Vue 3 + Vite。
- 默认通过 Nginx 服务静态资源，并将 `/api/` 代理到后端服务（需替换为实际后端地址）。

部署前建议将整个仓库同步到服务器目录（示例路径：`/opt/forum_code`）。

---

## Docker 部署

### 环境要求

- Linux 服务器（Ubuntu 20.04+/CentOS 7+ 或同等级发行版）。
- Docker 24.x+。
- Docker Compose v2（可通过 `docker compose` 子命令调用）。
- 开放端口：`8081`（管理后台）、`8082`（论坛前端），以及 `80/443`（如启用反向代理）。

### 基于 `docker-compose.yml` 的一键部署（推荐）

1. 登录服务器，进入代码目录：
   ```bash
   cd /opt/forum_code
   ```
2. 构建并启动：
   ```bash
   docker compose build
   docker compose up -d
   ```
   若已推送预构建镜像，可使用 `docker compose pull` 拉取后再 `up -d`。
3. 验证状态：
   ```bash
   docker compose ps
   docker compose logs -f forum        # 论坛前端日志
   docker compose logs -f forum-management  # 管理后台日志
   ```
4. 访问：
   - 论坛前端：http://<服务器IP>:8082
   - 管理后台：http://<服务器IP>:8081

### 使用自动部署脚本

仓库根目录提供 `deploy.sh`，可在本地通过 SSH + rsync 同步代码并远程执行 Docker Compose：

```bash
./deploy.sh 服务器IP [用户名]
```

脚本主要流程：
- 使用 `.rsyncignore` 排除无关文件。
- 停止旧容器 → 重新构建镜像 → 后台启动容器。
- 输出访问地址与日志查看命令。

可按需修改脚本中的服务器路径、端口或自定义操作。

### 单服务容器部署（按需）

若仅部署某个前端，可单独构建并运行：

```bash
# 论坛前端
cd forum
docker build -t forum-frontend .
docker run -d --name forum-frontend -p 8082:80 forum-frontend

# 管理后台
cd ../forum-management
docker build -t forum-management-frontend .
docker run -d --name forum-management-frontend -p 8081:80 forum-management-frontend
```

需要自定义 Nginx 配置时，可在对应目录修改 `nginx.conf` 后再构建镜像。

### 日常运维

- 查看容器日志：`docker compose logs -f forum` / `forum-management`
- 更新代码后重启：
  ```bash
  git pull
  docker compose build
  docker compose up -d
  ```
- 停止服务：`docker compose down`

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

## 验证与排查

部署完成后建议执行以下检查：

1. 浏览器访问对应域名或端口，确认页面加载正常。
2. 使用浏览器开发者工具检查接口调用是否转发到正确后端，并确认跨域设置无误。
3. 查看容器或 Nginx 日志，确保无报错。
4. 测试登录、发帖、上传等核心流程，确认静态资源与接口均可用。

若遇到问题，可重点检查：

- Docker 容器状态与日志。
- Nginx 反向代理目标地址、端口是否正确。
- 后端服务是否允许特定来源或使用正确的 Header。
- 防火墙或安全组端口放行情况。

---

## 后续优化建议

- 接入 CI/CD 流程，实现自动构建与发布。
- 使用外部对象存储或 CDN 托管静态资源，以提升加载速度。
- 为 Nginx 添加访问控制、安全头、自定义缓存策略等。
- 配置 HTTPS 并启用 HTTP/2。
- 结合监控系统（如 Prometheus + Grafana）及时发现异常。

---

如需进一步自定义部署流程，可在此文档基础上补充企业内网或多环境（测试/预发/生产）差异化配置。


