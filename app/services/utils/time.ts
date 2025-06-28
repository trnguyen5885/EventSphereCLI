export const formatTimeRange = (startUnix: number, endUnix: number): string => {
  const start = new Date(startUnix * 1000);
  const end = new Date(endUnix * 1000);

  const format = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return minutes === 0 ? `${hours}:00` : `${hours}:00${minutes.toString().padStart(2, '0')}`;
  };

  return `${format(start)} - ${format(end)}`;
};