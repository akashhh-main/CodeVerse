import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { checkAuth } from './authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(checkAuth()); // Checks if user is already logged in
  }, [dispatch]);

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
    </Routes>
  );
}

export default App;