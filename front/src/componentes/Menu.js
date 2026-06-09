import { Link } from 'react-router-dom';

function Menu() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-camera-video me-2" />
          G12 Telemedicina
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/consultas">
                <i className="bi bi-calendar2-check me-1" />
                Consultas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/relatorio">
                <i className="bi bi-bar-chart-line me-1" />
                Relatório
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Menu;
