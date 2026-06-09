import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, post, patch } from '../../servicos/api';

const STATUS_BADGE = {
  AGENDADA:      'bg-warning text-dark',
  EM_ANDAMENTO:  'bg-primary',
  FINALIZADA:    'bg-success',
  CANCELADA:     'bg-secondary',
};

const TRANSICOES = {
  AGENDADA:     ['EM_ANDAMENTO', 'CANCELADA'],
  EM_ANDAMENTO: ['FINALIZADA'],
};

const LABEL_STATUS = {
  EM_ANDAMENTO: 'Iniciar atendimento',
  FINALIZADA:   'Finalizar atendimento',
  CANCELADA:    'Cancelar consulta',
};

const BTN_STATUS = {
  EM_ANDAMENTO: 'btn-primary',
  FINALIZADA:   'btn-success',
  CANCELADA:    'btn-danger',
};

function DetalheConsulta() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [consulta, setConsulta] = useState(null);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  const [formRegistro, setFormRegistro] = useState({
    diagnostico: '',
    sintomas: '',
    observacoes: '',
    orientacoes: '',
    finalizado: false,
  });
  const [salvandoRegistro, setSalvandoRegistro] = useState(false);

  const [historico, setHistorico] = useState(null);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const carregarHistorico = async () => {
    setCarregandoHistorico(true);
    try {
      const dados = await get(`api/telemedicina/consultas/${id}/historico`);
      setHistorico(dados.prontuarioPaciente);
    } catch (e) {
      setHistorico({ aviso: 'Erro ao buscar prontuário.' });
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const carregar = async () => {
    try {
      const dados = await get(`api/telemedicina/consultas/${id}`);
      setConsulta(dados);
      if (dados.registroClinico) {
        setFormRegistro({
          diagnostico:  dados.registroClinico.diagnostico  || '',
          sintomas:     dados.registroClinico.sintomas     || '',
          observacoes:  dados.registroClinico.observacoes  || '',
          orientacoes:  dados.registroClinico.orientacoes  || '',
          finalizado:   dados.registroClinico.finalizado   || false,
        });
      }
    } catch (e) {
      setErro('Consulta não encontrada.');
    }
  };

  useEffect(() => {
    carregar();
  }, [id]);

  const alterarStatus = async (novoStatus) => {
    try {
      await patch(`api/telemedicina/consultas/${id}/status`, { status: novoStatus });
      setSucesso(`Status alterado para ${novoStatus}.`);
      setErro(null);
      carregar();
      setTimeout(() => setSucesso(null), 3000);
    } catch (e) {
      const msg = e.response?.data?.erro || 'Erro ao alterar status.';
      setErro(msg);
    }
  };

  const salvarRegistro = async (e) => {
    e.preventDefault();
    setSalvandoRegistro(true);
    try {
      await post(`api/telemedicina/consultas/${id}/registro-clinico`, formRegistro);
      setSucesso('Registro clínico salvo com sucesso!');
      setErro(null);
      carregar();
      setTimeout(() => setSucesso(null), 3000);
    } catch (e) {
      const msg = e.response?.data?.erro || 'Erro ao salvar registro clínico.';
      setErro(msg);
    } finally {
      setSalvandoRegistro(false);
    }
  };

  const formatarData = (data) =>
    new Date(data).toLocaleString('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });

  if (erro && !consulta) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{erro}</div>
      </div>
    );
  }

  if (!consulta) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Carregando...</p>
      </div>
    );
  }

  const proximosStatus = TRANSICOES[consulta.status] || [];
  const registroFinalizado = consulta.registroClinico?.finalizado;

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          {sucesso && (
            <div className="alert alert-success alert-dismissible">
              {sucesso}
              <button className="btn-close" onClick={() => setSucesso(null)} />
            </div>
          )}
          {erro && (
            <div className="alert alert-danger alert-dismissible">
              {erro}
              <button className="btn-close" onClick={() => setErro(null)} />
            </div>
          )}

          {/* Dados da consulta */}
          <div className="card shadow border-0 mb-4">
            <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Detalhes da Consulta</h5>
              <button className="btn btn-sm btn-outline-light" onClick={() => navigate('/consultas')}>
                Voltar
              </button>
            </div>
            <div className="card-body p-4">

              <div className="row mb-2">
                <div className="col-sm-4 fw-bold">Status</div>
                <div className="col-sm-8">
                  <span className={`badge ${STATUS_BADGE[consulta.status] ?? 'bg-light text-dark'}`}>
                    {consulta.status}
                  </span>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 fw-bold">Data/Hora</div>
                <div className="col-sm-8">{formatarData(consulta.dataHora)}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 fw-bold">Canal</div>
                <div className="col-sm-8 text-capitalize">{consulta.canal}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 fw-bold">ID do Paciente</div>
                <div className="col-sm-8 small text-muted">{consulta.idPaciente}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 fw-bold">ID do Profissional</div>
                <div className="col-sm-8 small text-muted">{consulta.idProfissional}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 fw-bold">Motivo</div>
                <div className="col-sm-8">{consulta.motivo}</div>
              </div>

              {proximosStatus.length > 0 && (
                <>
                  <hr />
                  <div className="d-flex gap-2 flex-wrap">
                    {proximosStatus.map((s) => (
                      <button
                        key={s}
                        className={`btn btn-sm ${BTN_STATUS[s]}`}
                        onClick={() => alterarStatus(s)}
                      >
                        {LABEL_STATUS[s]}
                      </button>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Registro clínico */}
          <div className="card shadow border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-primary">Registro Clínico</h5>
              {registroFinalizado && (
                <span className="badge bg-success">Finalizado</span>
              )}
            </div>
            <div className="card-body p-4">

              {registroFinalizado ? (
                <div>
                  <div className="row mb-2">
                    <div className="col-sm-3 fw-bold">Diagnóstico</div>
                    <div className="col-sm-9">{consulta.registroClinico.diagnostico}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-sm-3 fw-bold">Sintomas</div>
                    <div className="col-sm-9">{consulta.registroClinico.sintomas || '—'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-sm-3 fw-bold">Observações</div>
                    <div className="col-sm-9">{consulta.registroClinico.observacoes || '—'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-sm-3 fw-bold">Orientações</div>
                    <div className="col-sm-9">{consulta.registroClinico.orientacoes || '—'}</div>
                  </div>
                  <div className="alert alert-info mt-3 mb-0">
                    <i className="bi bi-lock me-2" />
                    Este registro clínico foi finalizado e não pode ser alterado.
                  </div>
                </div>
              ) : (
                <form onSubmit={salvarRegistro}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Diagnóstico *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formRegistro.diagnostico}
                      onChange={(e) => setFormRegistro({ ...formRegistro, diagnostico: e.target.value })}
                      required
                      placeholder="Diagnóstico do paciente"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Sintomas</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formRegistro.sintomas}
                      onChange={(e) => setFormRegistro({ ...formRegistro, sintomas: e.target.value })}
                      placeholder="Sintomas relatados"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Observações</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formRegistro.observacoes}
                      onChange={(e) => setFormRegistro({ ...formRegistro, observacoes: e.target.value })}
                      placeholder="Observações clínicas"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Orientações ao Paciente</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formRegistro.orientacoes}
                      onChange={(e) => setFormRegistro({ ...formRegistro, orientacoes: e.target.value })}
                      placeholder="Prescrições, encaminhamentos, etc."
                    />
                  </div>
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="finalizado"
                      checked={formRegistro.finalizado}
                      onChange={(e) => setFormRegistro({ ...formRegistro, finalizado: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="finalizado">
                      Marcar como finalizado (não poderá ser editado depois)
                    </label>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={salvandoRegistro}
                    >
                      {salvandoRegistro ? 'Salvando...' : 'Salvar registro'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

          {/* Prontuário do Paciente (G5) */}
          <div className="card shadow border-0 mt-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-primary">
                <i className="bi bi-journal-medical me-2" />
                Prontuário do Paciente
              </h5>
              {!historico && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={carregarHistorico}
                  disabled={carregandoHistorico}
                >
                  {carregandoHistorico ? 'Buscando...' : 'Buscar prontuário (G5)'}
                </button>
              )}
            </div>
            <div className="card-body p-4">
              {!historico && !carregandoHistorico && (
                <p className="text-muted mb-0">
                  Clique em "Buscar prontuário" para consultar o histórico do paciente no módulo G5.
                </p>
              )}
              {carregandoHistorico && (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  <span className="ms-2 text-muted">Consultando G5...</span>
                </div>
              )}
              {historico && historico.aviso && (
                <div className="alert alert-warning mb-0">
                  <i className="bi bi-exclamation-triangle me-2" />
                  {historico.aviso}
                </div>
              )}
              {historico && Array.isArray(historico) && historico.length === 0 && (
                <p className="text-muted mb-0">Nenhum registro de prontuário encontrado para este paciente.</p>
              )}
              {historico && Array.isArray(historico) && historico.length > 0 && (
                <div className="list-group list-group-flush">
                  {historico.map((item, i) => (
                    <div key={i} className="list-group-item px-0">
                      <pre className="mb-0 small text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DetalheConsulta;
