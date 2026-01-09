import { Item } from '../types';
import { formatCurrency } from '../utils/formatters';
import './ItemCard.css';

interface ItemCardProps {
  item: Item;
  onPress: (item: Item) => void;
}

export default function ItemCard({ item, onPress }: ItemCardProps) {
  return (
    <div className="item-card" onClick={() => onPress(item)}>
      <div className="item-card-header">
        <div className="item-icon">📦</div>
        <div className="item-info">
          <h3>{item.name}</h3>
          <p className="item-code">Code: {item.code}</p>
        </div>
      </div>
      <div className="item-card-body">
        <div className="item-price">
          {item.mrp && item.mrp > item.price ? (
            <>
              <div className="price-row">
                <span className="mrp-price">{formatCurrency(item.mrp)}</span>
                <span className="sale-price">{formatCurrency(item.price)}</span>
              </div>
              <div className="discount-badge">
                Save {formatCurrency(item.mrp - item.price)}
              </div>
            </>
          ) : (
            <span className="price-value">{formatCurrency(item.price)}</span>
          )}
        </div>
        {item.stock > 0 ? (
          <div className="item-stock">Stock: {item.stock}</div>
        ) : (
          <div className="item-stock out-of-stock">Out of Stock</div>
        )}
      </div>
      <button className="item-add-btn">+ Add to Cart</button>
    </div>
  );
}

