"use strict";

const noteCtrl = require('./src/noteCtrl');

module.exports.createNote = noteCtrl.create;

module.exports.updateNote = noteCtrl.update;
  
module.exports.deleteNote = noteCtrl.remove;
  
module.exports.getAllNote = noteCtrl.getAll;

module.exports.getOne = noteCtrl.getOne;
