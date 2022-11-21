'use strict';

export const transparentize = function (r, g, b, alpha) {
  const a = (1 - alpha) * 255;
  const calc = (x) => Math.round((x - a) / alpha);

  return `rgba(${calc(r)}, ${calc(g)}, ${calc(b)}, ${alpha})`;
};
