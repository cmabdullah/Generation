import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { TreeNavbar } from './components/navbar/TreeNavbar';
import { FamilyTreeCanvas } from './components/canvas/FamilyTreeCanvas';
import { InfoPanel } from './components/sidebar/InfoPanel';
import { Footer } from './components/footer/Footer';
import { useTreeStore } from './stores/treeStore';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

/**
 * Main application component
 */
function App() {
  const loadTree = useTreeStore((state) => state.loadTree);
  const isLoading = useTreeStore((state) => state.isLoading);
  const error = useTreeStore((state) => state.error);

  // Load tree on mount
  useEffect(() => {
    loadTree();
  }, [loadTree]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3">Loading family tree...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Please make sure the backend is running at http://localhost:8081
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <TreeNavbar />
      <div style={{ marginTop: '60px', marginBottom: '40px' }}>
        <FamilyTreeCanvas />
      </div>
      <InfoPanel />
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ bottom: '50px' }}
      />
    </div>
  );
}

export default App;
