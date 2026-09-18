# Stop PostgreSQL service
Stop-Service -Name postgresql-x64-16 -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Create new pg_hba.conf with trust authentication
$newContent = @"
# PostgreSQL Client Authentication Configuration File
# ===================================================
#
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
"@

Set-Content -Path "C:\Program Files\PostgreSQL\16\data\pg_hba.conf" -Value $newContent -Encoding UTF8

# Start PostgreSQL service
Start-Service -Name postgresql-x64-16
Start-Sleep -Seconds 5

# Create database and user
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h 127.0.0.1 -d postgres -c "CREATE DATABASE restaurante; CREATE USER restaurante WITH PASSWORD 'restaurante123'; GRANT ALL PRIVILEGES ON DATABASE restaurante TO restaurante; ALTER USER restaurante CREATEDB;"

# Restore original pg_hba.conf
$originalContent = @"
# PostgreSQL Client Authentication Configuration File
# ===================================================
#
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     scram-sha-256
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     scram-sha-256
host    replication     all             127.0.0.1/32            scram-sha-256
host    replication     all             ::1/128                 scram-sha-256
"@

Set-Content -Path "C:\Program Files\PostgreSQL\16\data\pg_hba.conf" -Value $originalContent -Encoding UTF8

# Reload PostgreSQL configuration
& "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" reload -D "C:\Program Files\PostgreSQL\16\data"