// En controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password } = req.body;

  // Validación simple
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    // 1. Revisar si el usuario ya existe
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // 2. Hashear la contraseña
    const salt = await bcrypt.genSalt(10); // Genera "sal"
    const passwordHash = await bcrypt.hash(password, salt); // Crea el hash

    // 3. Guardar el nuevo usuario
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      user: newUser.rows[0],
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar al usuario por email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Usamos un mensaje genérico por seguridad
      return res.status(401).json({ message: 'Credenciales inválidas' }); 
    }

    const user = userResult.rows[0];

    // 2. Comparar la contraseña enviada con el hash guardado
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Si todo es correcto, crear el Token (JWT)
    const payload = {
      userId: user.id,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // Usa el secreto del archivo .env
      { expiresIn: '24h' } // El token expirará en 24 horas
    );

    // 4. Enviar el token al cliente
    res.json({
      message: 'Inicio de sesión exitoso',
      token: token
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};