const express = require('express');
const mongoose = require('mongoose');
const tasksRouter = require('./routes/tasks');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/tasks', tasksRouter);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
