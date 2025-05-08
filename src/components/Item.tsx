import React from 'react';
import './Item.css';

interface ItemProps {
  id: number;
  title: string;
  description: string;
  onDelete: (id: number) => void;
}

const Item: React.FC<ItemProps> = ({ id, title, description, onDelete }) => {
  return (
    <div className="item">
      <div className="item-content">
        <h3 className="item-title">{title}</h3>
        <p className="item-description">{description}</p>
      </div>
      <div className="item-actions">
        <button className="item-button edit">✏️</button>
        <button 
          className="item-button delete"
          onClick={() => onDelete(id)}
          aria-label="Удалить запись"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default Item; 