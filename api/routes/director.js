const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Director = require('../models/director');
const Messages = require('../../messages/messages');

// GET routes
router.get('/', (req, res, next) => {
  Director.find({})
    .populate('movie')
    .select('name movie_id')
    .exec()
    .then((directorList) => {
      // validation to check if collection is empty
      if (directorList < 1) {
        res.status(200).json({
          message: Messages.director_empty,
        });
      }
      res.status(200).json({
        message: Messages.director,
        directorList,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: {
          message: err.message,
        },
      });
    });
});

// GET  director by id
router.get('/:directorId', (req, res, next) => {
  const directorId = req.params.directorId;

  Director.findById(directorId)
    .select('director _id')
    .populate('movie')
    .exec()
    .then((director) => {
      // validation to check if director is in the collection
      if (!director) {
        console.log(director);
        return res.status(404).json({
          message: Messages.director_not_found,
        });
      }
      res.status(201).json({
        message: Messages.director_found,
        director,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: {
          message: err.message,
        },
      });
    });
});

// POST route
router.post('/', (req, res, next) => {
  Director.find({
    name: req.body.name,
    movie: req.body.movie,
  })
    .exec()
    .then((result) => {
      // validation to check if director is already in database
      if (result.length > 0) {
        return res.status(409).json({
          message: Messages.director_post_duplicated,
        });
      }

      // create director object
      const newDirector = new Director({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        movie: req.body.movie,
      });

      // write new director info to the database
      newDirector
        .save()
        .then((result) => {
          console.log(result);
          res.status(201).json({
            message: Messages.director_submitted,
            director: {
              name: result.name,
              movie: result.movie,
              id: result._id,
            },
            metadata: {
              method: req.method,
              host: req.hostname,
            },
          });
        })
        .catch((err) => {
          console.error(err.message);
          res.status(500).json({
            error: {
              message: err.message,
            },
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: {
              message: Messages.director_post_error,
            },
          });
        });
    });

  // PATCH route
  router.patch('/:directorId', (req, res, next) => {
    const directorId = req.params.directorId;

    const updateDirector = {
      name: req.body.name,
    };

    Director.findByIdAndUpdate(
      {
        _id: directorId,
      },
      {
        $set: updateDirector,
      }
    )
      .exec()
      .then((result) => {
        // validation to check if director is in collection
        if (!directorId) {
          console.log(result);
          res.status(404).json({
            error: {
              message: Messages.director_not_found,
            },
          });
        }
        res.status(200).json({
          message: Messages.director_updated,
          result: {
            name: updateDirector.name,
            movie: updateDirector.movie,
            id: directorId,
          },
          metadata: {
            method: req.method,
            host: req.hostname,
          },
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            message: err.message,
          },
        });
      });
  });

  // DELETE route
  router.delete('/:directorId', (req, res, next) => {
    const directorId = req.params.directorId;

    const deleteDirector = {
      name: req.body.name,
      movie: req.body.movie,
    };
    Director.findByIdAndDelete({ _id: directorId }, { $set: deleteDirector })
      .exec()
      .then((result) => {
        // validation to check if director exists in collection
        if (!directorId) {
          console.log(result);
          res.status(404).json({
            error: {
              message: Messages.director_not_found,
            },
          });
        }
        res.status(200).json({
          message: Messages.director_deleted,
          result,
          request: {
            method: 'GET',
            url: `http://localhost:3000/director/${directorId}`,
          },
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            message: err.message,
          },
        });
      });
  });
});

module.exports = router;
