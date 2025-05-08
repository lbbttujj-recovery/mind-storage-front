import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onButtonVisibilityChange: (isVisible: boolean) => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  isSearchActive: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onButtonVisibilityChange, 
  onSearch,
  onClearSearch,
  isSearchActive 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onButtonVisibilityChange(value.length > 0 && !isSearchActive);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClearSearch();
    onButtonVisibilityChange(false);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Поиск..."
        className="search-input"
      />
      <button 
        className={`search-button ${(searchQuery && !isSearchActive) || isSearchActive ? 'visible' : ''}`}
        onClick={isSearchActive ? handleClear : handleSearch}
      >
        {isSearchActive ? 'Очистить' : 'Найти'}
      </button>
    </div>
  );
};

export default SearchBar; 