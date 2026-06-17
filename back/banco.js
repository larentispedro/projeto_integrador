import { Sequelize } from "sequelize";

const banco = new Sequelize("g12_telemedicina", "postgres", "emyunoesc", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  define: {
    timestamps: false,
    freezeTableName: true,
    underscored: true,
  },
});

export default banco;
