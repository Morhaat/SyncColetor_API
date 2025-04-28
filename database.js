require("dotenv").config();
const {Sequelize} = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: false, // Remover logs do console,
    pool: {
        max: 10,     // máximo de conexões simultâneas
        min: 0,      // mínimo de conexões
        acquire: 30000, // tempo máximo para tentar conectar antes de erro (ms)
        idle: 10000   // tempo para desconectar conexões ociosas (ms)
    }
});
const testConnection = async ()=>{
    try{
        await sequelize.authenticate();
        console.log("Conexão com MySQL estabelecida com sucesso!");
    }catch(error){
        console.error("Erro ao conectar no MySQL: ", error);
    }
};

testConnection();

module.exports = sequelize;