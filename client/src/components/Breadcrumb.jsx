import { HiOutlineChevronRight, HiOutlineHome } from 'react-icons/hi';

export default function Breadcrumb({ items, onNavigate }) {
  return (
    <div className="breadcrumb">
      <button
        className="breadcrumb-item breadcrumb-home"
        onClick={() => onNavigate(null)}
      >
        <HiOutlineHome />
        <span>My Drive</span>
      </button>

      {items.map((item, index) => (
        <div key={item._id} className="breadcrumb-segment">
          <HiOutlineChevronRight className="breadcrumb-separator" />
          <button
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            onClick={() => onNavigate(item._id)}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
}
