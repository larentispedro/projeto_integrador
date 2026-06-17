-- TABELAS

-- id_paciente e id_profissional são referências externas (gerenciadas
-- por outros grupos do trabalho integrador), por isso não há FK aqui.

CREATE TABLE IF NOT EXISTS consulta_remota (
    id              SERIAL        PRIMARY KEY,
    id_paciente     VARCHAR(100)  NOT NULL,
    id_profissional VARCHAR(100)  NOT NULL,
    data_hora       TIMESTAMP     NOT NULL,
    canal           VARCHAR(20)   NOT NULL,
    motivo          VARCHAR(300)  NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'AGENDADA'
);

CREATE TABLE IF NOT EXISTS registro_clinico (
    id          SERIAL       PRIMARY KEY,
    id_consulta INTEGER      NOT NULL REFERENCES consulta_remota(id),
    diagnostico VARCHAR(500) NOT NULL,
    sintomas    VARCHAR(500),
    observacoes VARCHAR(500),
    orientacoes VARCHAR(500),
    finalizado  BOOLEAN
);

-- Terceira tabela: histórico de mudanças de status (alimentada pela Trigger)
CREATE TABLE IF NOT EXISTS log_status_consulta (
    id              SERIAL      PRIMARY KEY,
    consulta_id     INTEGER     NOT NULL REFERENCES consulta_remota(id),
    status_anterior VARCHAR(20),
    status_novo     VARCHAR(20) NOT NULL,
    alterado_em     TIMESTAMP   DEFAULT NOW()
);


-- ============================================================
-- STORED PROCEDURE — sp_atualizar_status
-- Valida se a consulta pode ter o status alterado e faz o UPDATE.
-- Usada pelo endpoint PATCH /api/telemedicina/consultas/:id/status.
-- ============================================================

CREATE OR REPLACE FUNCTION sp_atualizar_status(id_consulta INTEGER, novo_status VARCHAR)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    status_atual VARCHAR(20);
BEGIN
    SELECT status INTO status_atual
    FROM consulta_remota
    WHERE consulta_remota.id = id_consulta;

    IF status_atual = 'FINALIZADA' THEN
        RAISE EXCEPTION 'Consulta já finalizada, não pode ser alterada';
    END IF;

    IF status_atual = 'CANCELADA' THEN
        RAISE EXCEPTION 'Consulta cancelada, não pode ser alterada';
    END IF;

    UPDATE consulta_remota
    SET status = novo_status
    WHERE id = id_consulta;
END;
$$;


-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: bloqueia edição do registro clínico após finalizado = TRUE
-- Dispara antes de qualquer UPDATE em registro_clinico.
CREATE OR REPLACE FUNCTION fn_bloquear_edicao()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.finalizado = TRUE THEN
        RAISE EXCEPTION 'Essa operação já foi finalizada e não pode ser editada';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bloquear_edicao ON registro_clinico;
CREATE TRIGGER bloquear_edicao
    BEFORE UPDATE ON registro_clinico
    FOR EACH ROW
    EXECUTE FUNCTION fn_bloquear_edicao();

-- Trigger 2: registra automaticamente toda mudança de status em consulta_remota.
-- Dispara após UPDATE e alimenta a tabela log_status_consulta.
CREATE OR REPLACE FUNCTION fn_log_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO log_status_consulta (consulta_id, status_anterior, status_novo)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_status ON consulta_remota;
CREATE TRIGGER trg_log_status
    AFTER UPDATE ON consulta_remota
    FOR EACH ROW
    EXECUTE FUNCTION fn_log_status();


-- ============================================================
-- VIEW — vw_consultas_detalhadas
-- Usada pelo endpoint GET /api/telemedicina/relatorio.
-- ============================================================

CREATE OR REPLACE VIEW vw_consultas_detalhadas AS
SELECT
    c.id                AS consulta_id,
    c.id_paciente       AS paciente_id,
    c.id_profissional   AS profissional_id,
    c.data_hora,
    c.canal,
    c.motivo,
    c.status,
    r.diagnostico,
    r.sintomas,
    r.finalizado
FROM consulta_remota c
LEFT JOIN registro_clinico r ON r.id_consulta = c.id;