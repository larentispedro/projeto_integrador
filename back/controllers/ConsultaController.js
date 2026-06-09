import ConsultaRemota from "../models/ConsultaRemota.js";
import RegistroClinico from "../models/RegistroClinico.js";
import banco from "../banco.js";
import axios from "axios";

const TRANSICOES_VALIDAS = {
  AGENDADA:     ["EM_ANDAMENTO", "CANCELADA"],
  EM_ANDAMENTO: ["FINALIZADA"],
};

async function criar(req, res) {
  try {
    const consulta = await ConsultaRemota.create(req.body);
    return res.status(201).json(consulta);
  } catch (error) {
    return res.status(400).json({ erro: error.message });
  }
}

async function listar(req, res) {
  try {
    const where = {};
    if (req.query.status)        where.status        = req.query.status;
    if (req.query.idPaciente)    where.idPaciente    = req.query.idPaciente;
    if (req.query.idProfissional) where.idProfissional = req.query.idProfissional;

    const consultas = await ConsultaRemota.findAll({
      where,
      order: [["dataHora", "DESC"]],
    });
    return res.json(consultas);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
}

async function detalhar(req, res) {
  try {
    const { id } = req.params;
    const consulta = await ConsultaRemota.findByPk(id, {
      include: [{ model: RegistroClinico, as: "registroClinico" }],
    });
    if (!consulta) return res.status(404).json({ erro: "Consulta não encontrada" });
    return res.json(consulta);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
}

// Valida a transição no JS e delega o UPDATE para a sp_atualizar_status (BD1)
async function alterarStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const consulta = await ConsultaRemota.findByPk(id);
    if (!consulta) return res.status(404).json({ erro: "Consulta não encontrada" });

    const permitidos = TRANSICOES_VALIDAS[consulta.status] || [];
    if (!permitidos.includes(status)) {
      return res.status(422).json({
        erro: `Transição inválida: ${consulta.status} → ${status}`,
      });
    }

    await banco.query(
      "SELECT sp_atualizar_status(:id_consulta, :novo_status)",
      { replacements: { id_consulta: id, novo_status: status } }
    );

    const atualizada = await ConsultaRemota.findByPk(id);
    return res.json(atualizada);
  } catch (error) {
    return res.status(422).json({ erro: error.message });
  }
}

async function criarRegistroClinico(req, res) {
  try {
    const { id } = req.params;
    const consulta = await ConsultaRemota.findByPk(id, {
      include: [{ model: RegistroClinico, as: "registroClinico" }],
    });

    if (!consulta) return res.status(404).json({ erro: "Consulta não encontrada" });

    if (consulta.registroClinico?.finalizado) {
      return res.status(403).json({ erro: "Registro clínico já finalizado e não pode ser alterado." });
    }

    const { diagnostico, sintomas, observacoes, orientacoes, finalizado } = req.body;

    if (consulta.registroClinico) {
      await consulta.registroClinico.update({ diagnostico, sintomas, observacoes, orientacoes, finalizado });
      return res.json(consulta.registroClinico);
    }

    const registro = await consulta.createRegistroClinico({
      diagnostico,
      sintomas,
      observacoes,
      orientacoes,
      finalizado: finalizado || false,
    });
    return res.status(201).json(registro);
  } catch (error) {
    return res.status(400).json({ erro: error.message });
  }
}

async function faturamento(req, res) {
  try {
    const { id } = req.params;
    const consulta = await ConsultaRemota.findByPk(id);

    if (!consulta) return res.status(404).json({ erro: "Consulta não encontrada" });

    if (consulta.status !== "FINALIZADA") {
      return res.status(422).json({ erro: "Faturamento disponível apenas para consultas finalizadas." });
    }

    return res.json({
      consultaId:      consulta.id,
      pacienteId:      consulta.idPaciente,
      profissionalId:  consulta.idProfissional,
      dataAtendimento: consulta.dataHora,
      tipoServico:     "TELEMEDICINA",
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
}

// Usa a VIEW vw_consultas_detalhadas (BD1)
async function relatorio(req, res) {
  try {
    const [resultado] = await banco.query(
      "SELECT * FROM vw_consultas_detalhadas"
    );
    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
}

async function consultarComProntuario(req, res) {
  try {
    const { id } = req.params;
    const consulta = await ConsultaRemota.findByPk(id);

    if (!consulta) {
      return res.status(404).json({ erro: "Consulta não encontrada" });
    }

    let historicoProntuario = [];

    try {
      const respostaG5 = await axios.get(`http://localhost:3005/api/prontuario/${consulta.idPaciente}`);
      historicoProntuario = respostaG5.data;
    } catch (err) {
      historicoProntuario = { aviso: "Módulo G5 indisponível no momento." };
    }

    return res.json({
      dadosConsulta:      consulta,
      prontuarioPaciente: historicoProntuario,
    });

  } catch (error) {
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
}

export default {
  criar, listar, detalhar, alterarStatus,
  criarRegistroClinico, faturamento,
  relatorio, consultarComProntuario,
};
