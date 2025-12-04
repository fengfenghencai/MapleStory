"""
配置项集中管理
"""

import os
from dotenv import load_dotenv
# 加载环境变量
load_dotenv()

# GitHub 配置
GITHUB_USERNAME = os.getenv('GITHUB_USERNAME', 'fengfenghencai')  # GitHub用户名
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')  # 可选：GitHub Token（提高API限额）

# 同步配置
FETCH_INTERVAL_HOURS = 1  # 定时同步间隔（小时）

# 数据库配置
DATABASE_URL = "sqlite+aiosqlite:///./data/github_data.db"  # SQLite数据库路径

# GitHub API 地址
GITHUB_REST_API = "https://api.github.com"
