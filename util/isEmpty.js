// 传入两个值，pre、cur
const isEmpty = (before, after) => {
  if (before) {
    return before;
  } else {
    return after;
  }
};
module.exports = isEmpty;
