document.addEventListener("DOMContentLoaded", () => {
  const notesGrid = document.getElementById("notes-grid");
  const noteForm = document.getElementById("note-form");
  const deleteNoteButton = document.getElementById("delete-note");
  const searchInput = document.getElementById("search");

  // Función para mostrar mensajes al usuario
  const showMessage = (message, type = "success") => {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 3000);
  };

  // Función para mostrar notas
  const displayNotes = (notes) => {
    notesGrid.innerHTML = "";
    notes.forEach((note) => {
      const noteElement = document.createElement("div");
      noteElement.classList.add("note");
      noteElement.innerHTML = `
                <h2>${note.title}</h2>
                <p>${note.content}</p>
                <small>Creado: ${new Date(
                  note.createdAt
                ).toLocaleString()}</small>
                <small>Modificado: ${new Date(
                  note.updatedAt
                ).toLocaleString()}</small>
                <small>Etiquetas: ${note.tags.join(", ")}</small>
                <button onclick="editNote(${note.id})">Editar</button>
            `;
      notesGrid.appendChild(noteElement);
    });
  };

  // Función para obtener notas desde el servidor
  const fetchNotes = () => {
    fetch("/api/notas")
      .then((response) => response.json())
      .then((notes) => displayNotes(notes))
      .catch((error) => showMessage("Error al obtener notas", "error"));
  };

  // Función para guardar/actualizar una nota
  const saveNote = (event) => {
    event.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const tags = document
      .getElementById("tags")
      .value.split(",")
      .map((tag) => tag.trim());
    const noteId = noteForm.dataset.noteId;

    if (noteId) {
      fetch(`/api/notas/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags }),
      })
        .then((response) => response.json())
        .then(() => {
          showMessage("Nota actualizada con éxito");
          window.location.href = "/";
        })
        .catch((error) => showMessage("Error al actualizar la nota", "error"));
    } else {
      fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags }),
      })
        .then((response) => response.json())
        .then(() => {
          showMessage("Nota creada con éxito");
          window.location.href = "/";
        })
        .catch((error) => showMessage("Error al crear la nota", "error"));
    }
  };

  // Función para eliminar una nota
  const deleteNote = () => {
    const noteId = noteForm.dataset.noteId;
    if (noteId) {
      fetch(`/api/notas/${noteId}`, {
        method: "DELETE",
      })
        .then(() => {
          showMessage("Nota eliminada con éxito");
          window.location.href = "/";
        })
        .catch((error) => showMessage("Error al eliminar la nota", "error"));
    }
  };

  // Función para editar una nota
  window.editNote = (id) => {
    window.location.href = `/edit?id=${id}`;
  };

  // Función para obtener una nota por ID
  const fetchNoteById = (id) => {
    fetch(`/api/notas/${id}`)
      .then((response) => response.json())
      .then((note) => {
        document.getElementById("title").value = note.title;
        document.getElementById("content").value = note.content;
        document.getElementById("tags").value = note.tags.join(", ");
        noteForm.dataset.noteId = note.id;
      })
      .catch((error) => showMessage("Error al obtener la nota", "error"));
  };

  // Función para buscar y filtrar notas
  const filterNotes = (event) => {
    const query = event.target.value.toLowerCase();
    fetch("/api/notas")
      .then((response) => response.json())
      .then((notes) => {
        const filteredNotes = notes.filter((note) => {
          return (
            note.title.toLowerCase().includes(query) ||
            note.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        });
        displayNotes(filteredNotes);
      })
      .catch((error) => showMessage("Error al filtrar notas", "error"));
  };

  if (notesGrid) {
    fetchNotes();
  }

  if (noteForm) {
    noteForm.addEventListener("submit", saveNote);
    deleteNoteButton.addEventListener("click", deleteNote);

    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get("id");
    if (noteId) {
      fetchNoteById(noteId);
      deleteNoteButton.style.display = "block";
    } else {
      deleteNoteButton.style.display = "none";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterNotes);
  }
});
