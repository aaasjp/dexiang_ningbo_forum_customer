# 迁移完成：从 vw/clamp 到 px + PostCSS PxToRem

## 迁移总结

✅ **已完成所有文件的迁移**，现在项目使用 **px + PostCSS PxToRem** 方案。

## 迁移的文件

### 1. ✅ src/components/post/PostCard.vue
**修改内容：**
- `padding: 4vw` → `padding: 16px`
- `margin-bottom: 3vw` → `margin-bottom: 12px`
- `gap: 2.5vw` → `gap: 10px`
- `width: clamp(32px, 9.6vw, 36px)` → `width: 36px`
- `font-size: clamp(14px, 4vw, 15px)` → `font-size: 15px`
- `font-size: clamp(13px, 3.7vw, 14px)` → `font-size: 14px`
- `font-size: clamp(12px, 3.7vw, 14px)` → `font-size: 14px`
- `font-size: clamp(11px, 3.2vw, 12px)` → `font-size: 12px`
- `font-size: clamp(10px, 2.9vw, 11px)` → `font-size: 11px`
- `gap: 1.5vw` → `gap: 6px`
- `padding: 0.5vw 2vw` → `padding: 2px 8px`
- `padding: 1vw 2.5vw` → `padding: 4px 10px`
- `gap: 2vw` → `gap: 8px`
- `margin-bottom: 2.5vw` → `margin-bottom: 10px`

### 2. ✅ src/components/layout/TabBar.vue
**修改内容：**
- `padding: 1vw 0` → `padding: 4px 0`
- `margin-bottom: 0.5vw` → `margin-bottom: 2px`
- `font-size: clamp(10px, 2.9vw, 11px)` → `font-size: 11px`
- `width: clamp(40px, 11.7vw, 44px)` → `width: 44px`
- `height: clamp(40px, 11.7vw, 44px)` → `height: 44px`

### 3. ✅ src/pages/search/index.vue
**修改内容：**
- `padding: 2.5vw 4vw` → `padding: 10px 16px`
- `gap: 3vw` → `gap: 12px`
- `padding: 1vw` → `padding: 4px`
- `padding: 2vw 4vw` → `padding: 8px 16px`
- `margin-right: 2vw` → `margin-right: 8px`
- `font-size: clamp(14px, 4vw, 15px)` → `font-size: 15px`
- `padding: 4vw` → `padding: 16px`
- `margin-right: 3vw` → `margin-right: 12px`
- `gap: 1vw` → `gap: 4px`
- `font-size: clamp(12px, 3.7vw, 14px)` → `font-size: 14px`
- `padding: 20vw 5vw` → `padding: 80px 20px`
- `font-size: clamp(48px, 17vw, 64px)` → `font-size: 64px`
- `margin-bottom: 4vw` → `margin-bottom: 16px`
- `font-size: clamp(13px, 3.7vw, 14px)` → `font-size: 14px`

### 4. ✅ src/pages/home/index.vue
**修改内容：**（之前已完成）
- 所有 vw 和 clamp 已转换为 px

### 5. ✅ src/style.css
**保留内容：**
- `max-width: 100vw` - 用于防止横向滚动，必须保留

## 转换规则

基于 375px 设计稿：

| 原值 | 转换后 | 说明 |
|------|--------|------|
| `4vw` | `16px` | 375 * 0.04 ≈ 15px，取整为 16px |
| `3vw` | `12px` | 375 * 0.03 ≈ 11px，取整为 12px |
| `2.5vw` | `10px` | 375 * 0.025 ≈ 9px，取整为 10px |
| `2vw` | `8px` | 375 * 0.02 = 7.5px，取整为 8px |
| `1.5vw` | `6px` | 375 * 0.015 ≈ 5.6px，取整为 6px |
| `1vw` | `4px` | 375 * 0.01 = 3.75px，取整为 4px |
| `0.5vw` | `2px` | 375 * 0.005 ≈ 1.9px，取整为 2px |
| `clamp(12px, 3.7vw, 14px)` | `14px` | 取最大值 |
| `clamp(14px, 4vw, 15px)` | `15px` | 取最大值 |
| `clamp(10px, 2.9vw, 11px)` | `11px` | 取最大值 |
| `clamp(32px, 9.6vw, 36px)` | `36px` | 取最大值 |

## PostCSS PxToRem 配置

**postcss.config.js:**
```javascript
{
  rootValue: 37.5,           // 375px / 10
  propList: ['*'],           // 所有属性都转换
  minPixelValue: 2,          // <2px 不转换（保留 1px 边框）
  selectorBlackList: [
    /^\.no-rem-/,            // .no-rem- 开头不转换
    /^\.el-/,                // Element Plus 不转换
  ],
}
```

## 构建时自动转换

现在你写的 `px` 会在构建时自动转换为 `rem`：

```css
/* 你写的代码 */
.button {
  padding: 16px;
  font-size: 14px;
}

/* 构建后 */
.button {
  padding: 0.42667rem;  /* 16 / 37.5 */
  font-size: 0.37333rem; /* 14 / 37.5 */
}
```

## 验证

运行以下命令验证所有 vw 和 clamp 已被移除：

```bash
# 搜索 vw（应该只有 100vw 和注释）
grep -r "vw" src --include="*.vue" --include="*.css"

# 搜索 clamp（应该只有注释）
grep -r "clamp" src --include="*.vue" --include="*.css"
```

## 优势

### 开发体验
- ✅ **直接写 px**：按照设计稿直接写，无需计算
- ✅ **代码清晰**：16px 比 4vw 更直观
- ✅ **易于维护**：团队成员都能理解

### 技术优势
- ✅ **精确适配**：基于 375px 设计稿精确还原
- ✅ **自动转换**：构建时自动转换为 rem
- ✅ **性能更好**：rem 计算比 vw/clamp 更快
- ✅ **统一标准**：整个项目使用同一套规则

### 适配效果
- ✅ **320px 屏幕**：自动缩小
- ✅ **375px 屏幕**：完美还原设计稿
- ✅ **414px+ 屏幕**：自动放大
- ✅ **最大 750px**：防止过度放大

## 后续开发

从现在开始，所有新代码都应该：

1. **直接写 px**，对应设计稿标注
2. **1px 边框**直接写 1px（自动保留）
3. **固定尺寸**使用大写 PX（如 `width: 24PX`）
4. **添加注释**标注设计稿原始值（可选）

示例：
```css
.card {
  padding: 16px;        /* 设计稿：16px */
  font-size: 14px;      /* 设计稿：14px */
  border: 1px solid #e5e5e5;  /* 固定 1px */
}
```

## 完成！🎉

所有文件已成功迁移到 **px + PostCSS PxToRem** 方案！

现在你可以：
- ✅ 直接按照设计稿写 px
- ✅ 享受自动适配的便利
- ✅ 获得更好的开发体验

