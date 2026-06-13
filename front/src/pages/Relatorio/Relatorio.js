import { useState, useEffect } from 'react';
import { get } from '../../servicos/api';

const STATUS_BADGE = {
  AGENDADA:     'bg-warning text-dark',
  EM_ANDAMENTO: 'bg-primary',
  FINALIZADA:   'bg-success',
  CANCELADA:    'bg-secondary',
};

function Relatorio() {
  const [dados, setDados] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    get('api/telemedicina/relatorio')
      .then(setDados)
      .catch(() => setErro('Erro ao carregar relatório.'))
      .finally(() => setCarregando(false));
  }, []);

  const formatarData = (data) =>
    new Date(data).toLocaleString('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });

  if (carregando) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Carregando relatório...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0 text-primary">
              <i className="bi bi-bar-chart-line me-2" />
              Relatório de Consultas
            </h4>
          </div>
          <span className="badge bg-secondary fs-6">{dados.length} registros</span>
        </div>

        <div className="card-body p-0">
          {dados.length === 0 ? (
            <p className="text-center text-muted py-4">Nenhum registro encontrado.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Data/Hora</th>
                    <th>Paciente (ID)</th>
                    <th>Canal</th>
                    <th>Motivo</th>
                    <th>Status</th>
                    <th>Diagnóstico</th>
                    <th>Reg. Finalizado</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((row) => (
                    <tr key={row.consulta_id}>
                      <td className="ps-4">{formatarData(row.data_hora)}</td>
                      <td className="small text-muted">{row.paciente_id}</td>
                      <td className="text-capitalize">{row.canal}</td>
                      <td>{row.motivo}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[row.status] ?? 'bg-light text-dark'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{row.diagnostico ?? <span className="text-muted">—</span>}</td>
                      <td className="text-center">
                        {row.finalizado === true ? (
                          <i className="bi bi-check-circle-fill text-success" />
                        ) : (
                          <i className="bi bi-dash-circle text-muted" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Relatorio;
