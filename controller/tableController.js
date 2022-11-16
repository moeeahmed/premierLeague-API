const getData = require('./dataController');
const Table = require('../models/tableModel');
const catchAsync = require('./../utils/catchAsync');

exports.updateTable = catchAsync(async (req, res) => {
  const start = new Date();
  const { response } = await getData.getTable();
  const resp = response[0].league.standings[0];

  resp.forEach(async (element) => {
    if (element.team.name == 'Manchester United') element.team.name = 'Man Utd';
    if (element.team.name == 'Manchester City') element.team.name = 'Man City';
    if (element.team.name == 'Tottenham') element.team.name = 'Spurs';
    await Table.findOneAndUpdate(
      {
        'team.name': element.team.name,
      },
      {
        ...element,
      },
      { new: true }
    );
  });

  res.status(201).json({
    status: 'success',
    response,
    message: `Table has been updated!`,
    duration: `${new Date() - start}ms`,
  });
});

exports.getTable = catchAsync(async (req, res) => {
  const start = new Date();
  const response = Table.find();

  res.status(201).json({
    status: 'success',
    response,
    duration: `${new Date() - start}ms`,
  });
});
