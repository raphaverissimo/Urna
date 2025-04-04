const mongoose = require('./database');

const VotoSchema = new mongoose.Schema({
    candidato: String, // Nome do candidato
    numero: String, // Número do candidato (ex: "13", "22")
    dataHora: { type: Date, default: Date.now } // Hora do voto
});

const Voto = mongoose.model('Voto', VotoSchema);

module.exports = Voto;
