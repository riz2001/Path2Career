import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

import Usernavbar1 from './Usernavbar1';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const ProfileCard = styled.div`
  background-color: #ffffff;
  padding: 02rem;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 750px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 1rem;
  font-weight: bold;
  text-align: center;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: #555;
  flex: 1;
  text-align: left;
`;

const Value = styled.div`
  flex: 2;
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  text-align: left;
  font-size: 1rem;
`;

// Editable input field for email and phone number
const EditableValue = styled.input`
  flex: 2;
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  text-align: left;
  font-size: 1rem;
  border: ${({ editable }) => (editable ? '1px solid #007bff' : '1px solid #ddd')};
  pointer-events: ${({ editable }) => (editable ? 'auto' : 'none')};
`;

const EditButton = styled.button`
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const SaveButton = styled(EditButton)`
  background-color: #007bff;

  &:hover {
    background-color: #0056b3;
  }
`;

const CancelButton = styled(EditButton)`
  background-color: #dc3545;

  &:hover {
    background-color: #c82333;
  }
`;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedPhone, setUpdatedPhone] = useState('');

  useEffect(() => {
    // Fetch user details using userId from sessionStorage
    const userId = sessionStorage.getItem('userId');
    
    axios.get(`http://localhost:5000/profile/${userId}`)
      .then(response => {
        setUser(response.data.user);
        setUpdatedEmail(response.data.user.email);
        setUpdatedPhone(response.data.user.phoneno);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }, []);

  const handleSave = () => {
    // Update user details using userId from sessionStorage
    const userId = sessionStorage.getItem('userId');
    
    axios.put(`http://localhost:3030/update-profile/${userId}`, {
      email: updatedEmail,
      phoneno: updatedPhone,
    })
      .then(response => {
        setUser(response.data.user);
        setIsEditing(false);
      })
      .catch(error => {
        console.error('Error updating profile:', error);
      });
  };

  return (
    <div>
      <Usernavbar1 />
      <Container>
        {user ? (
          <ProfileCard>
            <Title>Welcome, {user.name}!</Title>
            <InfoRow>
              <Label>Name:</Label>
              <Value>{user.name}</Value>
            </InfoRow>


            <InfoRow>
              <Label>Admission Number:</Label>
              <Value>{user.admissionno}</Value>
            </InfoRow>

            <InfoRow>
              <Label>Roll Number:</Label>
              <Value>{user.rollno}</Value>
            </InfoRow>

            <InfoRow>
              <Label>Course Year:</Label>
              <Value>{user.courseYear}</Value>
            </InfoRow>

            {/* Email Field */}
            <InfoRow>
              <Label>Email:</Label>
              <EditableValue
                type="email"
                value={updatedEmail}
                onChange={(e) => setUpdatedEmail(e.target.value)}
                editable={isEditing}
              />
            </InfoRow>

            {/* Phone Number Field */}
            <InfoRow>
              <Label>Phone Number:</Label>
              <EditableValue
                type="text"
                value={updatedPhone}
                onChange={(e) => setUpdatedPhone(e.target.value)}
                editable={isEditing}
              />
            </InfoRow>

            {isEditing ? (
              <>
                <SaveButton onClick={handleSave}>Save Changes</SaveButton>
                <CancelButton onClick={() => setIsEditing(false)}>Cancel</CancelButton>
              </>
            ) : (
              <EditButton onClick={() => setIsEditing(true)}>Edit Profile</EditButton>
            )}
          </ProfileCard>
        ) : (
          <p>Loading profile...</p>
        )}
      </Container>
    </div>
  );
};

export default ProfilePage;
