require('dotenv').config();
const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

console.log("Iniciando servidor...");

// Rota inicial
app.get('/', (req, res) => {
    res.send('API funcionando 🚀');
});

// Exemplo de rota futura CRUD
// app.get('/usuarios', (req, res) => {
//     res.send('Lista de usuários');
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});