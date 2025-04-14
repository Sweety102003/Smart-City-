import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  filename: String,
  fileId: mongoose.Schema.Types.ObjectId,
  userId: String,
  sceneName: String,
  position: {
    x: Number,
    y: Number,
    z: Number,
  },
  rotation: {
    x: Number,
    y: Number,
    z: Number,
  },
  scale: {
    x: Number,
    y: Number,
    z: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Model || mongoose.model('Model', modelSchema);
