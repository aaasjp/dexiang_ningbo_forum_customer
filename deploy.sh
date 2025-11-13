#!/bin/bash

# 论坛项目部署脚本
# 使用方法: ./deploy.sh 服务器IP [用户名]

set -e  # 遇到错误立即退出

# 配置
SERVER_IP=$1
SERVER_USER=${2:-root}
SERVER_PATH="/opt/forum_code"
LOCAL_PATH="/Users/songchiyu/Documents/forum_code"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}错误: 请提供服务器IP地址${NC}"
    echo "使用方法: $0 服务器IP [用户名]"
    echo "示例: $0 192.168.1.100 root"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}开始部署论坛项目${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "服务器: ${YELLOW}${SERVER_USER}@${SERVER_IP}${NC}"
echo -e "目标路径: ${YELLOW}${SERVER_PATH}${NC}"
echo ""

# 1. 同步代码到服务器
echo -e "${GREEN}[1/3] 正在上传代码到服务器...${NC}"
rsync -avz --progress \
  --exclude-from="${LOCAL_PATH}/.rsyncignore" \
  "${LOCAL_PATH}/" \
  "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 代码上传成功${NC}"
else
    echo -e "${RED}✗ 代码上传失败${NC}"
    exit 1
fi

# 2. 在服务器上重新构建
echo -e "\n${GREEN}[2/3] 正在服务器上构建 Docker 镜像...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" << 'EOF'
    cd /opt/forum_code
    echo "停止旧容器..."
    docker-compose down
    echo "构建新镜像..."
    docker-compose build
    echo "启动容器..."
    docker-compose up -d
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker 容器启动成功${NC}"
else
    echo -e "${RED}✗ Docker 构建/启动失败${NC}"
    exit 1
fi

# 3. 检查容器状态
echo -e "\n${GREEN}[3/3] 检查容器运行状态...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" << 'EOF'
    cd /opt/forum_code
    docker-compose ps
EOF

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "论坛前端: ${YELLOW}http://${SERVER_IP}:8082${NC}"
echo -e "管理后台: ${YELLOW}http://${SERVER_IP}:8081${NC}"
echo ""
echo -e "查看日志: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/forum_code && docker-compose logs -f'${NC}"

