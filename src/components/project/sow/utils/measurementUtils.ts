
/**
 * Converts room measurements from project data to a standardized format
 */
export function convertMeasurements(roomMeasurements: any) {
  if (!roomMeasurements) return null;
  
  console.log('Converting measurements:', roomMeasurements);
  
  // Handle cases where measurements might be in ft or m
  const unit = roomMeasurements.unit || 'ft';
  const multiplier = unit === 'ft' ? 12 : 39.37; // Convert to inches
  
  // Extract values ensuring they are numbers
  const length = typeof roomMeasurements.length === 'number' ? roomMeasurements.length : 
                 parseFloat(roomMeasurements.length) || 0;
  const width = typeof roomMeasurements.width === 'number' ? roomMeasurements.width : 
                parseFloat(roomMeasurements.width) || 0;
  const height = typeof roomMeasurements.height === 'number' ? roomMeasurements.height : 
                 parseFloat(roomMeasurements.height) || 0;
  
  // Calculate total square feet
  const totalSqft = length && width ? length * width : 0;
  
  // Create standardized measurements object
  const convertedMeasurements = {
    length: length ? String(Math.round(length * multiplier)) : '',
    width: width ? String(Math.round(width * multiplier)) : '',
    height: height ? String(Math.round(height * multiplier)) : '',
    totalSqft: totalSqft ? String(Math.round(totalSqft)) : ''
  };
  
  console.log('Converted measurements result:', convertedMeasurements);
  
  return convertedMeasurements;
}
