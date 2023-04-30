const Players = require('../models/playersModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllPlayers = catchAsync(async (_, res) => {
  const players = await Players.find().select('+age');

  res.status(200).json({
    status: 'success',
    results: players.length,
    players,
  });
});
