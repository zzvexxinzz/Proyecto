require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error } = require('console');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

//--- MIDDLEWARE DE AUTENTICACIÓN ---
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado, Se requiere token de autentificación."});
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificado;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token no validado correctamente: " + error.message });
    }
};


//--- RUTAS DE AUTENTICACIÓN ---

app.post('/auth/registro', async (req, res) => {

    try {
      const { email, password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await pool.query(
            'INSERT INTO api_users (email,password) VALUES ($1, $2) RETURNING id, email, creation_date',
            [email, hashedPassword]
        );
        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: "El email ya está en uso por otro usuario" + error.message });
        }
        res.status(500).json({ error: "No se ha podido registrar en usuario: " + error.message });
    }
});
app.post('/auth/login', async (req, res) => {

    try {
        const { email, password } = req.body;
        const result = await pool.query(
            'SELECT * FROM api_users WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales Incorrectas" });
        }
        const usuario = result.rows[0];
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(401).json({ error: "Credenciales Incorrectas" });
        }
        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "No se pudo iniciar sesión: " + error.message });
    }
});

/* ESPECIALIDADES */

app.get('/especialidades', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM especialidades ORDER BY id_especialidad ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/especialidades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM especialidades WHERE id_especialidad = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Especialidad no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/especialidades', verificarToken, async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        const result = await pool.query(
            'INSERT INTO especialidades (nombre, descripcion) VALUES ($1,$2) RETURNING *',
            [nombre, descripcion]
        );

        res.json({
            mensaje: 'Especialidad añadida correctamente',
            especialidad: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/especialidades/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        const result = await pool.query(
            'UPDATE especialidades SET nombre = $1, descripcion = $2 WHERE id_especialidad = $3 RETURNING *',
            [nombre, descripcion, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Especialidad no encontrada' });
        }

        res.json({
            mensaje: 'Especialidad editada correctamente',
            especialidad: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/especialidades/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM especialidades WHERE id_especialidad = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Especialidad no encontrada' });
        }

        res.json({
            mensaje: 'Especialidad removida correctamente',
            especialidad: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* DOCTORES */

app.get('/doctores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM doctores ORDER BY id_doctor ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/doctores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM doctores WHERE id_doctor = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/doctores', verificarToken, async (req, res) => {
    try {
        const { nombre, apellido, telefono, correo, id_especialidad } = req.body;

        if (!nombre || !apellido || !id_especialidad) {
            return res.status(400).json({ error: 'Nombre, apellido e id_especialidad son obligatorios' });
        }

        const result = await pool.query(
            'INSERT INTO doctores (nombre, apellido, telefono, correo, id_especialidad) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [nombre, apellido, telefono, correo, id_especialidad]
        );

        res.json({
            mensaje: 'Doctor añadido correctamente',
            doctor: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/doctores/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, correo, id_especialidad } = req.body;

        if (!nombre || !apellido || !id_especialidad) {
            return res.status(400).json({ error: 'Nombre, apellido e id_especialidad son obligatorios' });
        }

        const result = await pool.query(
            'UPDATE doctores SET nombre = $1, apellido = $2, telefono = $3, correo = $4, id_especialidad = $5 WHERE id_doctor = $6 RETURNING *',
            [nombre, apellido, telefono, correo, id_especialidad, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }

        res.json({
            mensaje: 'Doctor editado correctamente',
            doctor: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/doctores/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM doctores WHERE id_doctor = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }

        res.json({
            mensaje: 'Doctor removido correctamente',
            doctor: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* PACIENTES */

app.get('/pacientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pacientes ORDER BY id_paciente ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/pacientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM pacientes WHERE id_paciente = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/pacientes', verificarToken, async (req, res) => {
    try {
        const { nombre, apellido, fecha_nacimiento, telefono, correo, direccion } = req.body;

        if (!nombre || !apellido) {
            return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
        }

        const result = await pool.query(
            'INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, telefono, correo, direccion) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
            [nombre, apellido, fecha_nacimiento || null, telefono, correo, direccion]
        );

        res.json({
            mensaje: 'Paciente añadido correctamente',
            paciente: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/pacientes/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, fecha_nacimiento, telefono, correo, direccion } = req.body;

        if (!nombre || !apellido) {
            return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
        }

        const result = await pool.query(
            'UPDATE pacientes SET nombre = $1, apellido = $2, fecha_nacimiento = $3, telefono = $4, correo = $5, direccion = $6 WHERE id_paciente = $7 RETURNING *',
            [nombre, apellido, fecha_nacimiento || null, telefono, correo, direccion, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json({
            mensaje: 'Paciente editado correctamente',
            paciente: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/pacientes/:id',verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM pacientes WHERE id_paciente = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json({
            mensaje: 'Paciente removido correctamente',
            paciente: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* CONSULTORIOS */

app.get('/consultorios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM consultorios ORDER BY id_consultorio ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/consultorios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM consultorios WHERE id_consultorio = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Consultorio no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/consultorios', verificarToken, async (req, res) => {
    try {
        const { numero_consultorio, disponible } = req.body;

        if (!numero_consultorio) {
            return res.status(400).json({ error: 'El número de consultorio es obligatorio' });
        }

        const result = await pool.query(
            'INSERT INTO consultorios (numero_consultorio, disponible) VALUES ($1,$2) RETURNING *',
            [numero_consultorio, disponible]
        );

        res.json({
            mensaje: 'Consultorio añadido correctamente',
            consultorio: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/consultorios/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { numero_consultorio, disponible } = req.body;

        if (!numero_consultorio) {
            return res.status(400).json({ error: 'El número de consultorio es obligatorio' });
        }

        const result = await pool.query(
            'UPDATE consultorios SET numero_consultorio = $1, disponible = $2 WHERE id_consultorio = $3 RETURNING *',
            [numero_consultorio, disponible, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Consultorio no encontrado' });
        }

        res.json({
            mensaje: 'Consultorio editado correctamente',
            consultorio: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/consultorios/:id',verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM consultorios WHERE id_consultorio = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Consultorio no encontrado' });
        }

        res.json({
            mensaje: 'Consultorio removido correctamente',
            consultorio: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* CITAS */

app.get('/citas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM citas ORDER BY id_cita ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/citas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM citas WHERE id_cita = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/citas', verificarToken, async (req, res) => {
    try {
        const { fecha, hora, motivo, estado, id_paciente, id_doctor, id_consultorio } = req.body;

        if (!fecha || !hora || !id_paciente || !id_doctor || !id_consultorio) {
            return res.status(400).json({
                error: 'Fecha, hora, paciente, doctor y consultorio son obligatorios'
            });
        }

        const result = await pool.query(
            'INSERT INTO citas (fecha, hora, motivo, estado, id_paciente, id_doctor, id_consultorio) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
            [fecha, hora, motivo, estado || 'pendiente', id_paciente, id_doctor, id_consultorio]
        );

        res.json({
            mensaje: 'Cita añadida correctamente',
            cita: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/citas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, hora, motivo, estado, id_paciente, id_doctor, id_consultorio } = req.body;

        if (!fecha || !hora || !id_paciente || !id_doctor || !id_consultorio) {
            return res.status(400).json({
                error: 'Fecha, hora, paciente, doctor y consultorio son obligatorios'
            });
        }

        const result = await pool.query(
            'UPDATE citas SET fecha = $1, hora = $2, motivo = $3, estado = $4, id_paciente = $5, id_doctor = $6, id_consultorio = $7 WHERE id_cita = $8 RETURNING *',
            [fecha, hora, motivo, estado || 'pendiente', id_paciente, id_doctor, id_consultorio, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json({
            mensaje: 'Cita editada correctamente',
            cita: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/citas/:id',verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM citas WHERE id_cita = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json({
            mensaje: 'Cita removida correctamente',
            cita: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* SERVIDOR */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en: http://localhost:${PORT}`);
});