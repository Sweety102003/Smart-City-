import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';
import connectdb from '../../lib/connect';
import Model from '../../models/3dmodel';
import { GridFSBucket } from 'mongodb';

// Enable edge runtime if needed: export const runtime = 'nodejs';

// POST handler for /api/upload
export async function POST(req) {
  await connectdb();

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !file.name || !file.stream) {
      return NextResponse.json({ message: 'Invalid file upload' }, { status: 400 });
    }

    const filename = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());
    const readableStream = Readable.from(buffer);

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'models' });
    const uploadStream = bucket.openUploadStream(filename);
    readableStream.pipe(uploadStream);

    const fileId = await new Promise((resolve, reject) => {
      uploadStream.on('finish', () => resolve(uploadStream.id));
      uploadStream.on('error', reject);
    });

    // Save metadata to Model collection
    const newModel = new Model({
      filename,
      fileId,
      userId,
      position: { x: 0, y: 0, z: 0 }, // You can update with actual position if needed
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      sceneName: formData.get('sceneName') || 'default',
    });

    await newModel.save();

    return NextResponse.json({ message: 'Model uploaded', modelId: newModel._id }, { status: 200 });
  } catch (err) {
    console.error('Upload Error:', err);
    return NextResponse.json({ message: 'Server Error', error: err.message }, { status: 500 });
  }
}
