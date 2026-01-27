/*const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// DIRECCIÓN DE CONEXIÓN CON DNS FORZADO
const MONGO_URI = "mongodb+srv://alferparedes26yanez_db_user:RFXu15y594lYXLjJ@espuelabrava.7jfvjeu.mongodb.net/espuela_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ CONECTADO EXITOSAMENTE A MONGODB ATLAS"))
    .catch(err => {
        console.log("❌ ERROR DE CONEXIÓN:");
        console.error(err.message);
    });

const PORT = 3000;
app.listen(PORT, () => console.log("🚀 Servidor en http://localhost:" + PORT));*/

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://alferparedes26yanez_db_user:RFXu15y594lYXLjJ@espuelabrava.7jfvjeu.mongodb.net/?appName=espuelabrava";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
