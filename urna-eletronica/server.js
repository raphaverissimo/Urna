require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(__dirname + "/public"));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB conectado!"))
.catch(err => console.log("Erro ao conectar:", err));

// Criar modelo do voto
const VotoSchema = new mongoose.Schema({
    candidato: String,
    data: { type: Date, default: Date.now }
});
const Voto = mongoose.model("Voto", VotoSchema);

// Rota para registrar voto
app.post("/votar", async (req, res) => {
    const { candidato } = req.body;
    if (!["Lula", "Bolsonaro", "Branco"].includes(candidato)) {
        return res.status(400).send({ error: "Voto inválido!" });
    }
    await new Voto({ candidato }).save();
    res.send({ message: "Voto registrado com sucesso!" });
});
app.get("/candidatos", async (req, res) => {
    const candidatos = [
        { numero: "13", nome: "Lula", foto: "/imagens/lula.jpg" },
        { numero: "22", nome: "Bolsonaro", foto: "/imagens/bolsonaro.jpg" }
    ];
    res.json(candidatos);
});
app.use(express.static(__dirname));


// Rota para obter resultados
app.get("/resultado", async (req, res) => {
    const votos = await Voto.aggregate([{ $group: { _id: "$candidato", total: { $sum: 1 } } }]);
    res.send(votos);
});

// Iniciar servidor
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");

    const express = require('express');
const Registro = require('./Registro');
const app = express();
const port = 3000;

app.use(express.json());

// Rota para buscar todos os registros do MongoDB
app.get('/registros', async (req, res) => {
    try {
        const registros = await Registro.find();
        res.json(registros);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar registros' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

});
