//compared object input field against an array of required kets
const filterObj = (obj, ...allowedFields) => {
  let newObj = {};

  //iterate through object and check if key is in required field
  Object.keys(obj).forEach((key) => {
    //if key is present in required field, add to object
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });

  //returns new object filtering out fields not needed
  return newObj;
};

module.exports = filterObj;
