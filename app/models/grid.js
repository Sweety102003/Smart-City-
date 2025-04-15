// models/Model.js
import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

const Grid = mongoose.model('Grid', modelSchema);

export default Grid;
