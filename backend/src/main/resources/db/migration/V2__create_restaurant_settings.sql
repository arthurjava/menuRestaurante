-- Tabela de configurações do restaurante
CREATE TABLE restaurant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações básicas
    name VARCHAR(100) NOT NULL,
    tagline VARCHAR(200),
    description TEXT,
    logo_url VARCHAR(500),
    cover_url VARCHAR(500),
    
    -- Horário de funcionamento (JSON)
    business_hours JSONB,
    
    -- Informações de contato
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(200),
    website VARCHAR(100),
    instagram VARCHAR(50),
    facebook VARCHAR(100),
    
    -- Auditoria
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração padrão
INSERT INTO restaurant_settings (name, tagline, description) VALUES 
('Meu Restaurante', 'O melhor da culinária', 'Descreva seu restaurante, história, especialidades...');

-- Índices
CREATE INDEX idx_restaurant_settings_updated_at ON restaurant_settings(updated_at);