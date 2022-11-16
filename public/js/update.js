import axios from 'axios';
import { showAlert } from './alert';

export const updateDetails = async (obj) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/user/updateDetails',
      data: obj,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Details Updated`);
      window.setTimeout(() => {
        location.assign('/account/settings');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.error.message);
  }
};

export const updatePassword = async (obj) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/user/updatePassword',
      data: obj,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Updated Password`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateScores = async (objArr) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/fixture/updateFixture',
      data: objArr,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Updated ${objArr.length} fixture${objArr.length != 1 ? 's' : ''}`
      );
      window.setTimeout(() => {
        location.assign('/admin/update-scores');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateStatistics = async (fixtureIDs) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/fixture/updateStatistics',
      data: fixtureIDs,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Updated ${fixtureIDs.length} fixture${
          fixtureIDs.length != 1 ? 's' : ''
        }`
      );
      window.setTimeout(() => {
        location.assign('/admin/update-stats');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
