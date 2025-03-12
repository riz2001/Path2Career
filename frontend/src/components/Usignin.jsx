import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled, { createGlobalStyle } from 'styled-components';


// Global Styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
    background-color: #f0f2f5;
    color: #333;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

// Styled Components
const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const FormWrapper = styled.div`
  background: #fff;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: #333;
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #007bff;
  text-align: center;
  font-weight: bold;
`;

const Image = styled.img`
  width: 100px;
  height: 100px;
  display: block;
  margin: 0 auto 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 0.75rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #28a745;

  &:hover {
    background-color: #218838;
  }
`;

const Usignin = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: '', password: '' });

  const inputHandler = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
  
    // Check if the credentials match the admin
    if (input.email === 'admin@gmail.com' && input.password === '12345678') {
      navigate('/approve'); // Redirect admin to approval page
      return;
    }
  
    // Regular user sign-in process
    axios.post("http://localhost:5000/signin", input)
      .then(response => {
        console.log("Backend Response:", response.data); // ✅ Debugging step
  
        const { status, token, user } = response.data; // Destructure response data
  
        if (status === "incorrect password") {
          alert("Incorrect password");
        } else if (status === "invalid email id") {
          alert("Invalid email ID");
        } else if (status === "User is not approved by admin") {
          alert("Your account is not approved by the admin yet. Please wait for approval.");
        } else if (status === "success") {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("userId", user._id);
          sessionStorage.setItem("userName", user.name);
          sessionStorage.setItem("admissionNo", user.admissionno);
          sessionStorage.setItem("courseYear", user.courseYear);
          sessionStorage.setItem("email", user.email);
          sessionStorage.setItem("timeSlot", user.timeSlot || "");
          sessionStorage.setItem("date", user.date || "");
  
          // ✅ Debugging: Check if sessionStorage is correctly set
          console.log("User ID Stored:", sessionStorage.getItem("userId"));
          console.log("User Name Stored:", sessionStorage.getItem("userName"));
          console.log("Navigating to User Dashboard...");
  
          navigate("/dashboard"); // ✅ Ensure correct path
        }
      })
      .catch(error => {
        console.error("Error during sign-in:", error);
      });
  };
  
  return (
    <div>
     

      <GlobalStyle />
      <FormContainer>
        <FormWrapper>
          {/* Job Cracker Heading */}
          <Heading>PATH2CAREER</Heading>

          {/* Logo Image */}
          <Image src="https://tse3.mm.bing.net/th?id=OIP.Z9MPb-mr_Soaz3u-MgNjPQHaHa&pid=Api&P=0&h=220" alt="Job Cracker Logo" />

          <Title>Sign In</Title>
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              name="email"
              placeholder="Email"
              value={input.email}
              onChange={inputHandler}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={input.password}
              onChange={inputHandler}
              required
            />
            <Button type="submit">Sign In</Button>
            <SecondaryButton onClick={() => navigate('/ureg')}>Sign Up</SecondaryButton>
          </form>
        </FormWrapper>
      </FormContainer>
    </div>
  );
};

export default Usignin;
