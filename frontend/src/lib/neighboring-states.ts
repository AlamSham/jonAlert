// Neighboring states data for India
export const NEIGHBORING_STATES: Record<string, string[]> = {
  'Andhra Pradesh': ['Telangana', 'Karnataka', 'Tamil Nadu', 'Odisha', 'Chhattisgarh'],
  'Arunachal Pradesh': ['Assam', 'Nagaland'],
  'Assam': ['Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya', 'West Bengal'],
  'Bihar': ['Jharkhand', 'West Bengal', 'Uttar Pradesh'],
  'Chhattisgarh': ['Madhya Pradesh', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Odisha', 'Jharkhand', 'Uttar Pradesh'],
  'Goa': ['Maharashtra', 'Karnataka'],
  'Gujarat': ['Rajasthan', 'Madhya Pradesh', 'Maharashtra'],
  'Haryana': ['Punjab', 'Himachal Pradesh', 'Uttarakhand', 'Uttar Pradesh', 'Rajasthan'],
  'Himachal Pradesh': ['Punjab', 'Haryana', 'Uttarakhand'],
  'Jharkhand': ['Bihar', 'West Bengal', 'Odisha', 'Chhattisgarh', 'Uttar Pradesh'],
  'Karnataka': ['Goa', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Kerala'],
  'Kerala': ['Karnataka', 'Tamil Nadu'],
  'Madhya Pradesh': ['Rajasthan', 'Gujarat', 'Maharashtra', 'Chhattisgarh', 'Uttar Pradesh'],
  'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Chhattisgarh', 'Telangana', 'Karnataka', 'Goa'],
  'Manipur': ['Assam', 'Nagaland', 'Mizoram'],
  'Meghalaya': ['Assam', 'Tripura'],
  'Mizoram': ['Assam', 'Manipur', 'Tripura'],
  'Nagaland': ['Arunachal Pradesh', 'Assam', 'Manipur'],
  'Odisha': ['Jharkhand', 'West Bengal', 'Andhra Pradesh', 'Chhattisgarh'],
  'Punjab': ['Haryana', 'Himachal Pradesh'],
  'Rajasthan': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat'],
  'Sikkim': ['West Bengal'],
  'Tamil Nadu': ['Kerala', 'Karnataka', 'Andhra Pradesh'],
  'Telangana': ['Maharashtra', 'Chhattisgarh', 'Andhra Pradesh', 'Karnataka'],
  'Tripura': ['Assam', 'Meghalaya', 'Mizoram'],
  'Uttar Pradesh': ['Haryana', 'Uttarakhand', 'Himachal Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Chhattisgarh', 'Jharkhand', 'Bihar'],
  'Uttarakhand': ['Himachal Pradesh', 'Haryana', 'Uttar Pradesh'],
  'West Bengal': ['Jharkhand', 'Bihar', 'Sikkim', 'Assam', 'Odisha'],
  
  // Union Territories
  'Delhi': ['Haryana', 'Uttar Pradesh'],
  'Jammu and Kashmir': ['Himachal Pradesh', 'Punjab'],
  'Ladakh': ['Himachal Pradesh'],
  'Chandigarh': ['Punjab', 'Haryana'],
  'Puducherry': ['Tamil Nadu'],
  'Andaman and Nicobar Islands': [],
  'Dadra and Nagar Haveli and Daman and Diu': ['Gujarat', 'Maharashtra'],
  'Lakshadweep': []
};

export function getNeighboringStates(state: string): string[] {
  return NEIGHBORING_STATES[state] || [];
}

export function getPopularStates(): string[] {
  return [
    'Uttar Pradesh',
    'Maharashtra',
    'Bihar',
    'West Bengal',
    'Madhya Pradesh',
    'Tamil Nadu',
    'Rajasthan',
    'Karnataka',
    'Gujarat',
    'Andhra Pradesh',
    'Odisha',
    'Telangana',
    'Kerala',
    'Jharkhand',
    'Assam',
    'Punjab',
    'Chhattisgarh',
    'Haryana',
    'Delhi',
    'Jammu and Kashmir'
  ];
}