import React, { useState, FormEvent } from 'react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  errorMessage: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, errorMessage }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center my-6">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className={`mb-2 p-3 border rounded ${errorMessage ? 'border-red-500' : ''}`}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className={`mb-2 p-3 border rounded ${errorMessage ? 'border-red-500' : ''}`}
      />
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
      <button type="submit" className="bg-[#B5FF56] text-black hover:bg-[#78a43e] min-w-[88px] p-2 mt-8 rounded">
        Login
      </button>
    </form>
  );
};

export default LoginForm;