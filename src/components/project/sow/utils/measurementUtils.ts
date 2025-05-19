
/**
 * Converts room measurements from project data to a standardized format
 */
export function convertMeasurements(roomMeasurements: any) {
  if (!roomMeasurements) return null;
  
  // Handle cases where measurements might be in ft or m
  const multiplier = roomMeasurements.unit === 'ft' ? 12 : 39.37; // Convert to inches
  
  return {
    length: roomMeasurements.length ? String(Math.round(roomMeasurements.length * multiplier)) : '',
    width: roomMeasurements.width ? String(Math.round(roomMeasurements.width * multiplier)) : '',
    height: roomMeasurements.height ? String(Math.round(roomMeasurements.height * multiplier)) : '',
    totalSqft: roomMeasurements.length && roomMeasurements.width 
      ? String(Math.round(roomMeasurements.length * roomMeasurements.width)) 
      : ''
  };
}
