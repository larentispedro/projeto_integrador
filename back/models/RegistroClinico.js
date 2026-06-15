import { DataTypes } from "sequelize";
import banco from "../banco.js";

const RegistroClinico = banco.define("RegistroClinico", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  diagnostico: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  sintomas: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  observacoes: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  orientacoes: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  finalizado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "registro_clinico",
  timestamps: false,
});

export default RegistroClinico;
