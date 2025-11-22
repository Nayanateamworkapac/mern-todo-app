const express = require('express');
const mongoose = require('mongoose');
const tasksRouter = require('./routes/tasks');
const app = express();
const PORT = process.env.PORT || 8080;


app.use(express.json());

// Debug  log for every request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
