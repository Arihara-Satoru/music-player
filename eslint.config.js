import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ElMessage: 'readonly',
        ElNotification: 'readonly',
        ElLoading: 'readonly',
        ElMessageBox: true,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,

  // 新增规则：限制连续空行
  {
    rules: {
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1, // 允许的最大连续空行数
          maxEOF: 0, // 文件末尾不允许有空行
          maxBOF: 0, // 文件开头不允许有空行（可选）
        },
      ],
    },
  },
  // 为 KuGouMusicApi 目录下的 JS 文件添加 Node.js 环境配置
  {
    files: ['KuGouMusicApi/**/*.js'], // 针对 KuGouMusicApi 目录下的所有 JS 文件
    languageOptions: {
      globals: {
        ...globals.node, // 启用 Node.js 全局变量
      },
    },
    rules: {
      // 如果需要，可以在这里添加 Node.js 特有的规则
      // 例如，允许使用 require 和 module.exports
      'no-undef': 'off', // 关闭对未定义变量的检查，因为 Node.js 全局变量可能被 ESLint 误报
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 允许未使用的变量以 _ 开头
    },
  },
])
