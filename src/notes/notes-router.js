const express = require('express');
const notesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    notesService.getAllNotes(knexInstance)
      .then((notes) => {
        res.json(notes);
      })
      .catch(next);
  })

  .post(jsonParser, (req, res, next) => {
    const { name, folderid, content } = req.body;
    const newNote = { name, folderid, content };
    console.log(folderid)
    for(const [key, value] of Object.entries(newNote))
      if(value === null) {
        return res.status(400).json({
          error: `${key} missing in request body`
        });
      }

    notesService.insertnote(req.app.get('db'), newNote)
      .then((note) => {
        console.log(note);
        res
          .status(201)
          .location(`/notes/${note.id}`)
          .json(note);
      })
      .catch(next);
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    notesService.getById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: 'note doesn\'t exist' },
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.note);
  })
  .delete((req, res, next) => {
    console.log(req.params)
    notesService
      .deletenote(req.app.get('db'), req.params.note_id)
      .then(() => {
        res.status(204)
          .location('/')
          .end();
      })
      .catch(next);
  });

module.exports = notesRouter;