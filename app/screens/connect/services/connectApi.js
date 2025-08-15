// Mock API cho chức năng kết bạn và nhóm

import { AxiosInstance } from "../../../services";

// Tìm kiếm user theo email hoặc phone
export const searchUserByEmail = async (q) => {
  try {
    console.log('🔍 Searching user with email:', q);
    const res = await AxiosInstance().get(`/connects/searchUser?q=${encodeURIComponent(q)}`);
    console.log('✅ Search result:', res);
    return res;
  } catch (error) {
    console.error('❌ Search user error:', error);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

// Gửi lời mời kết bạn (nếu cần)
export const sendFriendRequest = async (userId) => {
  // TODO: Gọi API thực tế nếu có
  return { success: true };
};

// Tạo nhóm mới
export const createGroup = async (eventId, groupName, memberIds, ownerId, showtimeId) => {
  try {
    console.log('📝 Creating group with data:', { eventId, groupName, memberIds, ownerId, showtimeId });
    const body = { eventId, groupName, ownerId, memberIds, showtimeId };
    console.log('📤 Request body:', body);
    
    const res = await AxiosInstance().post(`/connects/createGroup`, body);
    console.log('✅ Create group response:', res);
    console.log('✅ Response type:', typeof res);
    console.log('✅ Response keys:', res ? Object.keys(res) : 'null');
    
    // AxiosInstance đã trả về response.data rồi
    return res;
  } catch (error) {
    console.error('❌ Create group error:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error; // Throw error để component có thể handle
  }
};

// Mời thành viên vào group
export const inviteToGroup = async (groupId, email) => {
  try {
    const body = { email };
    const res = await AxiosInstance().post(`/connects/${groupId}/invite`, body);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Lấy danh sách lời mời
export const getGroupInvites = async (groupId) => {
  try {
    const res = await AxiosInstance().get(`/connects/${groupId}/invites`);
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getGroupInvited = async (userId) => {
  try {
    const res = await AxiosInstance().get(`/connects/invited/${userId}`);
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Chấp nhận lời mời
export const acceptInvite = async (groupId, userId) => {
  try {
    const body = { userId };
    const res = await AxiosInstance().post(`/connects/${groupId}/accept`, body);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Từ chối lời mời
export const declineInvite = async (groupId, userId) => {
  try {
    const body = { userId };
    const res = await AxiosInstance().post(`/connects/${groupId}/decline`, body);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Rời group
export const leaveGroup = async (groupId, userId) => {
  try {
    const body = { userId };
    const res = await AxiosInstance().post(`/connects/${groupId}/leave`, body);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Xóa group
export const deleteGroup = async (groupId) => {
  try {
    const res = await AxiosInstance().delete(`/connects/delete/${groupId}`);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Lấy group theo event
export const getGroupsByEvent = async (eventId) => {
  try {
    const res = await AxiosInstance().get(`/connects/by-event/${eventId}`);
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Lấy group của user
export const getGroupsByUser = async (userId) => {
  try {
    console.log('📋 Getting groups by user:', userId);
    const res = await AxiosInstance().get(`/connects/user/${userId}/groups`);
    console.log('✅ Groups by user response:', res);
    console.log('✅ Response type:', typeof res);
    console.log('✅ Response length:', Array.isArray(res) ? res.length : 'not array');
    return res;
  } catch (error) {
    console.error('❌ Get groups by user error:', error);
    console.error('Error details:', error.response?.data || error.message);
    return [];
  }
};

// Lấy danh sách thành viên nhóm
export const getGroupMembers = async (groupId) => {
  try {
    const res = await AxiosInstance().get(`/connects/${groupId}/members`);
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Cập nhật vị trí của user trong nhóm
export const updateLocation = async (groupId, userId, latitude, longitude, isSharing) => {
  try {
    const body = { userId, latitude, longitude, isSharing };
    const res = await AxiosInstance().post(`/connects/${groupId}/location`, body);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Lấy vị trí các thành viên trong nhóm
export const getGroupLocations = async (groupId) => {
  try {
    const res = await AxiosInstance().get(`/connects/${groupId}/locations`);
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
}; 