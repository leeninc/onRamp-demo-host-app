import React, { useState } from 'react';
import HostApp from './components/HostApp';
import LoginForm from './LoginForm';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLogin = (username: string, password: string): void => {
    const adminUsername = import.meta.env.VITE_REACT_APP_ADMIN_USERNAME;
    const adminPassword = import.meta.env.VITE_REACT_APP_ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials are not set in environment variables');
      alert('Server configuration error. Please contact the administrator.');
      return;
    }

    if (username === adminUsername && password === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#f6f5ef]">
        <div className="font-bold text-4xl mb-8">OnRamp Demo</div>
        <div className="mb-4">Please login to access the app.</div>
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f6f5ef]">
      <div className="font-bold text-4xl mb-8">OnRamp Demo</div>
      <div>To start, select a vendor from the list below.</div>
      <div>
        <HostApp />
      </div>
    </div>
  );
}

export default App;