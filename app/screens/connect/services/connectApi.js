// Mock API cho chức năng kết bạn và nhóm

import { AxiosInstance } from "../../../services";

// Tìm kiếm user theo email hoặc phone
export const searchUserByEmail = async (q) => {
  try {
    const res = await AxiosInstance().get(`/connects/searchUser?q=${encodeURIComponent(q)}`);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Gửi lời mời kết bạn (nếu cần)
export const sendFriendRequest = async (userId) => {
  // TODO: Gọi API thực tế nếu có
  return { success: true };
};

// Tạo nhóm mới
export const createGroup = async (eventId, groupName, memberIds, ownerId) => {
  try {
    const body = { eventId, groupName, ownerId, memberIds };
    const res = await AxiosInstance().post(`/connects/createGroup`, body);
    return res;
  } catch (error) {
    console.log(error);
    return null;
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
    const res = await AxiosInstance().get(`/connects/user/${userId}/groups`);
    return res;
  } catch (error) {
    console.log(error);
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
export const updateLocation = async (groupId, userId, latitude, longitude) => {
  try {
    const body = { userId, latitude, longitude };
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