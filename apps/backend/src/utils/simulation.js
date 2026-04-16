const getMockStatus = () => {
  const hour = new Date().getHours();
  
  // Dhaka Rush Hour Logic
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return { crowd: 'High', traffic: 'Jam', color: '#ef4444' }; // Red
  } else if ((hour >= 11 && hour <= 16)) {
    return { crowd: 'Medium', traffic: 'Busy', color: '#f59e0b' }; // Orange
  } else {
    return { crowd: 'Low', traffic: 'Clear', color: '#10b981' }; // Green
  }
};

module.exports = { getMockStatus };