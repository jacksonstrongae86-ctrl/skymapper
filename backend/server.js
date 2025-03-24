const express = require("express");
const cors = require("cors");
const multer = require("multer");
// load dot env
require("dotenv").config();

const xml2js = require("xml2js");
const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const app = express();
const port = process.env.PORT;
const nodemailer = require("nodemailer");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Cors Middleware
app.use(cors());

// Configuración de la sesión
app.use(
  session({
    secret: "your_secret_key", // Cambiar por una clave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }, // 10 minutos
  })
);

// Middleware para verificar si el usuario ha iniciado sesión
const authMiddleware = (req, res, next) => {
  if (req.session.authenticated) {
  return next();
  }
  res.redirect('/login');
};

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

let db;

// Función para conectar a la base de datos con reintento
function connectToDatabase(retries = 10) {
  // Si hay una conexión existente, cerrarla primero
  if (db) {
    db.end((err) => {
      if (err) {
        console.error('Error al cerrar la conexión anterior:', err);
      }
    });
  }

  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.error("Error al conectar a la base de datos:", err.message);

      if (retries > 0) {
        console.log(
          `Reintentando conexión en 3 segundos... (${retries} intentos restantes)`
        );
        setTimeout(() => connectToDatabase(retries - 1), 3000);
      } else {
        console.error(
          "No se pudo conectar a la base de datos después de varios intentos."
        );
        process.exit(1); // Salir del proceso si no se puede conectar
      }
    } else {
      console.log("Conectado a la base de datos MySQL.");
    }
  });

  // Manejar la desconexión
  db.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET" || err.code === "ECONNREFUSED") {
      console.error("Conexión a la base de datos perdida. Reconectando...");
      connectToDatabase();
    } else {
      throw err;
    }
  });
}

// Iniciar la conexión a la base de datos
connectToDatabase();

// Programar reconexión cada hora
setInterval(() => {
  logRequest("Reconexión programada a la base de datos...");
  connectToDatabase();
}, 3600000); // 3600000 ms = 1 hora

// Función helper para logging
const logRequest = (endpoint, params = {}, req = null) => {
  const timestamp = new Date().toISOString();
  const ip = req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : 'No IP';
  console.log(`[${timestamp}] [IP: ${ip}] Petición recibida en ${endpoint}`, params);
};


// Endpoint to send email
app.post("/api/send-email", (req, res) => {
  logRequest("/api/send-email", { name: req.body.name, email: req.body.email }, req);
  const { name, email, phone, message, reference } = req.body;
  logRequest("Sending email to: ", process.env.MAIL_USER);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Error sending email" });
    }
    res.status(200).json({ message: "Email sent successfully" });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Servidor escuchando en http://localhost:${port}`);
});
