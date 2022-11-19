/* eslint-disable */
import '@babel/polyfill';
import {
  login,
  logout,
  signUp,
  reset,
  setNewPassword,
  deleteAccount,
} from './authentication';
import {
  updateStatistics,
  updateScores,
  updatePassword,
  updateDetails,
} from './update';
import { getFixture, getAvgStats } from './getFixture';

//BUTTONS
const loginBtn = document.querySelector('.nav__el--login');
const signUpBtn = document.querySelector('.nav__el--cta ');
const logoutBtn = document.querySelector('.nav__el--logout');
const modalCloseBtns = document.querySelectorAll('.close');
const resetPassBtn = document.querySelector('.reset-password');
const deleteAcc = document.querySelector('.side-nav li:nth-child(2) a');

//MODALS
const loginModal = document.getElementById('login__modal');
const signupModal = document.getElementById('cta__modal');
const passResetModal = document.getElementById('passReset__modal');

//FORMS
const signUpForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const resetPassForm = document.querySelector('.form--resetPassword');
const msg = document.querySelectorAll('.login-signup-msg span');

const sumbitScores = document.getElementById('submit__score');
const saveSettings = document.getElementById('btn--save-setting');
const savePassword = document.getElementById('btn--save-password');
const updateStats = document.getElementById('update_stats');
const individualGames = document.querySelectorAll('.game');
const newPasswordSet = document.querySelector('.form--newPassword');
const teamLogo = document.querySelector('.team-logo');

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

const closeModal = (modal) => (modal.style.display = 'none');
const updateBtnText = (el, text) => (el.textContent = text);

//EventListeners
signUpForm?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('emailSignup').value;
  const name = document.getElementById('name').value;
  const password = document.getElementById('passwordSignup').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  updateBtnText(e.target.querySelector('button'), 'Creating Account...');
  await signUp(name, email, password, passwordConfirm);
  updateBtnText(e.target.querySelector('button'), 'Sign up');
});

loginForm?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  updateBtnText(e.target.querySelector('button'), 'Logging in...');
  await login(email, password);
  updateBtnText(e.target.querySelector('button'), 'Login');
});

resetPassForm?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('emailReset').value;

  updateBtnText(e.target.querySelector('button'), 'sending reset token...');
  await reset(email);
  closeModal(passResetModal);
  updateBtnText(e.target.querySelector('button'), 'reset');
});

msg?.forEach((el) =>
  el?.addEventListener('click', function (e) {
    closeModal(e.target.closest('.modal'));

    e.target.closest('.modal').id === 'login__modal'
      ? openModal(signupModal)
      : openModal(loginModal);
  })
);

logoutBtn?.addEventListener('click', logout);

resetPassBtn?.addEventListener('click', function (e) {
  e.preventDefault();
  closeModal(loginModal);
  openModal(passResetModal);
});

[loginBtn, signUpBtn].forEach((el) =>
  el?.addEventListener('click', function (e) {
    e.preventDefault();

    const type = e.target.classList.value.split('--')[1];

    openModal(document.getElementById(`${type}__modal`));
  })
);

deleteAcc?.addEventListener('click', function (e) {
  e.preventDefault();

  deleteAccount();
});

modalCloseBtns.forEach((closeBtn) => {
  closeBtn?.addEventListener('click', function (e) {
    e.preventDefault();

    closeModal(e.target.closest('.modal'));
  });
});

sumbitScores?.addEventListener('click', async function (e) {
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

saveSettings?.addEventListener('click', async function (e) {
  e.preventDefault();

  const form = new FormData();
  form.append('name', document.getElementById('details_name').value);
  form.append('email', document.getElementById('details_email').value);
  form.append('photo', document.getElementById('photo').files[0]);

  updateBtnText(document.getElementById('btn--save-setting'), 'Updating...');

  await updateDetails(form);
  updateBtnText(document.getElementById('btn--save-setting'), 'Update Details');
});

savePassword?.addEventListener('click', async function (e) {
  e.preventDefault();

  const currentPassword = document.getElementById('password-current').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;

  updateBtnText(document.getElementById('btn--save-password'), 'Saving...');
  await updatePassword({ currentPassword, password, passwordConfirm });
  updateBtnText(document.getElementById('btn--save-password'), 'Save Password');
});

updateStats?.addEventListener('click', async function (e) {
  e.preventDefault();

  const fixtureIds = [];

  document
    .querySelectorAll('article')
    .forEach((el) => fixtureIds.push(JSON.parse(el.dataset.json)));

  updateBtnText(document.getElementById('update_stats'), 'Updating...');
  await updateStatistics(fixtureIds);
  updateBtnText(document.getElementById('update_stats'), 'Update Stats');
});

individualGames?.forEach((btn) =>
  btn.addEventListener('click', async function (e) {
    e.preventDefault();
    const [HomeTeam, AwayTeam] = e.target
      .closest('div')
      .dataset.fixture.split('vs');

    await getFixture(HomeTeam, AwayTeam);
    addListenertoLogo();
  })
);

newPasswordSet?.addEventListener('submit', function (e) {
  e.preventDefault();
  const token = document.getElementById('token').value;
  const password = document.getElementById('passwordReset').value;
  const passwordConfirm = document.getElementById('passwordConfirmReset').value;

  setNewPassword({ token, password, passwordConfirm });
});

if (teamLogo) addListenertoLogo();
