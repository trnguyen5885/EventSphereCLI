// Mock API cho chức năng kết bạn và nhóm

import { AxiosInstance } from "../../../services";

// Tìm kiếm user theo email
export const searchUserByEmail = async (email, groupId) => {
  // TODO: Gọi API thực tế
  try {
    const body = {
      email: email
    }
    const res = await AxiosInstance().post(`/connects/${groupId}/invite`, body);
    return res;
  } catch (error) {
    console.log(error);
  }
};

// Gửi lời mời kết bạn
export const sendFriendRequest = async (userId) => {
  // TODO: Gọi API thực tế
  return { success: true };
};

// Tạo nhóm mới
export const createGroup = async (eventId, groupName, memberIds) => {
  try {
    const body = {
      eventId: eventId,
      groupName: groupName,
      memberIds: memberIds
    }
    const res = await AxiosInstance().post(`/connects/createGroup`, body);
    return res;
  } catch (error) {
    console.log(error);
  }
};

// Lấy danh sách thành viên nhóm
export const getGroupMembers = async (groupId) => {
  try {
    const res = await AxiosInstance().post(`connects/${groupId}/members`);
    return res
  } catch (error) {
    console.log(error);
  }
};

// Cập nhật vị trí của user trong nhóm
export const updateLocation = async (groupId, latitude, longitude) => {
  try {
    const body = {
      latitude: latitude,
      longitude: longitude
    }
    const res = await AxiosInstance().post(`/connects/${groupId}/location`, body);
    return res
  } catch (error) {
    console.log(error);
  }
}; 