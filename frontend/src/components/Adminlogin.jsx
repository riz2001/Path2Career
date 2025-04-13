import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const LoginBox = styled.div`
  background: #fff;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Post credentials to your login API endpoint
      const response = await axios.post('http://localhost:5000/api/login', input);
      // Assume the API returns an object with a type field
      const { type } = response.data;
      
      // Navigate based on user type
      if (type === 'mca') {
        navigate('/mcaapprove');
      } else if (type === 'mba') {
        navigate('/mbaapprove');
      } else if (type === 'btech') {
        navigate('/btechapprove');
      } else if (type === 'admin') {
        navigate('/updateaptitude');
      } else {
        alert('User type not recognized');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginBox>
        <Title>Admin Login</Title>
        <form onSubmit={handleLogin}>
          <Input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={input.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={input.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </LoginBox>
    </Container>
  );
};

export default AdminLogin;
