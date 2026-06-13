import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../servicos/api';

const STATUS_BADGE = {
  AGENDADA:      'bg-warning text-dark',
  EM_ANDAMENTO:  'bg-primary',
  FINALIZADA:    'bg-success',
  CANCELADA:     'bg-secondary',
};

function ListaConsulta() {
  const [consultas, setConsultas] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [erro, setErro] = useState(null);

  const carregarConsultas = async (status) => {
    try {
      const rota = status
        ? `api/telemedicina/consultas?status=${status}`
        : 'api/telemedicina/consultas';
      const dados = await get(rota);
      setConsultas(dados);
    } catch (e) {
      setErro('Erro ao carregar consultas.');
    }
  };

  useEffect(() => {
    carregarConsultas(filtroStatus);
  }, [filtroStatus]);

  const formatarData = (data) =>
    new Date(data).toLocaleString('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="container my-5">

      {erro && (
        <div className="alert alert-danger alert-dismissible">
          {erro}
          <button className="btn-close" onClick={() => setErro(null)} />
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h4 className="mb-0 text-primary">Consultas Remotas</h4>
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">Todos os status</option>
              <option value="AGENDADA">Agendada</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
            <Link to="/consultas/nova" className="btn btn-success btn-sm">
              <i className="bi bi-plus-circle me-1" />
              Nova consulta
            </Link>
          </div>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Data/Hora</th>
                <th>Paciente (ID)</th>
                <th>Profissional (ID)</th>
                <th>Canal</th>
                <th>Motivo</th>
                <th>Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {consultas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    Nenhuma consulta encontrada.
                  </td>
                </tr>
              ) : (
                consultas.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-4">{formatarData(c.dataHora)}</td>
                    <td className="text-monospace small">{c.idPaciente}</td>
                    <td className="text-monospace small">{c.idProfissional}</td>
                    <td className="text-capitalize">{c.canal}</td>
                    <td>{c.motivo}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[c.status] ?? 'bg-light text-dark'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <Link
                        to={`/consultas/${c.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-eye me-1" /> Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ListaConsulta;
