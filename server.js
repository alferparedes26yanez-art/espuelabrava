require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://alferparedes26yanez_db_user:RFXu15y594lYXLjJ@espuelabrava.7jfvjeu.mongodb.net/?appName=espuelabrava";

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function start() {
  try {
    await client.connect();
    // Optional: ping to confirm
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Conectado a MongoDB Atlas');

    // Provide db on request object for handlers
    app.use((req, res, next) => {
      req.dbClient = client;
      req.db = client.db(process.env.DB_NAME || 'espuela_db');
      next();
    });

    // Minimal API required by frontend in `public/`
    app.get('/api/health', (req, res) => {
      res.json({ ok: true });
    });

    // Ensure state document and seed users if needed
    const ensureInitialData = async () => {
      const db = client.db(process.env.DB_NAME || 'espuela_db');
      const estadoCol = db.collection('estado');
      const usersCol = db.collection('users');

      const estado = await estadoCol.findOne({ _id: 'singleton' });
      if (!estado) {
        await estadoCol.insertOne({
          _id: 'singleton',
          tiempoRestante: 60,
          apuestasAbiertas: false,
          numPelea: 1,
          cuotaRojo: 1.8,
          cuotaAzul: 1.8
        });
        console.log('Estado inicial creado');
      }

      const anyUser = await usersCol.findOne({});
      if (!anyUser) {
        await usersCol.insertMany([
          { nombre: 'Admin', user: 'admin', pass: 'admin', rol: 'admin', saldo: 0 },
          { nombre: 'Cliente Demo', user: 'cliente', pass: 'cliente', rol: 'client', saldo: 100 }
        ]);
        console.log('Usuarios de prueba creados: admin/admin, cliente/cliente');
      }
    };

    await ensureInitialData();

    // Public endpoints used by frontend
    app.post('/api/login', async (req, res) => {
      try {
        const { user, pass } = req.body;
        if (!user || !pass) return res.status(400).json({ error: 'Faltan credenciales' });
        const col = req.db.collection('users');
        const u = await col.findOne({ user, pass });
        if (!u) return res.status(401).json({ error: 'Credenciales inválidas' });
        const out = { nombre: u.nombre, user: u.user, rol: u.rol, saldo: u.saldo };
        res.json(out);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
      }
    });

    app.get('/api/estado', async (req, res) => {
      try {
        const estado = await req.db.collection('estado').findOne({ _id: 'singleton' });
        if (!estado) return res.status(404).json({ error: 'Estado no inicializado' });
        res.json({ tiempoRestante: estado.tiempoRestante, apuestasAbiertas: estado.apuestasAbiertas, numPelea: estado.numPelea, cuotaRojo: estado.cuotaRojo, cuotaAzul: estado.cuotaAzul });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
      }
    });

    app.post('/api/register', async (req, res) => {
      try {
        const { nombre, user, pass } = req.body;
        if (!nombre || !user || !pass) return res.status(400).json({ error: 'Faltan datos' });
        const col = req.db.collection('users');
        const exists = await col.findOne({ user });
        if (exists) return res.status(409).json({ error: 'Usuario ya existe' });
        const doc = { nombre, user, pass, rol: 'client', saldo: 0 };
        await col.insertOne(doc);
        res.json({ ok: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
      }
    });

    // Simple admin controls (no auth) — for demo only
    app.post('/api/admin/estado', async (req, res) => {
      try {
        const updates = req.body || {};
        await req.db.collection('estado').updateOne({ _id: 'singleton' }, { $set: updates });
        const estado = await req.db.collection('estado').findOne({ _id: 'singleton' });
        res.json(estado);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
      }
    });

    // Pagar ganadores: simple simulación que ajusta saldos (demo)
    app.post('/api/admin/pagar', async (req, res) => {
      try {
        const { ganador } = req.body;
        if (!ganador) return res.status(400).json({ error: 'Falta ganador' });
        // For demo: find all bets collection entries and pay winners (not implemented bets storage)
        // We'll just respond OK to indicate endpoint exists.
        res.json({ ok: true, ganador });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
      }
    });

    const server = app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Cerrando servidor y conexión a BD...');
      server.close();
      await client.close();
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ Error arrancando la aplicación:', err);
    process.exit(1);
  }
}

start();
