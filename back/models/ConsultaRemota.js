import { DataTypes } from "sequelize";
import banco from "../banco.js";

const ConsultaRemota = banco.define("ConsultaRemota", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  idPaciente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  idProfissional: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dataHora: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  canal: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: "AGENDADA",
  },
}, {
  tableName: "consulta_remota",
  timestamps: false,
});

export default ConsultaRemota;
