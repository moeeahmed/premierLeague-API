import axios from 'axios';
import moment from 'moment/moment';
import { showAlert } from './alert';

export const getAvgStats = async (id) => {
  const overallStats = document.querySelectorAll('.avgTeam-stats dd');
  const teamImg = document.querySelector('.avgTeam-image img');
  const statsList = document.querySelector('.stats--list');
  const team = document.querySelector('.avgTeam-info h2');
  const teamForm = document.querySelector('.avgTeam-info .team-form');

  const color = { L: 'red', D: 'grey', W: 'green' };

  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/fixture/getAverageStats/${id}`,
    });

    team.lastChild.textContent = res.data.team;

    const data = res.data.result[0];

    teamForm.textContent = '';

    for (const [index, el] of Object.entries(data.Form)) {
      if (index > 9) break;
      const html = `<div class="form-indicator" style="background-color:${color[el]};"> </div>`;

      teamForm.insertAdjacentHTML('beforeend', html);
    }

    overallStats[0].textContent = data.Played;
    overallStats[1].textContent = data.Wins;
    overallStats[2].textContent = data.Losses;
    overallStats[3].textContent = data.GF;

    teamImg.src = `/img/${res.data.team.replace(/\s/g, '')}.png`;

    let html = '';
    statsList.textContent = '';
    for (const [key, value] of Object.entries(data.avgStats)) {
      html += `<p><strong>${key}:  </strong>${value.toFixed(2)}</p>`;
    }

    statsList.insertAdjacentHTML('afterbegin', html);
  } catch (err) {
    showAlert('error', 'error getting details');
  }
};

export const getFixture = async (HomeTeam, AwayTeam) => {
  //Initialise DOM elements
  const awayTeamLogo = document.querySelector('.team--away .team-logo img');
  const container = document.querySelector('.match--stats__container');
  const headerH1 = document.querySelector('.header__matchStats h1');
  const homeTeamLogo = document.querySelector('.team--home .team-logo img');

  const matchOverview = document.querySelector('.match--overview');
  const matchReferee = document.querySelector('.match-referee strong');
  const matchScore = document.querySelectorAll('.match-score-number');
  const matchStatus = document.querySelector('.match-time-lapsed');
  const matchTime = document.querySelector('.match-date time');
  const roundNumber = document.querySelector('.match-date p strong');

  const statistics = document.querySelector('.match--stats');
  const teamName = document.querySelectorAll('.team-name');
  const teamLogo = document.querySelectorAll('.team-logo');

  let tempHTML;

  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/fixture/getFixtures/${HomeTeam}-${AwayTeam}`,
    });

    const data = res.data.data[0];

    const [homeStats, awayStats] = data?.Statistics;
    let stats = '';

    if (homeStats && awayStats) {
      for (const key of Object.keys(homeStats)) {
        const percentage =
          homeStats[key] === awayStats[key]
            ? 0.5
            : parseInt(homeStats[key] || 0) /
              (parseInt(homeStats[key] || 0) + parseInt(awayStats[key] || 0));

        stats += `
        <p style="font-size:16px;text-align:center"><strong>${key}</strong></p>
        <div class="stat__progress">
          <p>${homeStats[key] || 0}</p>
          <progress class="stats" max="100" value=${Math.floor(
            percentage * 100
          )}></progress>
          <p>${awayStats[key] || 0}</p>
        </div>`;
      }
    }

    //replace the header to show corresponding fixture
    headerH1.textContent = `${data.HomeTeam} vs ${data.AwayTeam} Match Statistics`;

    //replace team logos to match corresponding fixture
    homeTeamLogo.src = `/img/${data.HomeTeam.replace(/\s/g, '')}.png`;
    awayTeamLogo.src = `/img/${data.AwayTeam.replace(/\s/g, '')}.png`;

    teamLogo[0].dataset.team = data.HomeTeam;
    teamLogo[1].dataset.team = data.AwayTeam;

    teamName[0].textContent = data.HomeTeam;
    teamName[1].textContent = data.AwayTeam;

    roundNumber.textContent = data.RoundNumber;

    matchTime.textContent = '';
    matchTime.insertAdjacentHTML(
      'afterbegin',
      `${moment(data.Date).format('LL').split(',')[0]} at <strong>${moment(
        data.Date
      ).format('HH:mm')}</strong>`
    );

    matchStatus.textContent = data.Status;

    matchReferee.textContent = `${
      data.Referee ? data.Referee.split(',')[0] : 'Not assigned'
    }`;

    matchScore[0].textContent =
      data.HomeTeamScore === null ? 'P' : data.HomeTeamScore;
    matchScore[1].textContent =
      data.AwayTeamScore === null ? 'P' : data.AwayTeamScore;

    //Depending on which team has won, is winning,
    //there score will be hightlighted to easily see
    //the winning team
    if (data.HomeTeamScore > data.AwayTeamScore) {
      document;
      matchScore[0].classList.add('match-score-number--leading');
      document;
      matchScore[1].classList.remove('match-score-number--leading');
    } else if (data.HomeTeamScore < data.AwayTeamScore) {
      document;
      matchScore[1].classList.add('match-score-number--leading');
      document;
      matchScore[0].classList.remove('match-score-number--leading');
    } else {
      document;
      matchScore.forEach((el) =>
        el.classList.remove('match-score-number--leading')
      );
    }

    //remove statistics section from the page
    //so we can then re-add the HTML
    //to trigger the replay of the animation

    tempHTML = matchOverview.innerHTML;

    matchOverview.remove();
    container.insertAdjacentHTML(
      'afterbegin',
      `<div class="match--overview">${tempHTML}</div>`
    );

    statistics.remove();
    container.insertAdjacentHTML(
      'beforeend',
      `<div class="match--stats slide-animation-UP">${stats}</div>`
    );
  } catch (err) {
    showAlert('error', 'error getting fixture details');
  }
};
