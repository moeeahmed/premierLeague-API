const Fixture = require('../models/fixtureModel');

//Compute stadings for fixtures
exports.computeStanding = async function () {
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

  //Use aggregation pipeline the data required in the following steps:
  // 1) iterate through teams and query DB
  // 2) accumulate required fields and group together by team name
  //        Will need to calculate results using $cond states along with operators
  // 3) map objs into array to get an array of objects
  let table = await Promise.all(
    teams.map(
      async (team) =>
        (
          await Fixture.aggregate([
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

  //return the table (will return a promise which we'll need to await)
  return table;
};
