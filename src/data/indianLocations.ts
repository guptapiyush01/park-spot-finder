// Major cities and regions across India organized by state
export interface Location {
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const popularLocations: Location[] = [
  // Metro Cities
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  
  // Major Cities
  { city: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { city: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lng: 77.4538 },
  { city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { city: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { city: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { city: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178 },
  { city: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
  { city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022 },
  { city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { city: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973 },
  { city: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
  { city: 'Allahabad', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463 },
  { city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096 },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { city: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864 },
  { city: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
  { city: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
  { city: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { city: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296 },
  { city: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648 },
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { city: 'Hubli', state: 'Karnataka', lat: 15.3647, lng: 75.1240 },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047 },
  { city: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304 },
  { city: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
  { city: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lng: 78.7733 },
  { city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { city: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lng: 78.0880 },
  { city: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 },
  { city: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460 },
  { city: 'Warangal', state: 'Telangana', lat: 17.9784, lng: 79.5941 },
  { city: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
  { city: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
  { city: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
  { city: 'Manali', state: 'Himachal Pradesh', lat: 32.2432, lng: 77.1892 },
  { city: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
  { city: 'Panaji', state: 'Goa', lat: 15.4909, lng: 73.8278 },
  { city: 'Pondicherry', state: 'Puducherry', lat: 11.9416, lng: 79.8083 },
  { city: 'Gangtok', state: 'Sikkim', lat: 27.3389, lng: 88.6065 },
  { city: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933 },
  { city: 'Imphal', state: 'Manipur', lat: 24.8170, lng: 93.9368 },
  { city: 'Agartala', state: 'Tripura', lat: 23.8315, lng: 91.2868 },
  { city: 'Aizawl', state: 'Mizoram', lat: 23.7271, lng: 92.7176 },
  { city: 'Kohima', state: 'Nagaland', lat: 25.6751, lng: 94.1086 },
  { city: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lng: 93.6053 },
  { city: 'Port Blair', state: 'Andaman and Nicobar', lat: 11.6234, lng: 92.7265 },
  { city: 'Leh', state: 'Ladakh', lat: 34.1526, lng: 77.5771 },
  
  // Notable smaller cities/towns
  { city: 'Mohali', state: 'Punjab', lat: 30.7046, lng: 76.7179 },
  { city: 'Panchkula', state: 'Haryana', lat: 30.6942, lng: 76.8606 },
  { city: 'Zirakpur', state: 'Punjab', lat: 30.6425, lng: 76.8173 },
  { city: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676 },
  { city: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lng: 78.1642 },
  { city: 'Nainital', state: 'Uttarakhand', lat: 29.3919, lng: 79.4542 },
  { city: 'Mussoorie', state: 'Uttarakhand', lat: 30.4598, lng: 78.0644 },
  { city: 'Dharamshala', state: 'Himachal Pradesh', lat: 32.2190, lng: 76.3234 },
  { city: 'Ooty', state: 'Tamil Nadu', lat: 11.4102, lng: 76.6950 },
  { city: 'Kodaikanal', state: 'Tamil Nadu', lat: 10.2381, lng: 77.4892 },
  { city: 'Munnar', state: 'Kerala', lat: 10.0889, lng: 77.0595 },
  { city: 'Lonavala', state: 'Maharashtra', lat: 18.7481, lng: 73.4072 },
  { city: 'Mahabaleshwar', state: 'Maharashtra', lat: 17.9307, lng: 73.6477 },
  { city: 'Mount Abu', state: 'Rajasthan', lat: 24.5926, lng: 72.7156 },
  { city: 'Pushkar', state: 'Rajasthan', lat: 26.4899, lng: 74.5510 },
  { city: 'Jaisalmer', state: 'Rajasthan', lat: 26.9157, lng: 70.9083 },
  { city: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lng: 74.6399 },
  { city: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lng: 73.3119 },
];

export const searchLocations = (query: string): Location[] => {
  if (!query.trim()) return popularLocations.slice(0, 10);
  
  const lowerQuery = query.toLowerCase();
  return popularLocations.filter(loc => 
    loc.city.toLowerCase().includes(lowerQuery) ||
    loc.state.toLowerCase().includes(lowerQuery)
  ).slice(0, 15);
};

export const getLocationByCity = (city: string): Location | undefined => {
  return popularLocations.find(loc => loc.city.toLowerCase() === city.toLowerCase());
};
