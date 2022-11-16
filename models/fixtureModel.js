const mongoose = require('mongoose');
const validator = require('validator');

const fixtureSchema = new mongoose.Schema({
  MatchNumber: Number,
  RoundNumber: Number,
  FixtureId: Number,
  Referee: String,
  Date: {
    type: Date,
    required: [true, 'Please enter the date for this fixture!'],
  },
  Location: String,
  HomeTeam: {
    type: String,
    required: [true, 'Please enter the home team name!'],
  },
  AwayTeam: {
    type: String,
    required: [true, 'Please enter the away team name!'],
  },
  HomeTeamScore: {
    type: Number,
    required: [true, 'Please enter the home team score'],
    default: null,
  },
  AwayTeamScore: {
    type: Number,
    required: [true, 'Please enter the away team score'],
    default: null,
  },
  Status: {
    type: String,
    enum: ['Not Started', 'Live', 'Finished', 'Postponed'],
    required: [true, 'Please enter status of the fixture'],
    default: 'Not Started',
  },
  Postponed: {
    type: Boolean,
    default: false,
  },
  Statistics: [
    {
      'Shots on Goal': Number,
      'Shots off Goal': Number,
      'Total Shots': Number,
      'Blocked Shots': Number,
      'Shots insidebox': Number,
      'Shots outsidebox': Number,
      Fouls: Number,
      'Corner Kicks': Number,
      Offsides: Number,
      'Ball Possession': String,
      'Yellow Cards': Number,
      'Red Cards': Number,
      'Goalkeeper Saves': Number,
      'Total passes': Number,
      'Passes accurate': Number,
      'Passes %': String,
    },
  ],
  LastUpdated: { type: Date, default: Date.now },
});

fixtureSchema.pre('save', async function (next) {
  this.totalShots = this.shotsOnT + this.shotsOffT;
  next();
});

//EXPORT MODEL
module.exports = mongoose.model('Fixture', fixtureSchema);
