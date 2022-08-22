import APIError from '../errors/APIErrors.js';
import fs from 'fs';

export default (err, req, res, next) => {
  // Delete file
  if (req.file) {
    fs.unlink(`./algo/${req.file.filename}`, (err) => {
      if (err) throw err.message;
    });
  }

  // Custom API errors
  if (err instanceof APIError)
    return res.status(err.statusCode).json({ message: err.message });

  // Invalid file format
  if (err.storageErrors) return res.status(400).json({ message: err.message });

  // DB related

  // Duplicate email
  if (err.code === 11000)
    return res.status(500).json({ message: 'Email already exist' });

  // Validation error
  if (
    err._message === 'User validation failed' ||
    err._message === 'Validation failed' ||
    err._message === 'Product validation failed' ||
    err._message === 'Prediction validation failed'
  ) {
    const inputs = Object.keys(err.errors).map((e) => {
      const errProperties = err.errors[e].properties;

      return {
        type: errProperties.type,
        value: errProperties.value,
        message: errProperties.message,
      };
    });

    return res.status(400).json({ message: err._message, inputs });
  }

  // Invalid _id format
  if (err.name === 'CastError')
    return res
      .status(400)
      .json({ message: 'Error: Invalid user id or user id does not exist' });

  res.status(500).json(err);
  // res
  //   .status(500)
  //   .json({ message: 'Something went wrong, please try again later.' });
};
