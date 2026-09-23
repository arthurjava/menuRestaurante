-- Atualizar senha do admin com hash BCrypt válido para "admin123"
UPDATE users SET password = '$2a$10$7HsKKAHMqeOMzEgvNtE1luYue.I5PmdmZS62yncgO7e1VviRHRa4K' WHERE email = 'admin@restaurante.com';