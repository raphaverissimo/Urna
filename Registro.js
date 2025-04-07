const mongoose = require('./database');

const RegistroSchema = new mongoose.Schema({
    _id: String,
    hostname: String,
    startTime: Date,
    startTimeLocal: String,
    cmdLine: {
        pid: Number
    },
    buildinfo: Object
});

const Registro = mongoose.model('Registro', RegistroSchema);

module.exports = Registro;
