// En middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Obtener el token del encabezado 'Authorization'
  const authHeader = req.header('Authorization');

  // 2. Verificar si no hay token
  if (!authHeader) {
    return res.status(401).json({ message: 'No hay token, permiso denegado' });
  }

  // 3. Extraer el token (viene como "Bearer <token>")
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token mal formado, permiso denegado' });
  }

  try {
    // 4. Verificar el token con nuestro secreto
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Si es válido, adjuntamos los datos del usuario (el payload)
    //    a la petición (req) para que las siguientes funciones lo usen.
    req.user = decoded;

    // 6. Le decimos que continúe a la siguiente función (el controlador)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no es válido' });
  }
};