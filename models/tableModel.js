const mongoose = require('mongoose');
const validator = require('validator');

const tableSchema = new mongoose.Schema(
  {
    team: {
      name: {
        type: String,
        required: [true, 'Please enter the name of the team'],
      },
      logo: {
        type: String,
        validate: [validator.isURL, 'Please enter a valid URL for logo'],
      },
    },
    points: Number,
    goalsDiff: Number,
    form: String,
    all: {
      played: {
        type: Number,
        required: [true, 'Please enter the number of games played'],
      },
      win: {
        type: Number,
        required: [true, 'Please enter the number of games won'],
      },
      draw: {
        type: Number,
        required: [true, 'Please enter the number of games drawn'],
      },
      lose: {
        type: Number,
        required: [true, 'Please enter the number of games lost'],
      },
      goals: {
        for: {
          type: Number,
        },
        against: {
          type: Number,
        },
      },
    },
    lastUpdated: {
      type: Date,
      default: new Date().toISOString,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virutals: true },
  }
);

tableSchema.pre('findOneAndUpdate', function (next) {
  const data = this.getUpdate();
  data.lastUpdated = new Date().toISOString();
  data.points = data.all.win * 3 + data.all.draw;
  data.goalsDiff = data.all.goals.for - data.all.goals.against;
  next();
});

//EXPORT MODEL
module.exports = mongoose.model('Table', tableSchema);
