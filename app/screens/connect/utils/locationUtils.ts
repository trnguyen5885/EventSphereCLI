import { LocationCoordinates, LocationData, Member, MemberWithLocation, DistanceInfo } from '../types/GroupTypes';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(2)} km`;
};

/**
 * Get formatted distance with prefix
 */
export const getFormattedDistanceText = (distance: number): string => {
  return `Khoảng cách: ${formatDistance(distance)}`;
};

/**
 * Calculate distance between user and member
 */
export const getDistanceToMember = (
  userLocation: LocationCoordinates,
  member: MemberWithLocation
): DistanceInfo | null => {
  if (!hasValidLocation(member)) {
    return null;
  }

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    member.latitude!,
    member.longitude!
  );

  return {
    distance,
    formatted: formatDistance(distance)
  };
};

/**
 * Check if member has valid location coordinates
 */
export const hasValidLocation = (member: MemberWithLocation): boolean => {
  return typeof member.latitude === 'number' && typeof member.longitude === 'number';
};

/**
 * Parse location data from different formats
 */
export const parseLocationData = (location: LocationData): LocationCoordinates | null => {
  // Direct lat/lng format
  if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    return {
      latitude: location.latitude,
      longitude: location.longitude
    };
  }

  // GeoJSON format
  if (location.location?.coordinates?.length === 2) {
    const [longitude, latitude] = location.location.coordinates;
    return { latitude, longitude };
  }

  return null;
};

/**
 * Convert members array to members with location data
 */
export const getMembersWithLocation = (
  members: Member[],
  locations: LocationData[]
): MemberWithLocation[] => {
  return members.map(member => {
    const locationData = locations.find(loc => 
      String(loc.userId) === String(member._id)
    );

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (locationData) {
      const coords = parseLocationData(locationData);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    return {
      ...member,
      location: locationData,
      latitude,
      longitude
    };
  });
};

/**
 * Get user's own location from locations array
 */
export const getUserLocation = (
  locations: LocationData[],
  userId: string
): LocationCoordinates | null => {
  const userLocationData = locations.find(loc => 
    String(loc.userId) === String(userId)
  );

  if (!userLocationData) {
    return null;
  }

  return parseLocationData(userLocationData);
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

/**
 * Get online and offline members
 */
export const categorizeMembers = (membersWithLocation: MemberWithLocation[]) => {
  const online = membersWithLocation.filter(hasValidLocation);
  const offline = membersWithLocation.filter(m => !hasValidLocation(m));
  
  return { online, offline };
}; 