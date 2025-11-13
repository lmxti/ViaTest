// En controllers/categoryController.js
const pool = require('../db');

exports.getAllCategories = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) { /* ...tu manejo de error... */ }
};