const mongoose = require('mongoose');

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// create schema and model for storing urls
let urlSchema = new mongoose.Schema({
  short: {
    type: Number,
    unique: true,
    required: true
  },
  expanded: {
    type: String,
    unique: true,
    required: true
  }
});

let urlModel = mongoose.model('Url', urlSchema);

module.exports = urlModel;