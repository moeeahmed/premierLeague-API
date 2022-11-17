module.exports = function (strings) {
  let newString = [];

  strings
    .split(' ')
    .forEach((string) =>
      newString.push(string.charAt(0).toUpperCase() + string.substring(1))
    );

  return newString.join(' ');
};
