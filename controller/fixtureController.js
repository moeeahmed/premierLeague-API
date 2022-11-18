const getData = require('./dataController');
const Fixture = require('../models/fixtureModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const capitalize = require('./../utils/capitalize');

//Gets the current fixtures list for the database
exports.getFixtures = catchAsync(async (req, res) => {
  const start = new Date();

  const [HomeTeam, AwayTeam] = req.params.fixture.split('-');

  const data = await Fixture.aggregate([
    {
      $match: {
        HomeTeam,
        AwayTeam,
      },
    },
    {
      $project: {
        'Statistics._id': 0,
      },
    },
  ]);

  if (!data.length) {
    return next(new AppError('That fixture does not exist'), 404);
  }

  res.status(200).json({
    status: 'success',
    data,
    duration: `${new Date() - start}ms`,
  });
});

exports.updateFixture = catchAsync(async (req, res, next) => {
  const start = new Date();

  req.body.forEach(async (fixture) => {
    await Fixture.findOneAndUpdate(
      { HomeTeam: fixture.HomeTeam, AwayTeam: fixture.AwayTeam },
      {
        HomeTeamScore: fixture.HomeTeamScore,
        AwayTeamScore: fixture.AwayTeamScore,
        Status: fixture.Status,
      },
      {
        runValidators: true,
      }
    );
  });

  res.status(200).json({
    status: 'success',
    duration: `${new Date() - start}ms`,
  });
});

exports.updateFixtureStats = catchAsync(async (req, res) => {
  const start = new Date();

  const data = req.body;

  data.forEach(async (ID) => {
    const stats = await getData.getFixturesStats(ID);
    const resp = await getData.getFixtures(ID);
    const referee = resp[0].fixture.referee;

    const arr = [];
    stats.forEach((el) => {
      const x = {};
      el.statistics.forEach((els) => {
        x[els.type] = els.value;
      });

      arr.push(x);
    });

    await Fixture.findOneAndUpdate(
      { FixtureId: ID },
      { Referee: referee, Statistics: arr },
      { new: true }
    );
  });

  res.status(201).json({
    status: 'success',
    duration: `${new Date() - start}ms`,
  });
});

exports.getAverageStats = catchAsync(async (req, res) => {
  //lets get all fixture related to the requested team that are finished

  const team = capitalize(req.params.team);

  const result = await Fixture.aggregate([
    { $match: { $or: [{ HomeTeam: team }, { AwayTeam: team }] } },
    { $match: { Status: 'Finished' } },
    { $sort: { Date: -1 } },
    {
      $project: {
        _id: 0,
        Team: team,
        form: {
          $cond: [
            { $eq: ['$HomeTeam', team] },
            {
              $cond: [
                { $gt: ['$HomeTeamScore', '$AwayTeamScore'] },
                'W',
                {
                  $cond: [
                    { $eq: ['$HomeTeamScore', '$AwayTeamScore'] },
                    'D',
                    'L',
                  ],
                },
              ],
            },
            {
              $cond: [
                { $gt: ['$AwayTeamScore', '$HomeTeamScore'] },
                'W',
                {
                  $cond: [
                    { $eq: ['$HomeTeamScore', '$AwayTeamScore'] },
                    'D',
                    'L',
                  ],
                },
              ],
            },
          ],
        },
        goalsFor: {
          $cond: [
            { $eq: ['$HomeTeam', team] },
            { $sum: '$HomeTeamScore' },
            { $sum: '$AwayTeamScore' },
          ],
        },
        goalsAgainst: {
          $cond: [
            { $eq: ['$HomeTeam', team] },
            { $sum: '$AwayTeamScore' },
            { $sum: '$HomeTeamScore' },
          ],
        },
        wins: {
          $cond: [
            { $eq: ['$HomeTeam', team] },
            { $cond: [{ $gt: ['$HomeTeamScore', '$AwayTeamScore'] }, 1, 0] },
            { $cond: [{ $gt: ['$AwayTeamScore', '$HomeTeamScore'] }, 1, 0] },
          ],
        },
        draws: {
          $cond: [{ $eq: ['$HomeTeamScore', '$AwayTeamScore'] }, 1, 0],
        },
        Stats: {
          $cond: [
            { $eq: ['$HomeTeam', team] },
            { $arrayElemAt: ['$Statistics', 0] },
            { $arrayElemAt: ['$Statistics', 1] },
          ],
        },
      },
    },
    {
      $group: {
        _id: '$Team',
        form: { $push: '$form' },
        numOfGames: { $sum: 1 },
        GF: { $sum: '$goalsFor' },
        GA: { $sum: '$goalsAgainst' },
        wins: { $sum: '$wins' },
        draws: { $sum: '$draws' },
        'Shots on Goal': { $sum: '$Stats.Shots on Goal' },
        'Shots off Goal': { $sum: '$Stats.Shots off Goal' },
        'Total Shots': { $sum: '$Stats.Total Shots' },
        'Blocked Shots': { $sum: '$Stats.Blocked Shots' },
        'Shots insidebox': { $sum: '$Stats.Shots insidebox' },
        'Shots outsidebox': { $sum: '$Stats.Shots outsidebox' },
        Fouls: { $sum: '$Stats.Fouls' },
        'Corner Kicks': { $sum: '$Stats.Corner Kicks' },
        Offsides: { $sum: '$Stats.Offsides' },
        'Ball Possession': {
          $sum: parseInt('$Stats.Ball Possession'),
        },
        'Ball Possession': {
          $sum: {
            $toInt: {
              $arrayElemAt: [{ $split: ['$Stats.Ball Possession', '%'] }, 0],
            },
          },
        },
        'Yellow Cards': { $sum: '$Stats.Yellow Cards' },
        'Red Cards': { $sum: '$Stats.Red Cards' },
        'Goalkeeper Saves': { $sum: '$Stats.Goalkeeper Saves' },
        'Total passes': { $sum: '$Stats.Total passes' },
        'Passes accurate': { $sum: '$Stats.Passes accurate' },
        'Passes %': {
          $sum: {
            $toInt: {
              $arrayElemAt: [{ $split: ['$Stats.Passes %', '%'] }, 0],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: '$Team',
        Form: '$form',
        Played: '$numOfGames',
        GF: '$GF',
        GA: '$GA',
        GD: { $subtract: ['$GF', '$GA'] },
        Wins: '$wins',
        Losses: { $subtract: ['$numOfGames', { $add: ['$wins', '$draws'] }] },
        Draws: '$draws',
        Points: { $add: [{ $multiply: [3, '$wins'] }, '$draws'] },
        avgStats: {
          'Shots on Goal': { $divide: ['$Shots on Goal', '$numOfGames'] },
          'Shots off Goal': { $divide: ['$Shots off Goal', '$numOfGames'] },
          'Total Shots': { $divide: ['$Total Shots', '$numOfGames'] },
          'Blocked Shots': { $divide: ['$Blocked Shots', '$numOfGames'] },
          'Shots insidebox': { $divide: ['$Shots insidebox', '$numOfGames'] },
          'Shots outsidebox': { $divide: ['$Shots outsidebox', '$numOfGames'] },
          Fouls: { $divide: ['$Fouls', '$numOfGames'] },
          'Corner Kicks': { $divide: ['$Corner Kicks', '$numOfGames'] },
          Offsides: { $divide: ['$Offsides', '$numOfGames'] },
          'Ball Possession': { $divide: ['$Ball Possession', '$numOfGames'] },
          'Yellow Cards': { $divide: ['$Yellow Cards', '$numOfGames'] },
          'Red Cards': { $divide: ['$Red Cards', '$numOfGames'] },
          'Goalkeeper Saves': { $divide: ['$Goalkeeper Saves', '$numOfGames'] },
          'Total passes': { $divide: ['$Total passes', '$numOfGames'] },
          'Passes accurate': { $divide: ['$Passes accurate', '$numOfGames'] },
          'Passes %': { $divide: ['$Passes %', '$numOfGames'] },
        },
      },
    },
  ]);

  res.status(200).json({ team, result });
});

exports.makeTableFromFixtures = catchAsync(async (req, res, next) => {
  //get list of unique teams in the league
  const teamsDoc = await Fixture.aggregate([
    {
      $group: {
        _id: '$HomeTeam',
      },
    },
  ]);

  //flatten object into a singular array with all the teams
  const teams = teamsDoc.map((obj) => obj._id);

  let table = await Promise.all(
    teams.map(
      async (team) =>
        (
          await Fixture.aggregate([
            { $match: { $or: [{ HomeTeam: team }, { AwayTeam: team }] } },
            { $match: { Status: 'Finished' } },
            {
              $project: {
                _id: 0,
                Team: team,
                form: {
                  $cond: [
                    { $eq: ['$HomeTeam', team] },
                    {
                      $cond: [
                        { $gt: ['$HomeTeamScore', '$AwayTeamScore'] },
                        'W',
                        {
                          $cond: [
                            { $eq: ['$HomeTeamScore', '$AwayTeamScore'] },
                            'D',
                            'L',
                          ],
                        },
                      ],
                    },
                    {
                      $cond: [
                        { $gt: ['$AwayTeamScore', '$HomeTeamScore'] },
                        'W',
                        {
                          $cond: [
                            { $eq: ['$HomeTeamScore', '$AwayTeamScore'] },
                            'D',
                            'L',
                          ],
                        },
                      ],
                    },
                  ],
                },
                goalsFor: {
                  $cond: [
                    { $eq: ['$HomeTeam', team] },
                    { $sum: '$HomeTeamScore' },
                    { $sum: '$AwayTeamScore' },
                  ],
                },
                goalsAgainst: {
                  $cond: [
                    { $eq: ['$HomeTeam', team] },
                    { $sum: '$AwayTeamScore' },
                    { $sum: '$HomeTeamScore' },
                  ],
                },
                wins: {
                  $cond: [
                    { $eq: ['$HomeTeam', team] },
                    {
                      $cond: [
                        { $gt: ['$HomeTeamScore', '$AwayTeamScore'] },
                        1,
                        0,
                      ],
                    },
                    {
                      $cond: [
                        { $gt: ['$AwayTeamScore', '$HomeTeamScore'] },
                        1,
                        0,
                      ],
                    },
                  ],
                },
                draws: {
                  $cond: [{ $eq: ['$HomeTeamScore', '$AwayTeamScore'] }, 1, 0],
                },
                Stats: {
                  $cond: [
                    { $eq: ['$HomeTeam', team] },
                    { $arrayElemAt: ['$Statistics', 0] },
                    { $arrayElemAt: ['$Statistics', 1] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$Team',
                form: { $push: '$form' },
                numOfGames: { $sum: 1 },
                GF: { $sum: '$goalsFor' },
                GA: { $sum: '$goalsAgainst' },
                wins: { $sum: '$wins' },
                draws: { $sum: '$draws' },
              },
            },
            {
              $project: {
                _id: 0,
                Team: '$_id',
                Form: '$form',
                Played: '$numOfGames',
                GF: '$GF',
                GA: '$GA',
                GD: { $subtract: ['$GF', '$GA'] },
                Wins: '$wins',
                Losses: {
                  $subtract: ['$numOfGames', { $add: ['$wins', '$draws'] }],
                },
                Draws: '$draws',
                Points: { $add: [{ $multiply: [3, '$wins'] }, '$draws'] },
              },
            },
          ])
        )[0]
    )
  );

  //Sort array of objects by points accumulated
  table.sort((a, b) => b.Points - a.Points);

  res.status(200).json({
    status: 'Success',
    table,
  });
});
