# premier-league-data

A webapp that provides data about the current 2022-2023 Premier League Season

# Contents

- [premier-league-data](#premier-league-data)
- [Contents](#contents)
- [Technical details](#technical-details)
- [Additonal Info](#additonal-info)
  - [Information provided](#information-provided)
- [Endpoints](#endpoints)
  - [`[GET]` Get Fixture](#get-get-fixture)
    - [Parameters](#parameters)
    - [Request:](#request)
    - [Response:](#response)
  - [`[GET]` Get Average Stats](#get-get-average-stats)
    - [Parameters](#parameters-1)
    - [Request:](#request-1)
    - [Response:](#response-1)
  - [`[GET]` Get Table Standing](#get-get-table-standing)
    - [Request:](#request-2)
    - [Response:](#response-2)
  - [`[PATCH]` Update Fixtures](#patch-update-fixtures)
    - [Request:](#request-3)
    - [Response:](#response-3)

# Technical details

This project uses what i've learnt currently with HTML5, CSS3, JS, NodeJS, ExpressJS and MongoDB to create a database and render data based on API calls

# Additonal Info

## Information provided

1.  Displays the current premier league standing

    Also shows any active fixtures

    As well it shows past results

    ![homepage](https://user-images.githubusercontent.com/84675458/203622653-b6fabf1b-d542-4507-bbb4-cbf3d326d68d.PNG)

2.  You can deep dive into specific fixtures

    You select fixture from the fixture list on the left

    Or you can use the filter to filter to a specific fixture

    Can see the statistics displayed for each fixture

    ![fixtures](https://user-images.githubusercontent.com/84675458/203622650-98c17e38-6c35-4012-bab4-8b450e6a0606.PNG)

3.  If you click on a specific team logo on this page, it brings their average stats for that point of the season

    This use Chartjs to render a radar chart to get a graphical representation

    ![avgstats](https://user-images.githubusercontent.com/84675458/203622649-fb08abaf-6208-466c-84e9-527b220de827.PNG)

# Endpoints

## `[GET]` Get Fixture

```sh
localhost:PORT/api/v1/fixture/getFixtures
```

Get all fixtures in the league in the 22-23 season

Get fixtures for a specific team by defining the `team` parameter

Get head to head between two teams by defining `HomeTeam` and `AwayTeam` parameters

### Parameters

| Param    | Example                     | Description                                                                        |
| -------- | --------------------------- | ---------------------------------------------------------------------------------- |
| HomeTeam | Arsenal                     | Define HomeTeam                                                                    |
| AwayTeam | Nottingham Forest           | Define AwayTeam                                                                    |
| Team     | Man Utd                     | Define team                                                                        |
| Date     | '2022-11-13' ('YYYY-MM-DD') | Define fixtures at certain dates. Use `[gte] , [lte]` to find games between ranges |
| Status   | 'Finished')                 | Defines status of a game: `Finished, Live, Not Started, Postponed`                 |

### Request:

```js
var axios = require('axios');
var data = { HomeTeam: 'Arsenal', AwayTeam: 'Nottingham Forest' };

var config = {
  method: 'get',
  url: 'localhost:9000/api/v1/fixture/getFixtures',
  data: data,
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
```

### Response:

```json
{
  "status": "Success",
  "duration": "49ms",
  "results": "1",
  "fixture": [
    {
      "MatchNumber": 132,
      "RoundNumber": 14,
      "Date": "2022-10-30T14:00:00.000Z",
      "Location": "Emirates Stadium",
      "HomeTeam": "Arsenal",
      "AwayTeam": "Nottingham Forest",
      "HomeTeamScore": 5,
      "AwayTeamScore": 0,
      "Status": "Finished",
      "Postponed": false,
      "LastUpdated": "2022-10-24T14:21:45.145Z",
      "Statistics": [
        {
          "Shots on Goal": 10,
          "Shots off Goal": 5,
          "Total Shots": 24,
          "Blocked Shots": 9,
          "Shots insidebox": 18,
          "Shots outsidebox": 6,
          "Fouls": 9,
          "Corner Kicks": 9,
          "Offsides": 1,
          "Ball Possession": "69%",
          "Yellow Cards": null,
          "Red Cards": null,
          "Goalkeeper Saves": 2,
          "Total passes": 618,
          "Passes accurate": 551,
          "Passes %": "89%"
        },
        {
          "Shots on Goal": 2,
          "Shots off Goal": 2,
          "Total Shots": 5,
          "Blocked Shots": 1,
          "Shots insidebox": 2,
          "Shots outsidebox": 3,
          "Fouls": 8,
          "Corner Kicks": 4,
          "Offsides": 2,
          "Ball Possession": "31%",
          "Yellow Cards": 1,
          "Red Cards": null,
          "Goalkeeper Saves": 4,
          "Total passes": 275,
          "Passes accurate": 207,
          "Passes %": "75%"
        }
      ],
      "Referee": "Simon Hooper, England"
    }
  ]
}
```

## `[GET]` Get Average Stats

```sh
localhost:PORT/api/v1/fixture/getAverageStats?team=Wolves
```

Gets the average stats of a specific team by defining the required `team` parameter

### Parameters

| Param | Example |                             Description |
| ----- | :-----: | --------------------------------------: |
| team  | Wolves  | team name in which to retrieve data for |

### Request:

```js
var axios = require('axios');
var team = Wolves;

var config = {
  method: 'get',
  url: `localhost:PORT/api/v1/fixture/getAverageStats?team=${Wolves}`,
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
```

### Response:

```json
{
  "status": "Success",
  "duration": "48ms",
  "team": "Wolves",
  "result": [
    {
      "Form": [
        "L",
        "L",
        "D",
        "L",
        "L",
        "W",
        "L",
        "L",
        "L",
        "W",
        "D",
        "D",
        "L",
        "D",
        "L"
      ],
      "Played": 15,
      "GF": 8,
      "GA": 24,
      "GD": -16,
      "Wins": 2,
      "Losses": 9,
      "Draws": 4,
      "Points": 10,
      "avgStats": {
        "Shots on Goal": 2.8666666666666667,
        "Shots off Goal": 4.2,
        "Total Shots": 9.333333333333334,
        "Blocked Shots": 2.2666666666666666,
        "Shots insidebox": 5.666666666666667,
        "Shots outsidebox": 3.6666666666666665,
        "Fouls": 9.266666666666667,
        "Corner Kicks": 4.133333333333334,
        "Offsides": 1.4,
        "Yellow Cards": 1.7333333333333334,
        "Red Cards": 0.2,
        "Goalkeeper Saves": 2.3333333333333335
      }
    }
  ]
}
```

## `[GET]` Get Table Standing

```sh
localhost:PORT/api/v1/fixture/tableStanding
```

Returns JSON from the current premier league 2022-2023 table standings in order 1st - 20th

### Request:

```js
var axios = require('axios');

var config = {
  method: 'get',
  url: 'localhost:PORT/api/v1/fixture/tableStanding',
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
```

### Response:

```json
{
    "status": "Success",
    "duration": "504ms",
    "table": [
        {
            "Team": "Arsenal",
            "Form": ["W","W","W","D","W","W","W","W","L","W","W","W","W","W"],
            "Played": 14,
            "GF": 33,
            "GA": 11,
            "GD": 22,
            "Wins": 12,
            "Losses": 1,
            "Draws": 1,
            "Points": 37
        },
        {
            "Team": "Man City",
            "Form": ["L","W","W","W","L","W","W","W","D","W","W","D","W","W"],
            "Played": 14,
            "GF": 40,
            "GA": 14,
            "GD": 26,
            "Wins": 10,
            "Losses": 2,
            "Draws": 2,
            "Points": 32
        },
        ...
```

## `[PATCH]` Update Fixtures

```sh
localhost:PORT/api/v1/fixture/tableStanding
```

Update fixture results from the GUI

Input score for home and away team along with the status of the fixture

**_This requires user be signed in and have admin rigthts_**

### Request:

```js
var axios = require('axios');
var data = '[{
    "HomeTeam": "Wolves",
    "AwayTeam": "Arsenal",
    "HomeTeamScore": 0,
    "AwayTeamScore": 2,
    "Status": "Finished"
}]';

var config = {
  method: 'patch',
  url: 'localhost:PORT/api/v1/fixture/updateFixture',
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
```

### Response:

```json
{
  "status": "Success",
  "duration": "98ms"
}
```
