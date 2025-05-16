import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const formatTime = (isoString: string): string => {
  if (!isoString) return '';
  const date = dayjs(isoString);
  const now = dayjs();

  if (now.isSame(date, 'day')) {
    return date.format('HH:mm');
  }
  if (now.subtract(1, 'day').isSame(date, 'day')) {
    return 'Hôm qua';
  }
  if (now.diff(date, 'day') < 4) {
    return date.fromNow();
  }

  return date.format('DD/MM');
};