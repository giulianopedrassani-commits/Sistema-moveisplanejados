const bcrypt = require('bcrypt');

async function gerarHash() {
    const senha = '123456'; // senha inicial do admin
    const saltRounds = 10;

    const hash = await bcrypt.hash(senha, saltRounds);
    console.log('Hash gerado:\n', hash);
}

gerarHash();
