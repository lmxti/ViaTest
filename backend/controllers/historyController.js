// En controllers/historyController.js
const pool = require('../db');

exports.createTestResult = async (req, res) => {
  // Ahora esperamos 'questions' y 'userAnswers' además del resumen
  const { score, totalQuestions, status, questions, userAnswers, classType = 'B' } = req.body;
  const userId = req.user.userId;
  const client = await pool.connect(); // Cliente para la transacción

  // Validación básica
  if (!questions || !userAnswers) {
     return res.status(400).json({ message: 'Faltan datos detallados del test.' });
  }

  try {
    await client.query('BEGIN');

    // 1. Insertar el resumen en test_history
    const historyQuery = `
          INSERT INTO test_history (score, total_questions, status, user_id, license_class)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id;
    `;
    const historyValues = [score, totalQuestions, status, userId, classType.toUpperCase()];
    const newHistory = await client.query(historyQuery, historyValues);
    const historyId = newHistory.rows[0].id;

    // 2. Insertar cada detalle en test_history_details
    for (const question of questions) {
      const questionId = question.id;
      const userAnswerRaw = userAnswers[questionId];
      let userAnswerString = null;
      let isCorrect = false;

      // Procesar respuesta (manejar null, undefined, string, object for multi)
      if (userAnswerRaw !== null && userAnswerRaw !== undefined) {
          if (typeof userAnswerRaw === 'object') {
              // Respuesta múltiple: convertir a array de letras seleccionadas y luego a string JSON
              const selectedLetters = Object.keys(userAnswerRaw).filter(key => userAnswerRaw[key]);
              userAnswerString = JSON.stringify(selectedLetters.sort()); // Guardar como JSON ordenado

              // Verificar corrección para múltiple
              const correctAnswers = question.correctAnswer;
              isCorrect = correctAnswers.length === selectedLetters.length &&
                          correctAnswers.every(el => selectedLetters.includes(el));

          } else {
              // Respuesta única: guardar como string
              userAnswerString = String(userAnswerRaw);
              isCorrect = userAnswerString === question.correctAnswer;
          }
      } // Si userAnswerRaw es null/undefined, userAnswerString se queda null e isCorrect false

      const detailQuery = `
        INSERT INTO test_history_details (history_id, question_id, user_answer, is_correct)
        VALUES ($1, $2, $3, $4);
      `;
      // Convertimos el array de respuestas múltiples a string JSON para guardarlo
      const detailValues = [historyId, questionId, userAnswerString, isCorrect];
      await client.query(detailQuery, detailValues);
    }

    await client.query('COMMIT');
    res.status(201).json({ id: historyId, message: 'Historial detallado guardado con éxito' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al guardar el historial detallado:', error);
    res.status(500).json({ message: 'Error en el servidor al guardar historial' });
  } finally {
    client.release();
  }
};

exports.getTestHistory = async (req, res) => {
  const userId = req.user.userId;
  const { classType } = req.params; // 👈 Lee el classType de la URL

  if (!classType) {
    return res.status(400).json({ message: 'Debe especificar una clase.' });
  }

  try {
    // 👇 Modifica la consulta para filtrar por user_id Y license_class
    const query = `
      SELECT * FROM test_history 
      WHERE user_id = $1 AND license_class = $2 
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId, classType.toUpperCase()]); // 👈 Pasa ambos parámetros
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getTestHistoryDetail = async (req, res) => {
  const historyId = parseInt(req.params.id, 10); // Obtenemos el ID del test desde la URL
  const userId = req.user.userId; // Obtenido del token

  // Validación básica del ID
  if (isNaN(historyId)) {
    return res.status(400).json({ message: 'ID de historial inválido.' });
  }

  try {
    // 1. Verificar que el test pertenece al usuario logueado
    const historyCheck = await pool.query(
      'SELECT * FROM test_history WHERE id = $1 AND user_id = $2',
      [historyId, userId]
    );

    if (historyCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Historial no encontrado o no pertenece al usuario.' });
    }
    const testSummary = historyCheck.rows[0]; // Guardamos el resumen

    // 2. Obtener los detalles (preguntas, respuestas) de ese test
    const detailsQuery = `
      SELECT
        hd.id,
        hd.user_answer,
        hd.is_correct,
        q.id as question_id,
        q.text as question_text,
        q.explanation as question_explanation,
        q.points as question_points,
        q.correct_option,
        q.correct_options,
        cat.name as category_name,
        (SELECT json_agg(json_build_object('letter', opt.letter, 'text', opt.text))
         FROM options opt WHERE opt.question_id = q.id) as options
      FROM test_history_details hd
      JOIN questions q ON hd.question_id = q.id
      JOIN categories cat ON q.category_id = cat.id
      WHERE hd.history_id = $1
      ORDER BY q.id; -- O el orden que prefieras
    `;
    const detailsResult = await pool.query(detailsQuery, [historyId]);

    // 3. Formatear la respuesta
    const response = {
      summary: {
        id: testSummary.id,
        score: testSummary.score,
        totalQuestions: testSummary.total_questions,
        status: testSummary.status,
        createdAt: testSummary.created_at
      },
      details: detailsResult.rows.map(d => ({
        detailId: d.id,
        isCorrect: d.is_correct,
        userAnswer: d.user_answer ? (d.user_answer.startsWith('[') ? JSON.parse(d.user_answer) : d.user_answer) : null, // Parsear JSON si es array
        question: {
          id: d.question_id,
          text: d.question_text,
          explanation: d.question_explanation,
          points: d.question_points,
          category: d.category_name,
          options: d.options.sort((a,b) => a.letter.localeCompare(b.letter)), // Ordenar opciones
          correctAnswer: d.correct_options || d.correct_option, // Unificar respuesta correcta
          multi: !!d.correct_options
        }
      }))
    };

    res.json(response);

  } catch (error) {
    console.error(`Error al obtener detalle del historial ${historyId}:`, error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getHistoryStats = async (req, res) => {
  const { classType } = req.params; // Obtenemos la clase de la URL (ej: 'b')
  const userId = req.user.userId; // Obtenemos el ID del token

  if (!classType) {
    return res.status(400).json({ message: 'Debe especificar una clase.' });
  }

  try {
    // Consulta SQL que cuenta el total y los aprobados para ese usuario y clase
    const statsQuery = `
      SELECT
          COUNT(*) AS total_realizados,
          COUNT(*) FILTER (WHERE status = 'Aprobado') AS total_aprobados
      FROM test_history
      WHERE user_id = $1 AND license_class = $2;
    `;
    const { rows } = await pool.query(statsQuery, [userId, classType.toUpperCase()]);

    // rows[0] contendrá algo como { total_realizados: '5', total_aprobados: '2' }
    res.json({
      totalRealizados: parseInt(rows[0].total_realizados, 10),
      totalAprobados: parseInt(rows[0].total_aprobados, 10)
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};