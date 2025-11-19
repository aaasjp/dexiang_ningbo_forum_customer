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