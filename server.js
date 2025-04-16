// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB conectado!")).catch(err => console.log("Erro ao conectar:", err));

// Modelos
const VotoSchema = new mongoose.Schema({
    candidato: String,
    data: { type: Date, default: Date.now }
});
const Voto = mongoose.model("Voto", VotoSchema);

const UsuarioSchema = new mongoose.Schema({
    username: String,
    password: String
});
const Usuario = mongoose.model("Usuario", UsuarioSchema);

// Rotas
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

app.get("/resultado", async (req, res) => {
    const votos = await Voto.aggregate([{ $group: { _id: "$candidato", total: { $sum: 1 } } }]);
    res.send(votos);
});

// Rota para criar novo usuário
app.post("/registro", async (req, res) => {
    const { username, password } = req.body;
    const usuarioExistente = await Usuario.findOne({ username });
    if (usuarioExistente) {
        return res.status(400).json({ erro: "Usuário já existe!" });
    }
    const senhaCriptografada = await bcrypt.hash(password, 10);
    const novoUsuario = new Usuario({ username, password: senhaCriptografada });
    await novoUsuario.save();
    res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });
});

// Rota de login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
        return res.status(401).json({ erro: "Usuário ou senha inválidos!" });
    }
    const senhaCorreta = await bcrypt.compare(password, usuario.password);
    if (!senhaCorreta) {
        return res.status(401).json({ erro: "Usuário ou senha inválidos!" });
    }
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ mensagem: "Login bem-sucedido!", token });
});

// Iniciar servidor
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
