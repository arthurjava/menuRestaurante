@echo off
cd D:\Projetos\restaurante\frontend
set NODE_ENV=development
set CHOKIDAR_USEPOLLING=true
call npm start -- --host 0.0.0.0 --poll 2000