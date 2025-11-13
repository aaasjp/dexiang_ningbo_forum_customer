# Docker 部署指南

本文档说明如何在天翼云上使用 Docker 部署 forum 和 forum-management 两个 Vue 项目。

## 📁 文件说明

每个项目包含以下 Docker 相关文件：

- `Dockerfile` - Docker 镜像构建文件（多阶段构建）
- `nginx.conf` - Nginx 配置文件
- `.dockerignore` - Docker 构建时忽略的文件

## 🚀 部署方式

### 方式一：使用 Docker Compose（推荐）

在 `mywork` 目录下执行：

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

**访问地址：**
- 论坛前端：http://your-server-ip:8080
- 管理后台：http://your-server-ip:8081

### 方式二：单独构建和运行

#### 论坛前端（forum）

```bash
cd forum

# 构建镜像
docker build -t forum-frontend:latest .

# 运行容器
docker run -d \
  --name forum-frontend \
  -p 8080:80 \
  --restart unless-stopped \
  forum-frontend:latest

# 查看日志
docker logs -f forum-frontend
```

#### 管理后台（forum-management）

```bash
cd forum-management

# 构建镜像
docker build -t forum-management-frontend:latest .

# 运行容器
docker run -d \
  --name forum-management-frontend \
  -p 8081:80 \
  --restart unless-stopped \
  forum-management-frontend:latest

# 查看日志
docker logs -f forum-management-frontend
```

## ⚙️ Nginx 配置说明

每个项目的 `nginx.conf` 包含以下特性：

1. **SPA 路由支持** - 所有路由请求都返回 index.html
2. **Gzip 压缩** - 压缩文本类资源，减少传输大小
3. **静态资源缓存** - 图片、CSS、JS 等资源缓存 30 天
4. **API 代理** - 支持反向代理到后端服务
5. **安全头部** - 添加安全相关的 HTTP 头部

### 修改 API 代理地址

编辑对应项目的 `nginx.conf` 文件，修改以下部分：

```nginx
location /api/ {
    proxy_pass http://your-backend-server:8000;  # 修改为实际后端地址
    # ...
}
```

常见配置：
- 如果后端在同一服务器：`http://localhost:8000`
- 如果后端在容器中：`http://backend-container-name:8000`
- 如果后端在其他服务器：`http://192.168.1.100:8000`

## 🔧 常用 Docker 命令

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 停止容器
docker stop forum-frontend

# 启动容器
docker start forum-frontend

# 重启容器
docker restart forum-frontend

# 删除容器
docker rm forum-frontend

# 查看容器日志
docker logs -f forum-frontend

# 进入容器
docker exec -it forum-frontend sh

# 查看镜像
docker images

# 删除镜像
docker rmi forum-frontend:latest

# 清理未使用的资源
docker system prune -a
```

## 🌐 生产环境建议

### 1. 使用域名和 HTTPS

建议在天翼云配置域名并使用 HTTPS。可以使用以下方式：

#### 方式 A：使用 Nginx 作为反向代理

在服务器上安装 Nginx，配置 SSL 证书，然后代理到 Docker 容器：

```nginx
server {
    listen 443 ssl http2;
    server_name forum.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 方式 B：修改 Docker 配置支持 HTTPS

修改 `Dockerfile` 和 `nginx.conf` 添加 SSL 证书支持。

### 2. 环境变量配置

如果需要不同环境的配置，可以使用环境变量：

**修改 docker-compose.yml：**

```yaml
services:
  forum:
    environment:
      - API_BASE_URL=https://api.example.com
```

### 3. 持久化和备份

如果有需要持久化的数据，使用 Docker volumes：

```yaml
volumes:
  - ./logs:/var/log/nginx
```

### 4. 资源限制

限制容器资源使用：

```yaml
services:
  forum:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          memory: 256M
```

## 🔍 故障排查

### 容器无法启动

```bash
# 查看详细错误信息
docker logs forum-frontend

# 查看容器状态
docker inspect forum-frontend
```

### 网络连接问题

```bash
# 检查容器网络
docker network ls
docker network inspect bridge

# 测试容器内网络
docker exec -it forum-frontend ping backend-server
```

### 构建失败

```bash
# 清理缓存重新构建
docker build --no-cache -t forum-frontend:latest .
```

## 📝 更新部署

当代码更新后：

```bash
# 使用 docker-compose
docker-compose build
docker-compose up -d

# 或者手动
docker build -t forum-frontend:latest .
docker stop forum-frontend
docker rm forum-frontend
docker run -d --name forum-frontend -p 8080:80 forum-frontend:latest
```

## 🎯 多阶段构建优势

项目使用了 Docker 多阶段构建，具有以下优势：

1. **镜像体积小** - 只包含运行时需要的文件，不包含 node_modules 等构建依赖
2. **安全性高** - 生产镜像不包含源代码和开发工具
3. **构建高效** - 利用 Docker 缓存层加速构建
4. **性能优异** - Nginx 提供静态文件服务，性能优于 Node.js

最终镜像大小约为 40-50MB（Nginx Alpine + 构建产物）。

## 🆘 需要帮助？

遇到问题可以：
1. 查看容器日志：`docker logs -f <container-name>`
2. 进入容器检查：`docker exec -it <container-name> sh`
3. 检查 nginx 配置：`docker exec forum-frontend nginx -t`

