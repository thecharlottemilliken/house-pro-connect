
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
    const addressLine1 = address.text;
    const city = address.context.find(c => c.id.includes('place'))?.text || '';
    const state = address.context.find(c => c.id.includes('region'))?.text || '';
    const zipCode = address.context.find(c => c.id.includes('postcode'))?.text || '';

    onAddressSelect({
      addressLine1,
      city,
      state,
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
