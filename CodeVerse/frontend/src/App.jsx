import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { checkAuth } from './authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import ExploreLearningPaths from './pages/ExplorePath';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    dispatch(checkAuth()).then(() => {
      setAuthChecked(true);
    });
  }, [dispatch]);

 const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

// Usage
if (!authChecked || loading) {
  return <LoadingSpinner />;
}

  return (
    <Routes>
      <Route 
        path='/' 
        element={isAuthenticated ? <Homepage /> : <Navigate to='/signup' />} 
      />
      <Route 
        path='/login' 
        element={isAuthenticated ? <Navigate to='/' /> : <Login />} 
      />
      <Route 
        path='/signup' 
        element={isAuthenticated ? <Navigate to='/' /> : <Signup />} 
      />
      <Route 
        path='/admin' 
        element={
          isAuthenticated && user?.role === 'admin' ? 
            <AdminPanel /> : 
            <Navigate to='/' />
        } 
      />
      <Route 
        path='/explore' 
        element={
          isAuthenticated ? 
            <ExploreLearningPaths /> : 
            <Navigate to='/login' />
        } 
      />
    </Routes>
  );
}

export default App;