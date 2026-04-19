const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');

const app = express();

/* ============================================================
   Middleware
   ============================================================ */
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/* ============================================================
   DB
   ============================================================ */
const dbPath = path.join(__dirname, 'db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

/* ============================================================
   JWT
   ============================================================ */
const JWT_SECRET = process.env.MOCK_JWT_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.MOCK_REFRESH_SECRET || 'refresh-secret';

// armazenamento simples (mock)
let refreshTokens = [];

/* ============================================================
   Utils
   ============================================================ */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const tempoResposta = 1000;

/* ============================================================
   1. LOGIN
   ============================================================ */
app.post('/autenticacao/login', async (req, res) => {
  const { email, senha } = req.body;

  await delay(tempoResposta);

  const user = db['clientes']?.find(
    (c) => c.email === email && c.senha === senha
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // 🔐 Access Token (curto)
  const accessToken = jwt.sign(
    { clienteId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  // 🔄 Refresh Token (longo)
  const refreshToken = jwt.sign(
    { clienteId: user.id },
    REFRESH_SECRET,
    { expiresIn: '1d' }
  );

  refreshTokens.push(refreshToken);

  return res.json({
    accessToken,
    refreshToken,
    clienteId: user.id
  });
});

/* ============================================================
   2. REFRESH TOKEN
   ============================================================ */
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  await delay(tempoResposta);

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token obrigatório' });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: 'Refresh token inválido' });
  }

  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Refresh token expirado' });
    }

    const newAccessToken = jwt.sign(
      { clienteId: user.clienteId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({ accessToken: newAccessToken });
  });
});

/* ============================================================
   3. LOGOUT
   ============================================================ */
app.post('/logout', (req, res) => {
  const { refreshToken } = req.body;

  refreshTokens = refreshTokens.filter(t => t !== refreshToken);

  res.json({ message: 'Logout realizado' });
});

/* ============================================================
   404
   ============================================================ */
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

/* ============================================================
   START
   ============================================================ */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✓ Mock API rodando em http://localhost:${PORT}`);
  console.log(`✓ POST /autenticacao/login`);
  console.log(`✓ POST /refresh-token`);
  console.log(`✓ POST /logout`);
});