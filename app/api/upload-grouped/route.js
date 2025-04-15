// app/api/upload-grouped/route.js
import connectdb from "../../lib/connect"; // adjust path based on your folder structure
import multer from "multer";
import path from "path";
import fs from "fs";
import Grid from "../../models/grid";
import { NextResponse } from "next/server";

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./public/uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    if (extname !== ".glb") {
      return cb(new Error("Only .glb files are allowed"), false);
    }
    cb(null, true);
  },
}).single("file");

// Helper to convert Multer middleware into a Promise
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

export async function POST(req) {
  await connectdb();

  // Next.js App Router gives you a `Request` object, but multer needs a Node.js request
  const body = await req.formData();
  const file = body.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const fileName = `${Date.now()}_${file.name}`;
  const uploadDir = "./public/uploads/";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  // Save to DB
  try {
    const newModel = new Grid({
      name: file.name,
      fileUrl: `/uploads/${fileName}`,
    });
    await newModel.save();

    return NextResponse.json(
      {
        message: "Grouped model uploaded successfully!",
        model: newModel,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Database save failed" }, { status: 500 });
  }
}
