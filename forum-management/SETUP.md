# 快速安装和启动指南

## 1. 安装依赖

项目新增了 `axios` 依赖,需要先安装:

```bash
npm install axios
```

或者重新安装所有依赖:

```bash
npm install
```

## 2. 启动项目

```bash
npm run dev
```

项目将在 `http://localhost:5173` 启动 (默认端口)

## 3. 配置说明

### API 地址配置

如果需要修改 API 地址,请编辑 `src/utils/request.js`:

```javascript
const request = axios.create({
  baseURL: 'http://10.129.114.106:8000',  // 修改这里
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 模拟登录凭证

当前使用的模拟登录凭证在 `src/utils/request.js` 中:

```javascript
const GW_SESSION = 'appid=500883957,name=张三,depatment=人力资源部,orgId=2,jobTitle=管理员,gender=2,status=1,jobNo=staff001'
```

## 4. 跨域配置 (如需要)

如果遇到跨域问题,可以在 `vite.config.js` 中添加代理配置:

```javascript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://10.129.114.106:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

然后修改 `src/utils/request.js` 中的 baseURL 为 `/api` 即可。

## 5. 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录。

## 6. 预览生产构建

```bash
npm run preview
```

## 常见问题

### Q: 提示找不到 axios?
A: 运行 `npm install axios` 安装依赖

### Q: API 请求失败?
A: 
1. 检查后端服务是否启动
2. 检查 baseURL 配置是否正确
3. 检查是否有跨域问题

### Q: 看不到数据?
A: 
1. 打开浏览器开发者工具查看 Network 面板
2. 查看 API 请求是否成功
3. 查看 Console 是否有错误日志

## 项目结构

```
forum-management/
├── src/
│   ├── api/              # API 服务模块
│   │   ├── dashboard.js
│   │   ├── content.js
│   │   ├── topics.js
│   │   ├── users.js
│   │   ├── points.js
│   │   ├── department.js
│   │   ├── logs.js
│   │   └── index.js
│   ├── utils/            # 工具模块
│   │   └── request.js    # axios 请求封装
│   ├── views/            # 页面组件
│   │   ├── Dashboard.vue
│   │   ├── Content.vue
│   │   ├── Topics.vue
│   │   ├── Users.vue
│   │   └── Points.vue
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   └── main.js           # 入口文件
├── docs/                 # 文档
│   └── API_DOCUMENTATION.md
├── API_INTEGRATION.md    # API 集成说明
└── SETUP.md             # 本文件
```

## 更多信息

详细的 API 集成说明请查看 `API_INTEGRATION.md`


