import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './datas');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage,
  // Only accept csv
  fileFilter: (req, file, cb) => {
    file.mimetype === 'text/csv'
      ? cb(null, true)
      : cb(
          new Error(`${file.mimetype} not supported. Data must be a csv file`)
        );
  },
  // File size maximum of 2mb
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

export const deleteFile = (name) =>
  fs.unlink(`./datas/${name}`, (err) => {
    if (err) throw err.message;
  });

export default upload;
