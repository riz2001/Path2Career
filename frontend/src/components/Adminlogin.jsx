import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Redirection based on email
    if (input.email === 'mca@gmail.com' && input.password === '12345678') {
      navigate('/mcaapprove');
    } else if (input.email === 'mba@gmail.com' && input.password === '12345678') {
      navigate('/mbaapprove');
    } else if (input.email === 'btech@gmail.com' && input.password === '12345678') {
      navigate('/btechapprove');
    } else if (input.email === 'user@gmail.com' && input.password === '12345678') {
      navigate('/userdashboard');
    } else {
      alert('Invalid email or password');
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
          <Button type="submit">Login</Button>
        </form>
      </LoginBox>
    </Container>
  );
};

export default AdminLogin;
