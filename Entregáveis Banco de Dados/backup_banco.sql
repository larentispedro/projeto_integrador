--
-- PostgreSQL database dump
--

\restrict tP9IB9lCbZNldbSTgW4iWoqYJE2KTfNuCPWl9BVRqiuIOUdGFzBLy4VwKeMHbOH

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-06-17 00:40:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 33627)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 238 (class 1255 OID 33679)
-- Name: fn_bloquear_edicao(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_bloquear_edicao() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.finalizado = TRUE THEN
        RAISE EXCEPTION 'Essa operação já foi finalizada e não pode ser editada';
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 239 (class 1255 OID 33681)
-- Name: fn_log_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_log_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO log_status_consulta (consulta_id, status_anterior, status_novo)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 237 (class 1255 OID 33678)
-- Name: sp_atualizar_status(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sp_atualizar_status(id_consulta integer, novo_status character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 33629)
-- Name: consulta_remota; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consulta_remota (
    id integer NOT NULL,
    id_paciente character varying(100) NOT NULL,
    id_profissional character varying(100) NOT NULL,
    data_hora timestamp without time zone NOT NULL,
    canal character varying(20) NOT NULL,
    motivo character varying(300) NOT NULL,
    status character varying(20) DEFAULT 'AGENDADA'::character varying NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 33628)
-- Name: consulta_remota_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.consulta_remota_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 219
-- Name: consulta_remota_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.consulta_remota_id_seq OWNED BY public.consulta_remota.id;


--
-- TOC entry 224 (class 1259 OID 33663)
-- Name: log_status_consulta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.log_status_consulta (
    id integer NOT NULL,
    consulta_id integer NOT NULL,
    status_anterior character varying(20),
    status_novo character varying(20) NOT NULL,
    alterado_em timestamp without time zone DEFAULT now()
);


--
-- TOC entry 223 (class 1259 OID 33662)
-- Name: log_status_consulta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.log_status_consulta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 223
-- Name: log_status_consulta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.log_status_consulta_id_seq OWNED BY public.log_status_consulta.id;


--
-- TOC entry 222 (class 1259 OID 33646)
-- Name: registro_clinico; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registro_clinico (
    id integer NOT NULL,
    id_consulta integer NOT NULL,
    diagnostico character varying(500) NOT NULL,
    sintomas character varying(500),
    observacoes character varying(500),
    orientacoes character varying(500),
    finalizado boolean
);


--
-- TOC entry 221 (class 1259 OID 33645)
-- Name: registro_clinico_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registro_clinico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 221
-- Name: registro_clinico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registro_clinico_id_seq OWNED BY public.registro_clinico.id;


--
-- TOC entry 225 (class 1259 OID 33683)
-- Name: vw_consultas_detalhadas; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_consultas_detalhadas AS
 SELECT c.id AS consulta_id,
    c.id_paciente AS paciente_id,
    c.id_profissional AS profissional_id,
    c.data_hora,
    c.canal,
    c.motivo,
    c.status,
    r.diagnostico,
    r.sintomas,
    r.finalizado
   FROM (public.consulta_remota c
     LEFT JOIN public.registro_clinico r ON ((r.id_consulta = c.id)));


--
-- TOC entry 4873 (class 2604 OID 33632)
-- Name: consulta_remota id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consulta_remota ALTER COLUMN id SET DEFAULT nextval('public.consulta_remota_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 33666)
-- Name: log_status_consulta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log_status_consulta ALTER COLUMN id SET DEFAULT nextval('public.log_status_consulta_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 33649)
-- Name: registro_clinico id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_clinico ALTER COLUMN id SET DEFAULT nextval('public.registro_clinico_id_seq'::regclass);


--
-- TOC entry 5037 (class 0 OID 33629)
-- Dependencies: 220
-- Data for Name: consulta_remota; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.consulta_remota (id, id_paciente, id_profissional, data_hora, canal, motivo, status) FROM stdin;
2	3	2	2026-06-12 14:30:00	audio	Avaliacao de quadro gripal	AGENDADA
1	15	1	2026-06-10 09:00:00	video	Acompanhamento cardiologico de rotina	FINALIZADA
4	15	2	2026-06-14 16:00:00	video	Retorno para discussao de exames	CANCELADA
5	5	3	2026-06-09 11:00:00	video	Consulta nutricional	FINALIZADA
3	7	1	2026-06-13 10:15:00	chat	Renovacao de receita de uso continuo	FINALIZADA
6	1	10	2026-06-10 09:00:00	video	Dor de cabeça persistente	AGENDADA
7	2	10	2026-06-10 10:30:00	audio	Retorno de exame	EM_ANDAMENTO
8	3	11	2026-06-09 14:00:00	video	Avaliação de pressão alta	FINALIZADA
9	1	12	2026-06-08 16:00:00	chat	Orientação nutricional	FINALIZADA
10	2	11	2026-06-11 11:00:00	video	Consulta cancelada	CANCELADA
\.


--
-- TOC entry 5041 (class 0 OID 33663)
-- Dependencies: 224
-- Data for Name: log_status_consulta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.log_status_consulta (id, consulta_id, status_anterior, status_novo, alterado_em) FROM stdin;
1	1	AGENDADA	EM_ANDAMENTO	2026-06-15 20:18:31.910484
2	1	EM_ANDAMENTO	FINALIZADA	2026-06-15 20:18:31.910484
3	3	AGENDADA	EM_ANDAMENTO	2026-06-15 20:18:31.910484
4	4	AGENDADA	CANCELADA	2026-06-15 20:18:31.910484
5	5	AGENDADA	EM_ANDAMENTO	2026-06-15 20:18:31.910484
6	5	EM_ANDAMENTO	FINALIZADA	2026-06-15 20:18:31.910484
7	3	EM_ANDAMENTO	FINALIZADA	2026-06-15 23:20:13.214285
\.


--
-- TOC entry 5039 (class 0 OID 33646)
-- Dependencies: 222
-- Data for Name: registro_clinico; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registro_clinico (id, id_consulta, diagnostico, sintomas, observacoes, orientacoes, finalizado) FROM stdin;
1	1	Hipertensao arterial sistemica controlada	Paciente assintomatico, nega dor toracica ou dispneia	PA 125/80 mmHg, FC 72 bpm. Boa adesao ao tratamento	Manter Losartana 50mg/dia. Retorno em 6 meses	t
3	5	Sobrepeso grau I	Sem queixas no momento	IMC 27. Orientado plano alimentar	Reduzir ultraprocessados, retorno em 60 dias	t
2	3	Hipotireoidismo em acompanhamento	Refere cansaco leve	Aguardando resultado de TSH para ajuste de dose	Coletar exames antes do retorno	t
4	3	Hipertensão arterial estágio 1	Dor de cabeça, tontura	Estresse no trabalho	Reduzir sal, retornar em 30 dias	t
5	4	Sobrepeso	Cansaço	Primeira consulta nutricional	Plano alimentar enviado	t
\.


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 219
-- Name: consulta_remota_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.consulta_remota_id_seq', 10, true);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 223
-- Name: log_status_consulta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.log_status_consulta_id_seq', 7, true);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 221
-- Name: registro_clinico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.registro_clinico_id_seq', 5, true);


--
-- TOC entry 4879 (class 2606 OID 33644)
-- Name: consulta_remota consulta_remota_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consulta_remota
    ADD CONSTRAINT consulta_remota_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 33672)
-- Name: log_status_consulta log_status_consulta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log_status_consulta
    ADD CONSTRAINT log_status_consulta_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 33656)
-- Name: registro_clinico registro_clinico_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_clinico
    ADD CONSTRAINT registro_clinico_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2620 OID 33680)
-- Name: registro_clinico bloquear_edicao; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER bloquear_edicao BEFORE UPDATE ON public.registro_clinico FOR EACH ROW EXECUTE FUNCTION public.fn_bloquear_edicao();


--
-- TOC entry 4886 (class 2620 OID 33682)
-- Name: consulta_remota trg_log_status; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_log_status AFTER UPDATE ON public.consulta_remota FOR EACH ROW EXECUTE FUNCTION public.fn_log_status();


--
-- TOC entry 4885 (class 2606 OID 33673)
-- Name: log_status_consulta log_status_consulta_consulta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log_status_consulta
    ADD CONSTRAINT log_status_consulta_consulta_id_fkey FOREIGN KEY (consulta_id) REFERENCES public.consulta_remota(id);


--
-- TOC entry 4884 (class 2606 OID 33657)
-- Name: registro_clinico registro_clinico_id_consulta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_clinico
    ADD CONSTRAINT registro_clinico_id_consulta_fkey FOREIGN KEY (id_consulta) REFERENCES public.consulta_remota(id);


-- Completed on 2026-06-17 00:40:32

--
-- PostgreSQL database dump complete
--

\unrestrict tP9IB9lCbZNldbSTgW4iWoqYJE2KTfNuCPWl9BVRqiuIOUdGFzBLy4VwKeMHbOH

