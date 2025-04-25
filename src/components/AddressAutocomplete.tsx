
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface AddressResult {
  id: string;
  text: string;
  place_name: string;
  context: Array<{id: string, text: string}>;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
}

// Map of state names to abbreviations
const stateNameToAbbreviation: { [key: string]: string } = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY'
};

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onAddressSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  const fetchAddressSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-geocoding', {
        body: JSON.stringify({ query: searchQuery })
      });

      if (error) throw error;

      if (data?.results) {
        setSuggestions(data.results);
      }
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    // Debounce the API call
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      fetchAddressSuggestions(searchQuery);
    }, 300);
  };

  const handleAddressSelect = (address: AddressResult) => {
    // Extract only the street address (first part) - ensuring we don't include city/state info
    // This ensures we only get the street name and number
    const addressLine1 = address.text;
    const city = address.context.find(c => c.id.includes('place'))?.text || '';
    const stateName = address.context.find(c => c.id.includes('region'))?.text || '';
    const stateAbbr = stateNameToAbbreviation[stateName] || stateName;
    const zipCode = address.context.find(c => c.id.includes('postcode'))?.text || '';

    onAddressSelect({
      addressLine1,
      city,
      state: stateAbbr,
      zipCode
    });

    setSuggestions([]);
    setQuery(address.place_name);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Start typing an address..."
        value={query}
        onChange={handleInputChange}
        className="w-full"
      />
      {isLoading && (
        <div className="absolute z-10 w-full bg-white shadow-md rounded-md mt-1 p-2">
          Loading suggestions...
        </div>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white shadow-md rounded-md mt-1">
          {suggestions.map((address) => (
            <li 
              key={address.id} 
              onClick={() => handleAddressSelect(address)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {address.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
