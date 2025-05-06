import AxiosInstance from '../../../services/api/AxiosInstance';

export const fetchFriends = async () => {
  const response = await AxiosInstance().get('friends/list');
  return response;
};

export const fetchPendingRequests = async () => {
  const res = await AxiosInstance().get('friends/getPendingRequests');
  return res.requests || [];
};

export const fetchSentRequests = async () => {
  // Nếu có API đúng thì thay endpoint này
  const response = await AxiosInstance().get('friends/sentRequests');
  return response;
};

export const handleSendRequest = async (id, role) => {
  if (role === 'none') {
    const body = { receiverId: id };
    return await AxiosInstance().post(`friends/friendRequest`, body);
  } else if (role === 'sent') {
    return await AxiosInstance().post(`friends/cancelRequest/${id}`);
  } else if (role === 'received') {
    return await AxiosInstance().post(`friends/accept/${id}`);
  } else if (role === 'friend') {
    // Unfriend sẽ xử lý riêng
    return null;
  }
};

export const handleAccept = async (id) => {
  return await AxiosInstance().post(`friends/accept/${id}`);
};

export const handleReject = async (id) => {
  return await AxiosInstance().post(`friends/decline/${id}`);
};

export const handleUnfriend = async (id) => {
  return await AxiosInstance().post(`friends/unfriend/${id}`);
}; 