import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Middleware
import corsOptions from './config/corsOption.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import authenticate from './middleware/authenticate.js';

// Routes import
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import predictRoutes from './routes/prediction.js';

dotenv.config();
const app = express();

app.use(cors(corsOptions));
// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Sales prediction using Gradient Boost Model' });
});

// Routes
app.use('/auth', authRoutes);

// Authenticate request first before proceeding
app.use(authenticate);

app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/predict_sales', predictRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connecting to db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, console.log(`Server is running on port ${PORT}`));
  })
  .catch((error) => console.log(error));
