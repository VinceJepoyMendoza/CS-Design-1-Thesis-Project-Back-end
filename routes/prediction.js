import express from 'express';
import APIError from '../errors/APIErrors.js';
import upload, { deleteFile } from '../middleware/upload.js';
import { PythonShell } from 'python-shell';

const router = express.Router();

// prediction route
router.post('/create', upload.single('data'), async (req, res) => {
  // File not found
  if (!req.file) throw APIError.notFound('Please pass Sales csv file');

  const { productName, price, date, quantity, location } = req.body;

  // Missing prediction attributes value
  if ((!productName || !price || !date, !quantity || !location))
    throw APIError.notFound(
      "Please provide the following: 'Product', 'Price', 'Date', 'Quantity' and 'Location'"
    );

  const fileName = req.file.filename;

  const options = {
    args: [fileName, productName, price, date, location, quantity],
  };

  // Run python script for sales prediction
  PythonShell.run('prediction.py', options, (err, resp) => {
    if (err) {
      // Delete file
      deleteFile(fileName);

      return res.status(500).json({ message: err.message });
    }

    // Convert string resp to json
    const parsedRespond = JSON.parse(resp);

    // Delete file after prediction is done
    // deleteFile(fileName);

    res.status(201).json({ data: parsedRespond });
  });
});

export default router;
