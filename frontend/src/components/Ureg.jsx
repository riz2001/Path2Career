import axios from 'axios';
import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #007bff;
  text-align: center;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
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

const Ureg = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    name: "",
    admissionno: "",
    phoneno: "",
    rollno: "",
    courseYear: "",
    batch: "",
    email: "",
    password: "",
    cnfpass: ""
  });

  const inputHandler = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value.trim() });
  };

  // Function to determine available year/batch options
  const getYearBatchOptions = () => {
    if (input.batch && (input.batch.includes("MCA") || input.batch.includes("MBA"))) {
      return ["First Year A Batch", "First Year B Batch", "Second Year A Batch", "Second Year B Batch"];
    }
    return [
      "First Year A Batch", "First Year B Batch", "First Year C Batch",
      "Second Year A Batch", "Second Year B Batch", "Second Year C Batch",
      "Third Year A Batch", "Third Year B Batch", "Third Year C Batch",
      "Fourth Year A Batch", "Fourth Year B Batch", "Fourth Year C Batch"
    ];
  };

  const validateInputs = () => {
    const phoneRegex = /^\d{10}$/;
    const admissionRegex = /^[A-Za-z0-9]{8}$/;
    const rollRegex = /^\d{1,3}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!input.name.trim()) return alert("Please enter your name.");
    if (!admissionRegex.test(input.admissionno)) return alert("Invalid Admission number.");
    if (!phoneRegex.test(input.phoneno)) return alert("Invalid Phone number.");
    if (!rollRegex.test(input.rollno)) return alert("Invalid Roll Number.");
    if (!emailRegex.test(input.email)) return alert("Please enter a valid email.");
    if (input.password.length < 8) return alert("Password must be at least 8 characters.");
    if (input.password !== input.cnfpass) return alert("Passwords do not match.");
    if (!input.batch) return alert("Please select your department.");
    if (!input.courseYear) return alert("Please select your Year/Batch.");
    return true;
  };

  const readValue = () => {
    if (validateInputs()) {
      const newInput = {
        name: input.name,
        admissionno: input.admissionno,
        phoneno: input.phoneno,
        rollno: input.rollno,
        courseYear: input.courseYear,
        batch: input.batch,
        email: input.email,
        password: input.password
      };

      axios.post("http://localhost:5000/signup", newInput)
        .then((response) => {
          console.log(response.data);
          if (response.data.status === "success") {
            alert("Registered successfully");
            setInput({
              name: "", admissionno: "", phoneno: "", rollno: "", courseYear: "", batch: "",
              email: "", password: "", cnfpass: ""
            });
          } else if (response.data.status === "email id already exists") {
            alert("Email ID already exists.");
          }
        })
        .catch((error) => {
          console.log(error);
          alert("An error occurred during registration. Please try again.");
        });
    }
  };

  return (
    <div>
      <br />
      <br />
      <GlobalStyle />
      <FormContainer>
        <FormWrapper>
          <Heading>JOB CRACKER</Heading>
          <Title>Sign Up</Title>
          <form>
            <Input type="text" name="name" placeholder="Name" value={input.name} onChange={inputHandler} required />
            <Input type="text" name="admissionno" placeholder="Admission Number" value={input.admissionno} onChange={inputHandler} required />
            <Input type="text" name="rollno" placeholder="Roll Number" value={input.rollno} onChange={inputHandler} required />
            <Input type="tel" name="phoneno" placeholder="Phone Number" value={input.phoneno} onChange={inputHandler} required />
            <Input type="text" name="email" placeholder="Email" value={input.email} onChange={inputHandler} required />

            {/* Department Selection */}
            <Select name="batch" value={input.batch} onChange={inputHandler} required>
              <option value="">Select Department</option>
              <option value="Civil Engineering">Civil Engineering - 120 Seats</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering - 180 Seats</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
            </Select>

            {/* Year/Batch Selection */}
            <Select name="courseYear" value={input.courseYear} onChange={inputHandler} required>
              <option value="">Select Year/Batch</option>
              {getYearBatchOptions().map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>

            <Input type="password" name="password" placeholder="Password" value={input.password} onChange={inputHandler} required autoComplete="new-password" />
            <Input type="password" name="cnfpass" placeholder="Confirm Password" value={input.cnfpass} onChange={inputHandler} required autoComplete="new-password" />

            <Button type="button" onClick={readValue}>Sign Up</Button>
            <SecondaryButton type="button" onClick={() => navigate('/')}>BACK TO SIGNIN</SecondaryButton>
          </form>
        </FormWrapper>
      </FormContainer>
    </div>
  );
};

export default Ureg;
