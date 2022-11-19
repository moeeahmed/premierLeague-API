/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Sign up successful, Welcome!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', `Welcome ${res.data.data.user.name.split(' ')[0]}`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logging out');
      window.setTimeout(() => {
        location.reload(true);
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Error logging out: try again');
  }
};

export const reset = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/forgotPassword',
      data: { email },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Reset link has been sent to your email');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const setNewPassword = async (obj) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/user/resetPassword',
      data: obj,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'New Password set. Log in again');
      window.setTimeout(() => {
        location.reload(true);
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteAccount = async () => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: '/api/v1/user/deleteAccount',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account Deleted');
      window.setTimeout(() => {
        location.reload(true);
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
