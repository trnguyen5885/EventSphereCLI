export const formatDate = (timeDate: any) => {
  const date = new Date(timeDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const formattedDate = `${day} Tháng ${month}, ${year}`;
  return formattedDate;
};

