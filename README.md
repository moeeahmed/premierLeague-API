# premier-league-data

A webapp that provides data about the current 2022-2023 Premier League Season

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
## [GET] Get Fixture
```sh
localhost:PORT/api/v1/fixture/getFixtures
```
Get all fixtures in the league in the 22-23 season

Get fixtures for a specific team by defining the `team` parameter

Get head to head between two teams by defining `HomeTeam` and `AwayTeam` parameters
### Request:
```js
var axios = require('axios');
var data = {HomeTeam: 'Arsenal', AwayTeam: 'Nottingham Forest'};

var config = {
  method: 'get',
  url: '{{URL}}api/v1/fixture/getFixtures',
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
            "FixtureId": 868077,
            "Referee": "Simon Hooper, England"
        }
    ]
}
```

## [GET] Get Average Stats
## [GET] Get Table Standing

