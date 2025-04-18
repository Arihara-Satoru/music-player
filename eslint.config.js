import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { ElMessage } from 'element-plus'

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
        "ElMessage": true,
        "ElMessageBox": true
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,

  // 新增规则：限制连续空行
  {
    rules: {
      'no-multiple-empty-lines': ['error', {
        max: 1,            // 允许的最大连续空行数
        maxEOF: 0,         // 文件末尾不允许有空行
        maxBOF: 0          // 文件开头不允许有空行（可选）
      }]
    }
  },
])
