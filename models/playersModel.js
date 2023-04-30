const mongoose = require('mongoose');
const moment = require('moment');
const validator = require('validator');

//User schema
const playersSchema = mongoose.Schema({
  id: {
    type: String,
    required: [true, 'Please enter the players id'],
  },
  name: {
    type: String,
    required: [true, 'Please enter the players name'],
    lowercase: true,
  },
  firstname: {
    type: String,
    required: [true, 'Please enter the players firstname'],
    lowercase: true,
  },
  lastname: {
    type: String,
    required: [true, 'Please enter the players lastname'],
    lowercase: true,
  },
  nationality: {
    type: String,
    required: [true, 'Please enter the players nationality'],
    lowercase: true,
  },
  league: {
    type: String,
    required: [true, 'Please enter the players current league'],
    lowercase: true,
  },
  photo: { type: String },
  number: {
    type: Number,
    required: [true, 'Please enter the players jersey number'],
  },
  position: {
    type: String,
    required: [true, 'Please enter the current position'],
    lowercase: true,
  },
  team: {
    type: String,
    required: [true, 'Please enter the team name'],
  },
  teamLogo: {
    type: String,
    required: [true, 'Please enter the url for the team logo'],
  },
  birthdate: {
    type: Date,
    required: [true, 'Please enter the players D.o.B'],
  },
});

playersSchema.pre('find', function (next) {
  this.find({ active: { $ne: false } });
  const birthdate = moment(this.birthdate);
  const today = moment();
  const ageInYears = today.diff(birthdate, 'years');
  this.age = ageInYears;
  next();
});

const Players = mongoose.model('Players', playersSchema);
module.exports = Players;
