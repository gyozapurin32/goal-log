export const getGoalDate = (date = new Date()) => {
  const shifted = new Date(date);
  shifted.setHours(shifted.getHours() - 3);

  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};