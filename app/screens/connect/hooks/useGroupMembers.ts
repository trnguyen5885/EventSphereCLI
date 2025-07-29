import { useMemo, useCallback } from 'react';
import { Member, LocationData, MemberWithLocation, LocationCoordinates } from '../types/GroupTypes';
import { 
  getMembersWithLocation, 
  categorizeMembers, 
  getUserLocation,
  getDistanceToMember,
  hasValidLocation
} from '../utils/locationUtils';

interface UseGroupMembersProps {
  members: Member[];
  locations: LocationData[];
  userId: string;
  initialUserLocation?: LocationCoordinates;
}

interface UseGroupMembersReturn {
  membersWithLocation: MemberWithLocation[];
  onlineMembers: MemberWithLocation[];
  offlineMembers: MemberWithLocation[];
  myLocation: LocationCoordinates | null;
  getVisibleMembers: (targetMemberId?: string | null) => MemberWithLocation[];
  calculateMemberDistance: (member: MemberWithLocation) => string;
  isUserOnline: boolean;
  stats: {
    totalMembers: number;
    onlineMembers: number;
    offlineMembers: number;
  };
}

export const useGroupMembers = ({
  members,
  locations,
  userId,
  initialUserLocation
}: UseGroupMembersProps): UseGroupMembersReturn => {
  
  // Convert members with location data
  const membersWithLocation = useMemo(() => 
    getMembersWithLocation(members, locations), 
    [members, locations]
  );

  // Get user's current location
  const myLocation = useMemo(() => {
    const locationFromData = getUserLocation(locations, userId);
    return locationFromData || initialUserLocation || null;
  }, [locations, userId, initialUserLocation]);

  // Categorize members
  const { online: onlineMembers, offline: offlineMembers } = useMemo(() => 
    categorizeMembers(membersWithLocation), 
    [membersWithLocation]
  );

  // Check if current user is online
  const isUserOnline = useMemo(() => 
    myLocation !== null, 
    [myLocation]
  );

  // Get visible members for map (includes target member even if offline)
  const getVisibleMembers = useCallback((targetMemberId?: string | null) => {
    if (!targetMemberId) return onlineMembers;
    
    const hasTarget = onlineMembers.some(m => 
      (m._id || m.id) === targetMemberId
    );
    
    if (hasTarget) return onlineMembers;
    
    const target = membersWithLocation.find(m => 
      (m._id || m.id) === targetMemberId
    );
    
    return target ? [...onlineMembers, target] : onlineMembers;
  }, [onlineMembers, membersWithLocation]);

  // Calculate distance to a specific member
  const calculateMemberDistance = useCallback((member: MemberWithLocation): string => {
    if (!myLocation || !hasValidLocation(member)) {
      return '';
    }

    const distanceInfo = getDistanceToMember(myLocation, member);
    return distanceInfo ? `Khoảng cách: ${distanceInfo.formatted}` : '';
  }, [myLocation]);

  // Statistics
  const stats = useMemo(() => ({
    totalMembers: membersWithLocation.length,
    onlineMembers: onlineMembers.length,
    offlineMembers: offlineMembers.length
  }), [membersWithLocation.length, onlineMembers.length, offlineMembers.length]);

  return {
    membersWithLocation,
    onlineMembers,
    offlineMembers,
    myLocation,
    getVisibleMembers,
    calculateMemberDistance,
    isUserOnline,
    stats
  };
}; 