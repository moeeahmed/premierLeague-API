const Table = require('../models/tableModel');
const Users = require('../models/userModel');
const Fixtures = require('../models/fixtureModel');
const catchAsync = require('../utils/catchAsync');

//Login page render
exports.login = catchAsync(async (_, res) => {
  res.status(200).render('login', {
    title: 'Log into you account',
  });
});

//Signup page render
exports.signUp = catchAsync(async (_, res) => {
  res.status(200).render('sign_up', {
    title: 'Sign up for an account',
  });
});

//Home page render
exports.getHome = catchAsync(async (_, res) => {
  const startToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
  const endToday = new Date(new Date().setUTCHours(23, 59, 59));

  //Get and render the table documents from the collection
  const standings = await Table.aggregate([
    { $sort: { points: -1, goalsDiff: -1 } },
    {
      $project: {
        _id: 0,
        __v: 0,
      },
    },
  ]);

  //Get and render the results documents from the collection
  const results = await Fixtures.aggregate([
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
  const fixtures = await Fixtures.aggregate([
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

  //build template and render template
  res.status(200).render('home', {
    standings,
    results,
    fixtures,
  });
});

//Account page render
exports.accountSettings = catchAsync(async (_, res) => {
  const startToday = new Date(new Date().setUTCHours(0, 0, 0));
  const endToday = new Date(new Date().setUTCHours(23, 59, 59));

  //Get and render the fixtures documents from the collection
  const fixtures = await Fixtures.aggregate([
    {
      $match: {
        Date: {
          $gte: startToday,
          $lte: endToday,
        },
        Status: {
          $ne: 'Finished',
        },
      },
    },
    { $sort: { Date: 1, MatchNumber: 1 } },
  ]);

  res.status(200).render('account_settings');
});

//Fixture page render
exports.getAllFixtures = catchAsync(async (_, res) => {
  const endToday = new Date(new Date().setUTCHours(23, 59, 59));

  //Get and render the fixtures documents from the collection
  const allFixtures = await Fixtures.aggregate([
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
  const [latestFixture] = await Fixtures.aggregate([
    { $match: { Status: 'Finished' } },
    { $sort: { Date: -1 } },
    { $limit: 1 },
    {
      $project: {
        _id: 0,
        'Statistics._id': 0,
      },
    },
  ]);

  res.status(200).render('fixtures', { allFixtures, latestFixture });
});

//This may be made redundant, will try to create table from fixtures
//Rather than having a whole seperate document
exports.updateStats = catchAsync(async (_, res) => {
  const fixtures = await Fixtures.aggregate([
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

  res.status(200).render('update_stats', { fixtures });
});

exports.updateScore = catchAsync(async (_, res) => {
  //Get the latest fixture document from the collection
  const fixtures = await Fixtures.aggregate([
    { $match: { Status: { $nin: ['Postponed', 'Finished'] } } },
    { $match: { Date: { $lt: new Date() } } },
  ]);

  res.status(200).render('update_scores', { fixtures });
});

exports.manageUsers = catchAsync(async (_, res) => {
  //Get the latest fixture document from the collection
  const users = await Users.find();

  res.status(200).render('manage_users', { users });
});

exports.resetPassword = catchAsync(async (_, res) => {
  res.status(200).render('newPassword');
});
