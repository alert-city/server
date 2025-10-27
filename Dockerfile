# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# 复制 package 文件
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 清理 devDependencies
RUN yarn install --production --frozen-lockfile

# ============================================
# Production stage
# ============================================
FROM node:20-alpine AS production
WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 从 build 阶段复制必要文件
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置文件权限
RUN chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=65005

# 暴露端口
EXPOSE 65005

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:65005/graphql || exit 1

# 启动应用
CMD ["node", "dist/main.js"]