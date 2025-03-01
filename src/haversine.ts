export type Unit = 'km' | 'mile' | 'meter' | 'nmi';

export type CoordinateFormat = '[lat,lon]' | '[lon,lat]' | '{lon,lat}' | '{lat,lng}' | 'geojson' | undefined;

interface StandardCoordinates {
  latitude: number;
  longitude: number;
}

interface LatLonCoordinates {
  lat: number;
  lon: number;
}

interface LatLngCoordinates {
  lat: number;
  lng: number;
}

interface GeoJsonCoordinates {
  geometry: {
    coordinates: [number, number];
  };
}

type CoordinateInput =
  | StandardCoordinates
  | [number, number]
  | LatLonCoordinates
  | LatLngCoordinates
  | GeoJsonCoordinates;

interface HaversineOptions {
  unit?: Unit;
  threshold?: number;
  format?: CoordinateFormat;
}

const RADII: Record<Unit, number> = {
  km: 6371,      // kilometer
  mile: 3960,    // mile
  meter: 6371000, // meter
  nmi: 3440      // nautical mile
};

// num: coordinate difference
function convertToRadian(num: number): number {
  return num * Math.PI / 180;
}

// convert coordinates to standard format based on the passed format option
function convertCoordinates(format: CoordinateFormat, coordinates: CoordinateInput): StandardCoordinates {
  switch (format) {
    case '[lat,lon]':
      const latLon = coordinates as [number, number];
      return { latitude: latLon[0], longitude: latLon[1] };
    case '[lon,lat]':
      const lonLat = coordinates as [number, number];
      return { latitude: lonLat[1], longitude: lonLat[0] };
    case '{lon,lat}':
      const latLonObj = coordinates as LatLonCoordinates;
      return { latitude: latLonObj.lat, longitude: latLonObj.lon };
    case '{lat,lng}':
      const latLngObj = coordinates as LatLngCoordinates;
      return { latitude: latLngObj.lat, longitude: latLngObj.lng };
    case 'geojson':
      const geoJson = coordinates as GeoJsonCoordinates;
      return { latitude: geoJson.geometry.coordinates[1], longitude: geoJson.geometry.coordinates[0] };
    case undefined:
      return coordinates as StandardCoordinates;
    default:
      throw new TypeError(`Invalid format provided. Got ${JSON.stringify(format)}`);
  }
}

/**
 *  Calculate the haversine distance between two points.
 *  @param startCoordinates - Starting coordinates in the format provided by `format`
 *  @param endCoordinates - Ending coordinates in the format provided by `format`
 *  @param options - Options object with unit, threshold, and format
 *  @returns Distance apart if threshold is undefined, else a boolean for if the distance apart is within the threshold
 */
export default function haversine(
  startCoordinates: CoordinateInput,
  endCoordinates: CoordinateInput,
  { unit = 'km', threshold, format }: HaversineOptions = {}
): number | boolean {
  if (!(unit in RADII)) throw new TypeError(`Invalid unit provided to haversine. Got ${unit}`);

  const R = RADII[unit];

  let start: StandardCoordinates;
  let end: StandardCoordinates;

  try {
    start = convertCoordinates(format, startCoordinates);
    end = convertCoordinates(format, endCoordinates);
  } catch (e) {
    throw e;
  }

  const dLat = convertToRadian(end.latitude - start.latitude);
  const dLon = convertToRadian(end.longitude - start.longitude);
  const lat1 = convertToRadian(start.latitude);
  const lat2 = convertToRadian(end.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (threshold !== undefined) return threshold > (R * c);
  return R * c;
}
