// En index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Importar rutas
const questionsRouter = require('./routes/questions');
const categoriesRouter = require('./routes/categories');
const authRouter = require('./routes/auth');
const historyRouter = require('./routes/history'); 

app.use(cors());
app.use(express.json());

// Conexión de rutas
app.use('/api/questions', questionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/history', historyRouter);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});