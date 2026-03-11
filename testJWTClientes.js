// testJWTClientes.js
const axios = require('axios');

const API_URL = 'http://localhost:3000'; // ajuste para sua porta
const LOGIN_CREDENTIALS = {
  email: 'admin@sistema.com', // ajuste se necessário
  senha: '123456'             // ajuste se necessário
};

async function testJWTClientes() {
  try {
    // 1️⃣ Faz login para gerar token
    const loginRes = await axios.post(`${API_URL}/auth/login`, LOGIN_CREDENTIALS);
    const token = loginRes.data.token;

    if (!token) {
      console.error('❌ Token não retornado no login');
      return;
    }

    console.log('✅ Token gerado com sucesso:');
    console.log(token);

    // 2️⃣ Testa rota GET /clientes com Bearer token correto
    const clientesRes = await axios.get(`${API_URL}/clientes`, {
      headers: {
        Authorization: `Bearer ${token}` // <--- Header correto
      }
    });

    console.log('\n✅ Clientes retornados:');
    console.log(clientesRes.data);

  } catch (err) {
    if (err.response) {
      console.error('❌ Erro na requisição:');
      console.error(err.response.data);
    } else {
      console.error('❌ Erro:', err.message);
    }
  }
}

testJWTClientes();