// backend/index.js
const express = require('express');
const bodyParser = require('body-parser');
const uploadRoutes = require('./routes/upload');

const app = express();

app.use(bodyParser.json());
app.use('/api', uploadRoutes); // Usa la ruta de carga

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
