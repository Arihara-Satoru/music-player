# 酷狗音乐播放器

一个基于Vue3和Electron构建的现代桌面音乐播放器应用，集成了酷狗音乐API。

## 功能特性

- 基于Electron的桌面应用
- 使用Element Plus的现代化UI界面
- 音乐播放与管理功能
- 播放历史记录
- 音乐推荐功能

## 技术栈

- 前端框架: Vue 3 + Vite
- UI组件库: Element Plus
- 状态管理: Pinia
- API客户端: Axios
- 桌面端: Electron
- 构建工具: Electron Builder

## 环境要求

- Node.js (推荐v18+版本)
- pnpm (推荐) 或 npm

## 安装指南

```bash
# 安装依赖
pnpm install

# 或者使用npm
npm install
```

## 开发运行

```bash
# 启动前端开发服务器
pnpm dev

# 启动Electron开发模式
pnpm start:electron-dev
```

## 生产构建

```bash
# 构建前端
pnpm build:front

# 构建Electron应用
pnpm electron:build
```

## 项目结构

```
music-player/
├── electron/            # Electron主进程文件
├── KuGouMusicApi/       # 酷狗音乐API服务
├── public/              # 静态资源
├── src/                 # Vue应用源代码
│   ├── api/             # API服务
│   ├── assets/          # 资源文件
│   ├── components/      # Vue组件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia状态管理
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   ├── App.vue          # 主Vue组件
│   └── main.js          # Vue入口文件
├── .editorconfig        # 编辑器配置
├── .gitignore           # Git忽略规则
├── package.json         # 项目配置
├── README.md            # 本文件
└── vite.config.js       # Vite配置
```

## API服务

项目包含一个本地酷狗音乐API服务，位于`KuGouMusicApi`目录。该服务与Electron应用一起运行，提供音乐数据。

如需单独启动API服务：

```bash
cd KuGouMusicApi
npm install
npm start
```

## 开发命令

- `pnpm lint`: 运行ESLint检查
- `pnpm format`: 使用Prettier格式化代码
- `pnpm preview`: 预览生产环境构建

## 许可证

MIT协议
