import { Sequelize } from "sequelize";
import "dotenv/config";

const banco = new Sequelize(
  process.env.DB_NOME,
  process.env.DB_USUARIO,
  process.env.DB_SENHA,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORTA),
    dialect: "postgres",
    define: {
      timestamps: false,
      freezeTableName: true,
      underscored: true,
    },
  }
);

export default banco;
