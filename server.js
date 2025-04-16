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
})
.then(() => console.log("MongoDB conectado!"))
.catch(err => console.log("Erro ao conectar:", err));

// Modelo de Voto
const VotoSchema = new mongoose.Schema({
  candidato: String,
  data: { type: Date, default: Date.now }
});
const Voto = mongoose.model("Voto", VotoSchema);

// Modelo de Usuário
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// Middleware de autenticação
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ erro: "Token não fornecido." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ erro: "Token inválido." });
  }
}

// Rota de registro
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ erro: "Usuário e senha são obrigatórios." });

  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ erro: "Usuário já existe." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao registrar usuário." });
  }
});

// Rota de login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ erro: "Usuário e senha são obrigatórios." });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ erro: "Usuário não encontrado." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ erro: "Senha incorreta." });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({ mensagem: "Login bem-sucedido", token });
  } catch (error) {
    res.status(500).json({ erro: "Erro no login." });
  }
});

// Rota para votar (protegida)
app.post("/votar", authMiddleware, async (req, res) => {
  const { candidato } = req.body;
  if (!["Lula", "Bolsonaro", "Branco"].includes(candidato)) {
    return res.status(400).send({ error: "Voto inválido!" });
  }
  await new Voto({ candidato }).save();
  res.send({ message: "Voto registrado com sucesso!" });
});

// Rota de candidatos
app.get("/candidatos", async (req, res) => {
  const candidatos = [
    { numero: "13", nome: "Lula", foto: "/imagens/lula.jpg" },
    { numero: "22", nome: "Bolsonaro", foto: "/imagens/bolsonaro.jpg" }
  ];
  res.json(candidatos);
});

// Rota para apurar votos
app.get("/resultado", async (req, res) => {
  const votos = await Voto.aggregate([
    { $group: { _id: "$candidato", total: { $sum: 1 } } }
  ]);
  res.send(votos);
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
