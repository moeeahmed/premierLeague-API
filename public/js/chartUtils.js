'use strict';

export const randomRGBA = function (alpha = 1) {
  const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  return [
    randomNumber(0, 255),
    randomNumber(0, 255),
    randomNumber(0, 255),
    alpha,
  ];
};

export const transparentize = function (r, g, b, alpha) {
  const a = (1 - alpha * 0.5) * 255;
  const calc = (x) => Math.round(((x - a) / alpha) * 0.5);

  return `rgba(${calc(r)}, ${calc(g)}, ${calc(b)}, ${alpha * 0.5})`;
};
