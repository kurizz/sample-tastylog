import roundTo from "round-to";

const padding = function(value) {
  if (isNaN(parseFloat(value))) {
    return "-";
  }

  return roundTo(value, 2).toPrecision(3);
};

const round = function(value) {
  return roundTo(value, 2)
}

export {
  padding,
  round,
}