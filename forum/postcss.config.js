export default {
  plugins: {
    'postcss-pxtorem': {
      // 根字体大小，与 rem.ts 中的 BASE_FONT_SIZE 保持一致
      rootValue: 37.5,
      
      // 需要转换的 CSS 属性，* 表示所有属性
      propList: ['*'],
      
      // 不需要转换的选择器（保留为 px）
      selectorBlackList: [
        // 以 .no-rem- 开头的类名不转换
        /^\.no-rem-/,
        // Element Plus 组件不转换
        /^\.el-/,
        // 某些第三方库
        /^\.van-/,
      ],
      
      // 替换规则
      replace: true,
      
      // 媒体查询中是否转换
      mediaQuery: false,
      
      // 最小转换像素值，小于这个值的不转换
      // 建议设置为 1，这样 1px 边框会保持为 1px（因为转换后约等于 0.027rem，会被忽略）
      minPixelValue: 2,
      
      // 排除的文件或文件夹
      exclude: /node_modules/i,
      
      // 单位精度
      unitPrecision: 5,
    },
  },
}

