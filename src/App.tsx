import React, { useEffect, useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import Item from './components/Item';
import axios, { AxiosError } from 'axios';
import { Item as ItemType } from './types';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ErrorResponse {
  message: string;
}

function App() {
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);

  const showErrorToast = (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    toast.error(`Ошибка ${status}: ${message}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const fetchItems = async () => {
    setLoading(true);
    setIsSearchActive(false);
    try {
      const response = await axios.get<ItemType[]>('http://localhost:3001/items');
      if (response.status === 200) {
        setItems(response.data);
        setError(null);
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError('Ошибка при загрузке данных');
      showErrorToast(error);
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setIsSearchActive(true);
    try {
      const response = await axios.get<ItemType[]>(`http://localhost:3001/items/search?q=${encodeURIComponent(query)}`);
      if (response.status === 200) {
        setItems(response.data);
        setError(null);
        if (response.data.length === 0) {
          toast.info('По вашему запросу ничего не найдено', {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError('Ошибка при поиске');
      showErrorToast(error);
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setIsSearchActive(false);
    fetchItems();
  };

  const handleAddItem = async () => {
    if (!newItemValue.trim()) {
      toast.warning('Пожалуйста, введите текст', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsAdding(true);
    try {
      const response = await axios.post<ItemType>('http://localhost:3001/items', {
        value: newItemValue.trim()
      });
      
      if (response.status === 200) {
        setNewItemValue('');
        setIsAddFormVisible(false);
        await fetchItems();
        
        toast.success('Элемент успешно добавлен', {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      showErrorToast(error);
      console.error('Error adding item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddItem();
    } else if (event.key === 'Escape') {
      setIsAddFormVisible(false);
      setNewItemValue('');
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const response = await axios.delete(`http://localhost:3001/items/${id}`);
      if (response.status === 200) {
        await fetchItems();
        toast.success('Запись успешно удалена', {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      showErrorToast(error);
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header className="App-header">
        <h1>Minds Storage</h1>
      </header>
      <main className="App-main">
        <SearchBar 
          onButtonVisibilityChange={setIsButtonVisible} 
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          isSearchActive={isSearchActive}
        />
        <div className={`items-container`}>
          {loading && (
            <div className="loading">
              <ClipLoader
                color="#8a2be2"
                loading={loading}
                size={100}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {!loading && !error && items.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              title={item.value}
              description={new Date(item.time).toLocaleString()}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      </main>
      {!isSearchActive && !isButtonVisible && (
        <button 
          className="add-button" 
          onClick={() => setIsAddFormVisible(true)}
          aria-label="Добавить элемент"
        >
          +
        </button>
      )}
      {isAddFormVisible && (
        <div className="add-form-overlay">
          <div className="add-form-container">
            <div className="add-form-header">
              <h2 className="add-form-title">Добавить новую запись</h2>
              <p className="add-form-subtitle">
                Введите текст, который вы хотите сохранить. Вы можете использовать любые символы и форматирование.
              </p>
            </div>
            <div className="add-form-input-container">
              <input
                type="text"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите текст..."
                className="add-form-input"
                disabled={isAdding}
                autoFocus
              />
            </div>
            <div className="add-form-buttons">
              <button 
                onClick={handleAddItem}
                className="add-form-submit"
                disabled={isAdding}
              >
                {isAdding ? <ClipLoader color="#ffffff" size={20} /> : 'Добавить запись'}
              </button>
              <button 
                onClick={() => {
                  setIsAddFormVisible(false);
                  setNewItemValue('');
                }}
                className="add-form-cancel"
                disabled={isAdding}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
