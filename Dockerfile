# 使用指定版本官方 Node.js 镜像
FROM node:22.4.1-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN yarn install

# 复制所有文件
COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 构建应用
RUN yarn run build

# 暴露应用端口
EXPOSE 51003

# 启动应用
CMD ["yarn", "run", "start:prod"]
