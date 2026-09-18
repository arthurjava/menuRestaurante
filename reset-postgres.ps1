# Stop PostgreSQL service
Stop-Service -Name postgresql-x64-16 -Force

# Backup original pg_hba.conf
Copy-Item "C:\Program Files\PostgreSQL\16\data\pg_hba.conf" "C:\Program Files\PostgreSQL\16\data\pg_hba.conf.bak"

# Modify pg_hba.conf to use trust authentication
$content = Get-Content "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
$content = $content -replace 'local\s+all\s+all\s+scram-sha-256', 'local   all             all                                     trust'
$content = $content -replace 'host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256', 'host    all             all             127.0.0.1/32            trust'
$content = $content -replace 'host\s+all\s+all\s+::1/128\s+scram-sha-256', 'host    all             all             ::1/128                 trust'
Set-Content "C:\Program Files\PostgreSQL\16\data\pg_hba.conf" -Value $content

# Start PostgreSQL service
Start-Service -Name postgresql-x64-16

# Wait for service to start
Start-Sleep -Seconds 5

# Create database and user
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h 127.0.0.1 -d postgres -c "CREATE DATABASE restaurante; CREATE USER restaurante WITH PASSWORD 'restaurante123'; GRANT ALL PRIVILEGES ON DATABASE restaurante TO restaurante; ALTER USER restaurante CREATEDB;"

# Restore pg_hba.conf
Copy-Item "C:\Program Files\PostgreSQL\16\data\pg_hba.conf.bak" "C:\Program Files\PostgreSQL\16\data\pg_hba.conf" -Force

# Reload PostgreSQL configuration
& "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" reload -D "C:\Program Files\PostgreSQL\16\data"