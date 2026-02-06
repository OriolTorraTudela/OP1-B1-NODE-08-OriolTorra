const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return next(new ErrorResponse('Tasca no trobada', 404));
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ErrorResponse('Validació incorrecta', 400, errors.array()));

    const { title, description, status } = req.body;
    const task = await Task.create({ title, description, status, owner: req.user._id });

    res.status(201).json({ success: true, message: 'Tasca creada', data: task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return next(new ErrorResponse('Tasca no trobada', 404));

    const before = task.toObject();

    const { title, description, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();

    const after = task.toObject();
    const changes = diff(before, after, ['title','description','status']);

    res.json({ success: true, message: 'Tasca actualitzada', data: task, changes });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return next(new ErrorResponse('Tasca no trobada', 404));

    await task.deleteOne();
    res.json({ success: true, message: 'Tasca eliminada' });
  } catch (err) {
    next(err);
  }
};

function diff(before, after, keys) {
  const out = {};
  for (const k of keys) {
    if (before[k] !== after[k]) out[k] = `${before[k]} → ${after[k]}`;
  }
  return out;
}
