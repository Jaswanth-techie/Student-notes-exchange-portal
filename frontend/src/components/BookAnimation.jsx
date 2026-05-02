import { FiBookOpen } from 'react-icons/fi';
import './BookAnimation.css';

const BookAnimation = () => {
  return (
    <div className="book-container">
      <div className="book">
        <div className="book-spine"></div>
        <div className="book-pages"></div>
        <div className="book-cover">
          <div className="book-content">
            <FiBookOpen size={48} className="book-icon text-white/90" />
            <h3 className="book-title text-white">NoteVault</h3>
            <p className="book-author text-white/70">Student Notes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAnimation;
