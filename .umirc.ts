import { defineConfig } from 'umi'

export default defineConfig({
  title: 'SVG 路径生成器',
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  fastRefresh: {},
  theme: {
    'primary-color': '#2b579b',
  },
  mfsu: {},
  publicPath: './',
})
