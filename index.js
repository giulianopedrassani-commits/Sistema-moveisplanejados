require('dotenv').config();

const app = require('./src/app'); // caminho correto

const PORT = process.env.PORT || 3000;

console.log("Iniciando servidor...");

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});