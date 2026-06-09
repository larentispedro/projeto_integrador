import express from "express";
import cors from "cors";
import banco from "./banco.js";

import ConsultaRemota from "./models/ConsultaRemota.js";
import RegistroClinico from "./models/RegistroClinico.js";
import ConsultaController from "./controllers/ConsultaController.js";

const app = express();
app.use(cors());
app.use(express.json());

ConsultaRemota.hasOne(RegistroClinico, {
  foreignKey: "id_consulta",
  as: "registroClinico",
});

RegistroClinico.belongsTo(ConsultaRemota, {
  foreignKey: "id_consulta",
  as: "consulta",
});

app.post("/api/telemedicina/consultas", ConsultaController.criar);
app.get("/api/telemedicina/consultas", ConsultaController.listar);
app.get("/api/telemedicina/consultas/:id", ConsultaController.detalhar);
app.patch("/api/telemedicina/consultas/:id/status", ConsultaController.alterarStatus);
app.post("/api/telemedicina/consultas/:id/registro-clinico", ConsultaController.criarRegistroClinico);
app.get("/api/telemedicina/consultas/:id/faturamento", ConsultaController.faturamento);
app.get("/api/telemedicina/consultas/:id/historico", ConsultaController.consultarComProntuario);
app.get("/api/telemedicina/relatorio", ConsultaController.relatorio);

try {
  await banco.authenticate();
  app.listen(3001, () => {
    console.log("API G12 Telemedicina rodando na porta 3001");
  });
} catch (err) {
  console.error("Erro ao conectar ao banco:", err);
}
