#!/bin/bash

# 论坛项目 - 推送并远程部署脚本
# 使用方法: ./push_and_deploy.sh "提交说明" 服务器IP [用户名]

set -e

# 参数
COMMIT_MSG=${1:-"更新代码"}
SERVER_IP=$2
SERVER_USER=${3:-root}
SERVER_PATH="/opt/forum_code"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}错误: 请提供服务器IP地址${NC}"
    echo "使用方法: $0 '提交说明' 服务器IP [用户名]"
    echo "示例: $0 '添加用户管理功能' 192.168.1.100 root"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}论坛项目 - 推送并部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "提交说明: ${YELLOW}${COMMIT_MSG}${NC}"
echo -e "服务器: ${YELLOW}${SERVER_USER}@${SERVER_IP}${NC}"
echo ""

# 1. 本地推送到 GitHub
echo -e "${GREEN}[1/3] 推送代码到 GitHub...${NC}"
cd /Users/songchiyu/Documents/forum_code

git add .
git commit -m "${COMMIT_MSG}" || echo "没有需要提交的更改"
git push origin master

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 代码已推送到 GitHub${NC}"
else
    echo -e "${RED}✗ 推送失败${NC}"
    exit 1
fi

# 2. 服务器拉取代码
echo -e "\n${GREEN}[2/3] 服务器拉取最新代码...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" << 'ENDSSH'
    cd /opt/forum_code
    echo "拉取最新代码..."
    git pull origin master
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 服务器代码已更新${NC}"
else
    echo -e "${RED}✗ 拉取失败${NC}"
    exit 1
fi

# 3. 服务器重新构建和部署
echo -e "\n${GREEN}[3/3] 服务器重新构建和部署...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" << 'ENDSSH'
    cd /opt/forum_code
    echo "停止旧容器..."
    docker compose down
    echo "清理未使用的资源..."
    docker system prune -f
    echo "重新构建镜像..."
    docker compose build
    echo "启动新容器..."
    docker compose up -d
    echo "查看运行状态..."
    docker compose ps
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 部署成功${NC}"
else
    echo -e "${RED}✗ 部署失败${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "论坛前端: ${YELLOW}http://${SERVER_IP}:8082${NC}"
echo -e "管理后台: ${YELLOW}http://${SERVER_IP}:8081${NC}"
echo ""
echo -e "查看日志: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/forum_code && docker compose logs -f'${NC}"

