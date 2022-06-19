import APIError from '../errors/APIErrors.js';

export default (err, req, res, next) => {
  // Custom API errors
  if (err instanceof APIError)
    return res.status(err.statusCode).json({ message: err.message });

  // DB related

  // Duplicate email
  if (err.code === 11000)
    return res.status(500).json({ message: 'Email already exist' });

  // Validation error
  if (
    err._message === 'User validation failed' ||
    err._message === 'Validation failed'
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
    return res.status(400).json({ message: 'Invalid _id format' });

  // Validation error
  // if (err.name === 'ValidationError') {
  //   const inputs = Object.keys(err.errors);
  //   return res.status(400).json({ message: 'Invalid _id format', inputs });
  // }

  res.status(500).json(err);
  // res
  //   .status(500)
  //   .json({ message: 'Something went wrong, please try again later.' })
};
