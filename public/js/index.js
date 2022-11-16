/* eslint-disable */
import '@babel/polyfill';
import { login, logout, signUp, reset, setNewPassword } from './authentication';
import {
  updateStatistics,
  updateScores,
  updatePassword,
  updateDetails,
} from './update';
import { getFixture, getAvgStats } from './getFixture';

//Functions
const addListenertoLogo = function () {
  document.querySelectorAll('.team-logo').forEach((el) =>
    el.addEventListener('click', async function (e) {
      e.preventDefault();
      const team = e.target.closest('div').dataset.team;

      await getAvgStats(team);
      document.getElementById('average_stats').style.backdropFilter =
        'blur(5px)';
      document.getElementById('average_stats').style.display = 'flex';
    })
  );
};

const openModal = function (modal) {
  modal.style.display = 'flex';
  modal.style.backdropFilter = 'blur(5px)';
};

const closeModal = function (modal) {
  modal.style.display = 'none';
  modal.style.backdropFilter = 'blur(5px)';
};

const updateBtnText = (el, text) => (el.textContent = text);

//EventListeners
if (
  document.querySelector('.form--login') ||
  document.querySelector('.form--signup') ||
  document.querySelector('.form--resetPassword')
) {
  document
    .querySelector('.form--signup')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('emailSignup').value;
      const name = document.getElementById('name').value;
      const password = document.getElementById('passwordSignup').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;

      signUp(name, email, password, passwordConfirm);
    });

  document
    .querySelector('.form--login')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      login(email, password);
    });

  document
    .querySelector('.form--resetPassword')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('emailReset').value;

      reset(email);
    });

  document.querySelectorAll('.login-signup-msg span').forEach((el) =>
    el.addEventListener('click', function (e) {
      closeModal(e.target.closest('.modal'));
      e.target.closest('.modal').id === 'login__modal'
        ? (document.getElementById('cta__modal').style.display = 'flex')
        : (document.getElementById('login__modal').style.display = 'flex');
    })
  );
}

if (document.querySelector('.nav__el--logout')) {
  document.querySelector('.nav__el--logout').addEventListener('click', logout);
}

if (document.getElementById('submit__score')) {
  document
    .getElementById('submit__score')
    .addEventListener('click', async function (e) {
      e.preventDefault();

      updateBtnText(document.getElementById('submit__score'), 'Updating...');

      const update = [];

      document.querySelectorAll('.fixture--update').forEach((el) => {
        const tempObj = {};

        tempObj.HomeTeam = el.children[0].dataset.team;
        tempObj.AwayTeam = el.children[4].dataset.team;
        tempObj.HomeTeamScore = el.children[1].value;
        tempObj.AwayTeamScore = el.children[3].value;
        tempObj.Status =
          el.children[5].value || el.children[5].children[0].textContent;

        update.push(tempObj);
      });

      await updateScores(update);

      updateBtnText(document.getElementById('submit__score'), 'Save Updates');
    });
}

if (document.getElementById('btn--save-setting')) {
  document
    .getElementById('btn--save-setting')
    .addEventListener('click', async function (e) {
      e.preventDefault();

      const form = new FormData();
      form.append('name', document.getElementById('details_name').value);
      form.append('email', document.getElementById('details_email').value);
      form.append('photo', document.getElementById('photo').files[0]);

      document.getElementById('btn--save-setting'), 'Updating...';

      await updateDetails(form);
      updateBtnTextdocument.getElementById('btn--save-setting').textContent =
        'Update Details';
    });
}

if (document.getElementById('btn--save-password')) {
  document
    .getElementById('btn--save-password')
    .addEventListener('click', async function (e) {
      e.preventDefault();

      const currentPassword = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      updateBtnText(document.getElementById('btn--save-password'), 'Saving...');
      await updatePassword({ currentPassword, password, passwordConfirm });
      updateBtnText(
        document.getElementById('btn--save-password'),
        'Save Password'
      );
    });
}

if (document.getElementById('update_stats')) {
  document
    .getElementById('update_stats')
    .addEventListener('click', async function (e) {
      e.preventDefault();

      const fixtureIds = [];

      document
        .querySelectorAll('article')
        .forEach((el) => fixtureIds.push(JSON.parse(el.dataset.json)));

      updateBtnText(document.getElementById('update_stats'), 'Updating...');
      await updateStatistics(fixtureIds);
      updateBtnText(document.getElementById('update_stats'), 'Update Stats');
    });
}

if (document.querySelector('.reset-password')) {
  document
    .querySelector('.reset-password')
    .addEventListener('click', function (e) {
      e.preventDefault();

      openModal(document.getElementById('passReset__modal'));
    });
}

if (document.querySelector('.nav__el--login ')) {
  document
    .querySelector('.nav__el--login ')
    .addEventListener('click', function (e) {
      e.preventDefault();

      openModal(document.getElementById('login__modal'));
    });
}

if (document.querySelector('.nav__el--cta ')) {
  document
    .querySelector('.nav__el--cta ')
    .addEventListener('click', function (e) {
      e.preventDefault();

      openModal(document.getElementById('cta__modal'));
    });
}

if (document.querySelectorAll('.close ')) {
  document.querySelectorAll('.close ').forEach((closeBtn) => {
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeModal(e.target.closest('.modal'));
    });
  });
}

if (document.querySelector('.game')) {
  document.querySelectorAll('.game').forEach((btn) =>
    btn.addEventListener('click', async function (e) {
      e.preventDefault();
      const [HomeTeam, AwayTeam] = e.target
        .closest('div')
        .dataset.fixture.split('vs');

      await getFixture(HomeTeam, AwayTeam);
      addListenertoLogo();
    })
  );
}

if (document.querySelector('.form--newPassword')) {
  document
    .querySelector('.form--newPassword')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      const token = document.getElementById('token').value;
      const password = document.getElementById('passwordReset').value;
      const passwordConfirm = document.getElementById(
        'passwordConfirmReset'
      ).value;

      setNewPassword({ token, password, passwordConfirm });
    });
}

if (document.querySelector('.team-logo')) addListenertoLogo();
