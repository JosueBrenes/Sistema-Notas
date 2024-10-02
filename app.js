const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

let notes = [];

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// Función para generar IDs únicos
const generateId = () => {
  return notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1;
};

// Función para validar datos de la nota
const validateNote = (note) => {
  const { title, content } = note;
  if (!title || title.trim() === "" || !content || content.trim() === "") {
    return false;
  }
  return true;
};

// Rutas de navegación
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/edit", (req, res) => {
  res.sendFile(__dirname + "/views/edit.html");
});

app.get("/notas", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/notas/:id", (req, res) => {
  res.sendFile(__dirname + "/views/edit.html");
});

// API REST
app.get("/api/notas", (req, res) => {
  res.json(notes);
});

app.get("/api/notas/:id", (req, res) => {
  const { id } = req.params;
  const note = notes.find((note) => note.id == id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).send("Nota no encontrada");
  }
});

app.post("/api/notas", (req, res) => {
  const { title, content, tags } = req.body;
  const newNote = {
    id: generateId(),
    title,
    content,
    tags: tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!validateNote(newNote)) {
    return res.status(400).send("Datos de nota no válidos");
  }

  notes.push(newNote);
  res.status(201).json(newNote);
});

app.put("/api/notas/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  const note = notes.find((note) => note.id == id);

  if (!note) {
    return res.status(404).send("Nota no encontrada");
  }

  note.title = title || note.title;
  note.content = content || note.content;
  note.tags = tags || note.tags;
  note.updatedAt = new Date();

  if (!validateNote(note)) {
    return res.status(400).send("Datos de nota no válidos");
  }

  res.json(note);
});

app.delete("/api/notas/:id", (req, res) => {
  const { id } = req.params;
  notes = notes.filter((note) => note.id != id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
