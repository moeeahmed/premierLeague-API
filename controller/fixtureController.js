const getData = require('./dataController');
const Fixture = require('../models/fixtureModel');
const catchAsync = require('./../utils/catchAsync');
const capitalize = require('./../utils/capitalize');
const helperController = require('../controller/helperController');

//Gets the current fixtures list for the database
exports.getFixture = catchAsync(async (req, res) => {
  const start = new Date();

  const fixture = await helperController.getFixture(req.query);

  res.status(200).json({
    status: 'Success',
    duration: `${new Date() - start}ms`,
    fixture,
  });
});

//Get the average stats of each team for the season
exports.getAverageStats = catchAsync(async (req, res) => {
  const start = new Date();
  //lets get all fixture related to the requested team that are finished
  const team = capitalize(req.query.team);

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
          //  const teams = await Fixture.distinct('HomeTeam');'Ball Possession': { $divide: ['$Ball Possession', '$numOfGames'] },
          'Yellow Cards': { $divide: ['$Yellow Cards', '$numOfGames'] },
          'Red Cards': { $divide: ['$Red Cards', '$numOfGames'] },
          'Goalkeeper Saves': { $divide: ['$Goalkeeper Saves', '$numOfGames'] },
          //'Total passes': { $divide: ['$Total passes', '$numOfGames'] },
          //'Passes accurate': { $divide: ['$Passes accurate', '$numOfGames'] },
          //'Passes %': { $divide: ['$Passes %', '$numOfGames'] },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    duration: `${new Date() - start}ms`,
    team,
    result,
  });
});

//Get the table standing
exports.tableStanding = catchAsync(async (_, res) => {
  const start = new Date();
  const table = await helperController.computeStanding();

  res.status(200).json({
    status: 'Success',
    duration: `${new Date() - start}ms`,
    table,
  });
});

exports.getHome = catchAsync(async (_, res) => {
  const startToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
  const endToday = new Date(new Date().setUTCHours(23, 59, 59));

  const standings = await helperController.computeStanding();

  //Get and render the results documents from the collection
  const results = await Fixture.aggregate([
    { $match: { Status: 'Finished', Date: { $lt: startToday } } },
    { $sort: { Date: -1, MatchNumber: -1 } },
    { $limit: 10 },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$Date' } },
        numOfGames: { $sum: 1 },
        results: {
          $addToSet: {
            HomeTeam: '$HomeTeam',
            AwayTeam: '$AwayTeam',
            HomeTeamScore: '$HomeTeamScore',
            AwayTeamScore: '$AwayTeamScore',
            Status: '$Status',
          },
        },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  //Get and render the fixtures documents from the collection
  const fixtures = await Fixture.aggregate([
    {
      $match: {
        Date: {
          $gte: startToday,
          $lte: endToday,
        },
        Status: {
          $ne: 'Postponed',
        },
      },
    },
    { $sort: { Date: 1, MatchNumber: 1 } },
  ]);

  //Send data to client
  res.status(200).json({
    standings,
    results,
    fixtures,
  });
});

//Get all matches whos scores are missing or are null and update them when admin requests
exports.getScoresToUpdate = catchAsync(async (_, res) => {
  //Get the latest fixture document from the collection
  const fixtures = await Fixture.aggregate([
    { $match: { Status: { $nin: ['Postponed', 'Finished'] } } },
    { $match: { Date: { $lt: new Date() } } },
  ]);

  res.status(200).json({ fixtures });
});
exports.updateFixture = catchAsync(async (req, res, next) => {
  const start = new Date();

  req.body.forEach(async (fixture) => {
    if (!(fixture.Status === 'Status')) {
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
    }
  });

  const plural = req.body.length !== 1 ? 's' : '';
  const verb = req.body.length === 1 ? 'has' : 'have';
  const message = `${req.body.length} game${plural} ${verb} been updated`;

  res.status(200).json({
    status: 'Success',
    duration: `${new Date() - start}ms`,
    message,
  });
});

//Get all matches whos stats are missing or are null and update them when admin requests
exports.getStatsToUpdate = catchAsync(async (_, res) => {
  const fixtures = await Fixture.aggregate([
    {
      $match: {
        $and: [
          { Status: { $ne: 'Postponed' } },
          { Status: { $eq: 'Finished' } },
        ],
      },
    },
    { $match: { 'Statistics.Ball Possession': '0%' } },
    { $sort: { Date: -1 } },
  ]);

  res.status(200).json(fixtures);
});
exports.updateFixtureStats = catchAsync(async (req, res) => {
  const start = new Date();

  const fixtures = await Fixture.aggregate([
    {
      $match: {
        $and: [
          { Status: { $ne: 'Postponed' } },
          { Status: { $eq: 'Finished' } },
        ],
      },
    },
    { $match: { 'Statistics.Ball Possession': '0%' } },
    { $sort: { Date: -1 } },
  ]);

  const fixtureIds = fixtures.map((fixture) => fixture.FixtureId);

  let rateLimit = 0;

  function promiseWithForLoop() {
    return new Promise((resolve, reject) => {
      let ID = 0;

      const interval = setInterval(async () => {
        const stats = await getData.getFixturesStats(fixtureIds[ID]);
        const resp = await getData.getFixtures(fixtureIds[ID]);
        const referee = resp[0].fixture.referee;
        rateLimit = stats.headers['x-ratelimit-requests-remaining'];

        console.log(rateLimit);

        const arr = stats.data.response.map((el) =>
          el.statistics.reduce((obj, els) => {
            obj[els.type] = els.value;
            return obj;
          }, {})
        );

        await Fixture.findOneAndUpdate(
          { FixtureId: fixtureIds[ID] },
          { Referee: referee, Statistics: arr },
          { new: true }
        );

        ID++;
        if (ID >= fixtureIds.length || rateLimit <= 1) {
          clearInterval(interval);
          const message =
            ID >= fixtureIds.length
              ? 'All fixtures updated'
              : 'Reached API call limit';
          resolve(message);
        }
      }, 4000);
    });
  }

  promiseWithForLoop().then((result) => {
    res.status(201).json({
      status: 'Success',
      result,
      duration: `${new Date() - start}ms`,
    });
  });
});

//Fixture page render
exports.getAllFixtures = catchAsync(async (_, res) => {
  const endToday = new Date(new Date().setUTCHours(23, 59, 59));

  //Get and render the fixtures documents from the collection
  const allFixtures = await Fixture.aggregate([
    { $match: { Date: { $lt: endToday } } },
    { $sort: { Date: -1, MatchNumber: -1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$Date' } },
        numOfGames: { $sum: 1 },
        results: {
          $addToSet: {
            HomeTeam: '$HomeTeam',
            AwayTeam: '$AwayTeam',
            Date: '$Date',
            HomeTeamScore: '$HomeTeamScore',
            AwayTeamScore: '$AwayTeamScore',
            Status: '$Status',
            Postponed: '$Postponed',
            Statistics: '$Statistics',
            Referee: '$Referee',
          },
        },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  //Get the latest fixture document from the collection
  const [latestFixture] = await helperController.getFixture({
    Status: 'Finished',
    sort: 'DateDsc',
    limit: 1,
  });

  //get teamsa
  const teams = await Fixture.distinct('HomeTeam');

  res.status(200).json({ teams, allFixtures, latestFixture });
});
