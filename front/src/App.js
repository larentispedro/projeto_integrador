import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './componentes/Menu';
import ListaConsulta from './pages/Consulta/ListaConsulta';
import FormConsulta from './pages/Consulta/FormConsulta';
import DetalheConsulta from './pages/Consulta/DetalheConsulta';
import Relatorio from './pages/Relatorio/Relatorio';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Menu />
        <Routes>
          <Route path="/" element={<Navigate to="/consultas" />} />

          <Route path="/consultas"          element={<ListaConsulta />} />
          <Route path="/consultas/nova"     element={<FormConsulta />} />
          <Route path="/consultas/:id"      element={<DetalheConsulta />} />
          <Route path="/relatorio"          element={<Relatorio />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
