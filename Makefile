# ============================================
# Alert City Makefile
# ============================================
.PHONY: help build up down restart deploy logs logs-api logs-db status clean redeploy shell-api shell-db
.PHONY: start stop ps db-shell db-backup db-restore db-status
.PHONY: stop-api stop-db start-api start-db restart-api restart-db build-api

# ===== 配置变量 =====
PROJECT_NAME=alertcity
COMPOSE_FILE=docker-compose.alertcity.yml
ENV_FILE=.env.production

# ✅ 从 .env.production 读取配置
include $(ENV_FILE)
export

# ===== 应用部署命令 =====

# 构建所有服务
build:
	@echo "🔨 构建 Alert City 镜像..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) build
	@echo "✅ 构建完成"

# 构建 API 服务
build-api:
	@echo "🔨 构建 API 镜像..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) build api
	@echo "✅ API 构建完成"

# 启动所有服务
up:
	@echo "🚀 启动 Alert City 服务..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d
	@echo "✅ 服务启动完成"
	@$(MAKE) status

# 停止所有服务
down:
	@echo "🛑 停止 Alert City 服务..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down
	@echo "✅ 服务已停止"

# 重启所有服务
restart: down up

# 完整部署（构建并启动）
deploy: build up
	@echo ""
	@echo "✅ Alert City 部署成功！"
	@echo "📊 API 地址: http://localhost:$(PORT)/graphql"
	@echo "🗄️  MongoDB: mongodb://localhost:27017"
	@echo ""
	@echo "查看日志: make logs"
	@echo "查看状态: make status"

# 重新构建并部署
redeploy: clean deploy

# ===== 单独服务控制 =====

# 启动 API
start-api:
	@echo "🚀 启动 API 服务..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d api

# 停止 API
stop-api:
	@echo "🛑 停止 API 服务..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop api

# 重启 API
restart-api: stop-api start-api
	@echo "✅ API 服务已重启"

# 启动 MongoDB
start-db:
	@echo "🚀 启动 MongoDB 服务..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d mongodb

# 停止 MongoDB
stop-db:
	@echo "🛑 停止 MongoDB 服务..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop mongodb

# 重启 MongoDB
restart-db: stop-db start-db
	@echo "✅ MongoDB 服务已重启"

# ===== 日志查看 =====

# 查看所有日志
logs:
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f

# 查看 API 日志
logs-api:
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f api

# 查看 MongoDB 日志
logs-db:
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f mongodb

# ===== 状态和管理 =====

# 查看服务状态
status:
	@echo "📊 Alert City 服务状态:"
	@echo ""
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "容器详情:"
	@docker ps --filter "name=alertcity-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 进入 API 容器
shell-api:
	@echo "🔧 进入 API 容器..."
	docker exec -it alertcity-api sh

# 进入 MongoDB 容器
shell-db:
	@echo "🗄️  进入 MongoDB 容器..."
	docker exec -it alertcity-mongodb bash

# 进入 MongoDB Shell
db-shell:
	@echo "💾 连接到 MongoDB..."
	docker exec -it alertcity-mongodb mongosh -u $(MONGO_ROOT_USER) -p $(MONGO_ROOT_PASSWORD) --authenticationDatabase admin $(MONGO_DATABASE)

# ===== 数据库管理 =====

# 备份数据库
db-backup:
	@echo "📦 备份 MongoDB 数据库..."
	@mkdir -p ./backups
	docker exec alertcity-mongodb mongodump \
		-u $(MONGO_ROOT_USER) \
		-p $(MONGO_ROOT_PASSWORD) \
		--authenticationDatabase admin \
		--db $(MONGO_DATABASE) \
		--out /tmp/backup
	docker cp alertcity-mongodb:/tmp/backup ./backups/backup-$(shell date +%Y%m%d-%H%M%S)
	@echo "✅ 备份完成: ./backups/"
	@ls -lh ./backups/ | tail -1

# 恢复数据库
# 用法: make db-restore BACKUP=./backups/backup-20250127-120000
db-restore:
	@if [ -z "$(BACKUP)" ]; then \
		echo "❌ 错误: 请指定备份目录"; \
		echo "用法: make db-restore BACKUP=./backups/backup-xxx"; \
		exit 1; \
	fi
	@if [ ! -d "$(BACKUP)" ]; then \
		echo "❌ 错误: 备份目录不存在: $(BACKUP)"; \
		exit 1; \
	fi
	@echo "⚠️  警告: 即将恢复备份，当前数据将被覆盖！"
	@echo "按 Ctrl+C 取消，或按 Enter 继续..."
	@read confirm
	@echo "🔄 恢复备份..."
	docker cp $(BACKUP) alertcity-mongodb:/tmp/restore
	docker exec alertcity-mongodb mongorestore \
		-u $(MONGO_ROOT_USER) \
		-p $(MONGO_ROOT_PASSWORD) \
		--authenticationDatabase admin \
		--db $(MONGO_DATABASE) \
		--drop \
		/tmp/restore/$(MONGO_DATABASE)
	@echo "✅ 备份恢复完成"

# 查看数据库状态
db-status:
	@echo "📊 MongoDB 数据库状态:"
	@echo ""
	@echo "数据库列表:"
	@docker exec alertcity-mongodb mongosh \
		-u $(MONGO_ROOT_USER) \
		-p $(MONGO_ROOT_PASSWORD) \
		--authenticationDatabase admin \
		--quiet \
		--eval "db.adminCommand('listDatabases')"
	@echo ""
	@echo "$(MONGO_DATABASE) 集合:"
	@docker exec alertcity-mongodb mongosh \
		-u $(MONGO_ROOT_USER) \
		-p $(MONGO_ROOT_PASSWORD) \
		--authenticationDatabase admin \
		--quiet \
		$(MONGO_DATABASE) \
		--eval "db.getCollectionNames()"
	@echo ""
	@echo "统计信息:"
	@docker exec alertcity-mongodb mongosh \
		-u $(MONGO_ROOT_USER) \
		-p $(MONGO_ROOT_PASSWORD) \
		--authenticationDatabase admin \
		--quiet \
		$(MONGO_DATABASE) \
		--eval "db.stats()"

# ===== 清理和维护 =====

# 清理所有服务
clean:
	@echo "🗑️  清理 Alert City 服务..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down -v
	docker rmi alertcity-api:latest 2>/dev/null || true
	@echo "✅ 清理完成"

# 清理日志
clean-logs:
	@echo "🗑️  清理日志文件..."
	rm -rf ./logs/*
	@echo "✅ 日志已清理"

# ===== 开发相关 =====

# 查看容器日志（最后 100 行）
tail:
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs --tail=100

# 重新加载配置（不重启）
reload:
	@echo "🔄 重新加载配置..."
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) kill -s SIGHUP api
	@echo "✅ 配置已重新加载"

# 健康检查
health:
	@echo "🏥 检查服务健康状态..."
	@echo ""
	@echo "API 健康检查:"
	@curl -f http://localhost:$(PORT)/graphql || echo "❌ API 不可用"
	@echo ""
	@echo ""
	@echo "MongoDB 健康检查:"
	@docker exec alertcity-mongodb mongosh \
		-u $(MONGO_ROOT_USER) \
		-p $(MONGO_ROOT_PASSWORD) \
		--authenticationDatabase admin \
		--quiet \
		--eval "db.adminCommand('ping')" || echo "❌ MongoDB 不可用"

# ===== 帮助信息 =====

help:
	@echo "Alert City 部署命令:"
	@echo ""
	@echo "🚀 应用部署:"
	@echo "  make deploy              - 构建并部署所有服务"
	@echo "  make build               - 只构建镜像"
	@echo "  make up                  - 只启动服务"
	@echo "  make down                - 停止所有服务"
	@echo "  make restart             - 重启所有服务"
	@echo "  make redeploy            - 清理并重新部署"
	@echo ""
	@echo "🔧 单独服务控制:"
	@echo "  make start-api           - 启动 API 服务"
	@echo "  make stop-api            - 停止 API 服务"
	@echo "  make restart-api         - 重启 API 服务"
	@echo "  make start-db            - 启动 MongoDB 服务"
	@echo "  make stop-db             - 停止 MongoDB 服务"
	@echo "  make restart-db          - 重启 MongoDB 服务"
	@echo ""
	@echo "📋 日志查看:"
	@echo "  make logs                - 查看所有服务日志"
	@echo "  make logs-api            - 查看 API 日志"
	@echo "  make logs-db             - 查看 MongoDB 日志"
	@echo "  make tail                - 查看最后 100 行日志"
	@echo ""
	@echo "📊 状态和管理:"
	@echo "  make status              - 查看服务状态"
	@echo "  make health              - 健康检查"
	@echo "  make shell-api           - 进入 API 容器"
	@echo "  make shell-db            - 进入 MongoDB 容器"
	@echo "  make db-shell            - 连接 MongoDB Shell"
	@echo ""
	@echo "💾 数据库管理:"
	@echo "  make db-backup           - 备份数据库"
	@echo "  make db-restore BACKUP=xxx - 恢复数据库"
	@echo "  make db-status           - 查看数据库状态"
	@echo ""
	@echo "🗑️  清理:"
	@echo "  make clean               - 清理所有服务和镜像"
	@echo "  make clean-logs          - 清理日志文件"
	@echo ""
	@echo "📝 完整部署流程:"
	@echo "  1. 首次部署:"
	@echo "     make deploy"
	@echo ""
	@echo "  2. 后续更新:"
	@echo "     make redeploy"
	@echo ""
	@echo "  3. 仅更新 API:"
	@echo "     make build-api"
	@echo "     make restart-api"

# 默认目标
.DEFAULT_GOAL := help

# ===== 快捷命令别名 =====
start: up
stop: down
log: logs
ps: status