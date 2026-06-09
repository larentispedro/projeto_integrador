import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../../servicos/api';

function FormConsulta() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    idPaciente: '',
    idProfissional: '',
    dataHora: '',
    canal: 'video',
    motivo: '',
  });
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      await post('api/telemedicina/consultas', form);
      setSucesso(true);
      setTimeout(() => navigate('/consultas'), 1500);
    } catch (e) {
      setErro('Erro ao criar consulta. Verifique os dados e tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">

          {sucesso && (
            <div className="alert alert-success">
              Consulta criada com sucesso! Redirecionando...
            </div>
          )}
          {erro && (
            <div className="alert alert-danger">{erro}</div>
          )}

          <div className="card shadow border-0">
            <div className="card-header bg-primary text-white py-3">
              <h5 className="mb-0">Nova Consulta Remota</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label fw-bold">ID do Paciente</label>
                  <input
                    type="text"
                    name="idPaciente"
                    className="form-control"
                    value={form.idPaciente}
                    onChange={handleChange}
                    required
                    placeholder="UUID do paciente"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ID do Profissional</label>
                  <input
                    type="text"
                    name="idProfissional"
                    className="form-control"
                    value={form.idProfissional}
                    onChange={handleChange}
                    required
                    placeholder="UUID do profissional de saúde"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Data e Hora</label>
                  <input
                    type="datetime-local"
                    name="dataHora"
                    className="form-control"
                    value={form.dataHora}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Canal de Atendimento</label>
                  <select
                    name="canal"
                    className="form-select"
                    value={form.canal}
                    onChange={handleChange}
                    required
                  >
                    <option value="video">Vídeo</option>
                    <option value="audio">Áudio</option>
                    <option value="chat">Chat</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Motivo do Atendimento</label>
                  <textarea
                    name="motivo"
                    className="form-control"
                    rows={3}
                    value={form.motivo}
                    onChange={handleChange}
                    required
                    placeholder="Descreva o motivo da consulta"
                  />
                </div>

                <hr />
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-link text-muted"
                    onClick={() => navigate('/consultas')}
                  >
                    Voltar para a lista
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5"
                    disabled={carregando}
                  >
                    {carregando ? 'Salvando...' : 'Agendar consulta'}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FormConsulta;
