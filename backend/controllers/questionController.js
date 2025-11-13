const pool = require('../db'); // Importa el pool de la base de datos

/**
 * GET /api/questions
 * Obtiene preguntas, opcionalmente filtrando por clase de licencia.
 * Por defecto devuelve clase 'B' si no se provee un classType válido.
 */
exports.getAllQuestions = async (req, res) => {
    // Obtiene la clase solicitada desde los query parameters (ej: /api/questions?classType=B)
    const { classType } = req.query; // Será undefined si no se provee

    try {
        let queryParams = [];
        // Empieza a construir la consulta base
        let query = `
      SELECT
        q.id, q.text, q.explanation, q.points,
        q.correct_option, q.correct_options, c.name as category, q.license_class,
        json_agg(json_build_object('letter', o.letter, 'text', o.text)) as options
      FROM questions q
      JOIN categories c ON q.category_id = c.id
      JOIN options o ON q.id = o.question_id
    `;

        // Añade cláusula WHERE SI se provee un classType válido (Añade más clases válidas según necesites)
        if (classType && ['B', 'C'].includes(classType.toUpperCase())) {
            query += ` WHERE q.license_class = $1`;
            queryParams.push(classType.toUpperCase());
        } else {
            // Por defecto Clase B si no se pide nada específico o es inválido
            query += ` WHERE q.license_class = $1`;
            queryParams.push('B');
        }

        // Completa la consulta
        query += `
      GROUP BY q.id, c.name, q.license_class
      ORDER BY q.id;
    `; // Añadido q.license_class al GROUP BY

        // Ejecuta la consulta
        const { rows } = await pool.query(query, queryParams);

        // Formatea los resultados para el frontend
        const formattedQuestions = rows.map(q => ({
            id: q.id,
            text: q.text,
            explanation: q.explanation,
            points: q.points,
            category: q.category,
            licenseClass: q.license_class, // Incluye licenseClass
            options: q.options.sort((a, b) => a.letter.localeCompare(b.letter)),
            correctAnswer: q.correct_options || q.correct_option,
            multi: !!q.correct_options
        }));

        res.json(formattedQuestions);
    } catch (error) {
        console.error('Error al obtener las preguntas:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener las preguntas' });
    }
};

/**
 * POST /api/questions
 * Crea una nueva pregunta, incluyendo sus opciones y clase de licencia.
 * Maneja respuestas correctas únicas y múltiples.
 */
exports.createQuestion = async (req, res) => {
    // Incluye licenseClass, por defecto 'B' si no se provee
    const { text, explanation, points, category, correctAnswer, options, licenseClass = 'B' } = req.body;
    const client = await pool.connect(); // Usa un cliente para la transacción

    try {
        // Inicia la transacción
        await client.query('BEGIN');

        // 1. Busca el ID de la categoría, devuelve error si no existe
        let categoryId;
        const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
        if (categoryResult.rows.length === 0) {
            await client.query('ROLLBACK'); // Aborta la transacción
            return res.status(400).json({ message: `Error: La categoría '${category}' no es válida o no existe.` });
        }
        categoryId = categoryResult.rows[0].id;

        // 2. Inserta los datos principales de la pregunta según el tipo de respuesta
        let questionQuery;
        let questionValues;

        if (Array.isArray(correctAnswer)) {
            // Multi-respuesta: Usa correct_options e incluye license_class
            questionQuery = `
        INSERT INTO questions (text, explanation, points, category_id, correct_options, license_class)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
      `;
            questionValues = [text, explanation || null, points, categoryId, correctAnswer, licenseClass.toUpperCase()];
        } else {
            // Respuesta-única: Usa correct_option e incluye license_class
            questionQuery = `
        INSERT INTO questions (text, explanation, points, category_id, correct_option, license_class)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
      `;
            questionValues = [text, explanation || null, points, categoryId, correctAnswer, licenseClass.toUpperCase()];
        }
        const newQuestion = await client.query(questionQuery, questionValues);
        const newQuestionId = newQuestion.rows[0].id;

        // 3. Inserta todas las opciones vinculadas al ID de la nueva pregunta
        if (!options || options.length === 0) {
           throw new Error('Se requiere al menos una opción para la pregunta.');
        }
        for (const option of options) {
            if (!option.letter || !option.text) {
               throw new Error('Cada opción debe tener letra y texto.');
            }
            const optionQuery = 'INSERT INTO options (question_id, letter, text) VALUES ($1, $2, $3)';
            await client.query(optionQuery, [newQuestionId, option.letter, option.text]);
        }

        // Confirma la transacción si todo tuvo éxito
        await client.query('COMMIT');
        res.status(201).json({ id: newQuestionId, message: 'Pregunta creada con éxito' });

    } catch (error) {
        // Revierte la transacción en caso de cualquier error
        await client.query('ROLLBACK');
        console.error('Error al crear la pregunta:', error);
        res.status(500).json({ message: error.message || 'Error en el servidor al crear la pregunta' }); // Devuelve el mensaje de error específico si existe
    } finally {
        // Libera al cliente de vuelta al pool
        client.release();
    }
};

/**
 * PUT /api/questions/:id
 * Actualiza una pregunta existente, incluyendo sus opciones y clase de licencia.
 */
exports.updateQuestion = async (req, res) => {
    const { id } = req.params; // Obtiene el ID de la pregunta del parámetro URL
    // Incluye licenseClass, por defecto 'B' si no se provee
    const { text, explanation, points, category, correctAnswer, options, licenseClass = 'B' } = req.body;
    const client = await pool.connect(); // Usa un cliente para la transacción

    try {
        // Inicia la transacción
        await client.query('BEGIN');

        // 1. Busca el ID de la categoría, devuelve error si no existe
        let categoryId;
        const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
        if (categoryResult.rows.length === 0) {
            await client.query('ROLLBACK'); // Aborta la transacción
            return res.status(400).json({ message: `Error: La categoría '${category}' no es válida o no existe.` });
        }
        categoryId = categoryResult.rows[0].id;

        // 2. Actualiza los datos principales de la pregunta, incluyendo license_class
        const questionQuery = `
      UPDATE questions
      SET text = $1, explanation = $2, points = $3, category_id = $4,
          correct_option = $5, correct_options = $6, license_class = $7
      WHERE id = $8;
    `;
        await client.query(questionQuery, [
            text, explanation || null, points, categoryId,
            Array.isArray(correctAnswer) ? null : correctAnswer, // Establece correct_option solo si es respuesta única
            Array.isArray(correctAnswer) ? correctAnswer : null, // Establece correct_options solo si es multi-respuesta
            licenseClass.toUpperCase(), // Actualiza license_class
            id
        ]);

        // 3. Elimina las opciones existentes para esta pregunta
        await client.query('DELETE FROM options WHERE question_id = $1', [id]);

        // 4. Inserta las nuevas opciones
        if (!options || options.length === 0) {
            throw new Error('Se requiere al menos una opción para la pregunta.');
         }
        for (const option of options) {
            if (!option.letter || !option.text) {
                throw new Error('Cada opción debe tener letra y texto.');
             }
            await client.query('INSERT INTO options (question_id, letter, text) VALUES ($1, $2, $3)', [id, option.letter, option.text]);
        }

        // Confirma la transacción si todo tuvo éxito
        await client.query('COMMIT');
        res.json({ message: 'Pregunta actualizada con éxito' });
    } catch (error) {
        // Revierte la transacción en caso de cualquier error
        await client.query('ROLLBACK');
        console.error('Error al actualizar la pregunta:', error);
        res.status(500).json({ message: error.message || 'Error en el servidor al actualizar la pregunta' }); // Devuelve mensaje específico
    } finally {
        // Libera al cliente de vuelta al pool
        client.release();
    }
};

/**
 * GET /api/questions/:id
 * Obtiene una sola pregunta por su ID.
 */
exports.getQuestionById = async (req, res) => {
    const { id } = req.params; // Obtiene el ID del parámetro URL

    try {
        // Consulta similar a getAllQuestions pero filtrando por ID
        const query = `
      SELECT
        q.id, q.text, q.explanation, q.points,
        q.correct_option, q.correct_options, c.name as category, q.license_class,
        json_agg(json_build_object('letter', o.letter, 'text', o.text)) as options
      FROM questions q
      JOIN categories c ON q.category_id = c.id
      JOIN options o ON q.id = o.question_id
      WHERE q.id = $1 -- Filtra por el ID provisto
      GROUP BY q.id, c.name, q.license_class; -- Añadido q.license_class al GROUP BY
    `;
        const { rows } = await pool.query(query, [id]);

        // Verifica si se encontró una pregunta
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pregunta no encontrada' });
        }

        // Formatea el resultado de la única pregunta
        const q = rows[0];
        const formattedQuestion = {
            id: q.id,
            text: q.text,
            explanation: q.explanation,
            points: q.points,
            category: q.category,
            licenseClass: q.license_class, // Incluye licenseClass
            options: q.options.sort((a, b) => a.letter.localeCompare(b.letter)),
            correctAnswer: q.correct_options || q.correct_option,
            multi: !!q.correct_options
        };

        res.json(formattedQuestion);
    } catch (error) {
        console.error('Error al obtener la pregunta por ID:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener la pregunta' });
    }
};