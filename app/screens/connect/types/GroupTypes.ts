export interface Member {
  _id: string;
  id?: string;
  username: string;
  email: string;
  picUrl?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    coordinates: [number, number]; // GeoJSON format [longitude, latitude]
  };
}

export interface MemberWithLocation extends Omit<Member, 'location'> {
  location?: LocationData;
  latitude?: number;
  longitude?: number;
}

export interface LocationData {
  userId: string;
  latitude?: number;
  longitude?: number;
  location?: {
    coordinates: [number, number];
  };
  timestamp?: string;
}

export interface GroupData {
  _id: string;
  groupName: string;
  ownerId: {
    _id: string;
  };
  memberIds: Member[];
  eventId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface SearchResult {
  _id?: string;
  username?: string;
  email: string;
  picUrl?: string;
  isExisting?: boolean;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GroupScreenProps {
  route: {
    params: {
      groupId: string;
      userLocation?: LocationCoordinates;
      groupName?: string;
      ownerId?: {
        _id: string;
      };
    };
  };
  navigation: any;
}

export interface GroupStats {
  totalMembers: number;
  onlineMembers: number;
  offlineMembers: number;
}

export interface DistanceInfo {
  distance: number;
  formatted: string;
}

export type ConfirmationType = 'leave' | 'delete';

export interface GroupError {
  type: 'location' | 'network' | 'permission' | 'general';
  message: string;
  retry?: () => void;
}

export interface GroupState {
  isSharing: boolean;
  myLocation: LocationCoordinates | null;
  targetMemberId: string | null;
  selectedMember: Member | null;
  distanceText: string;
  inviteModal: boolean;
  searchEmail: string;
  searchResult: SearchResult | null;
  searchLoading: boolean;
  invitedMembers: { email: string }[];
  confirmModalVisible: boolean;
  confirmationType: ConfirmationType | null;
  error: GroupError | null;
} 