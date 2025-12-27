import './Footer.css';

/**
 * Minimal footer component for the family tree application
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-text">
            © {currentYear} Khan, C M Abdullah
          </span>
        </div>

        <div className="footer-center">
          <span className="footer-signature">
            Built with ❤️ for preserving family heritage
          </span>
        </div>

        <div className="footer-right">
          <span className="footer-version">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};
