import React from 'react';
import { useNavigate } from 'react-router-dom';

const Btechnavbar = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const roomId = Date.now();
    navigate(`/Adminroom/${roomId}`);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div>
   
      <nav className="navbar bg-dark border-bottom border-body" data-bs-theme="dark">
        <div className="container-fluid">
          <div className="d-flex justify-content-end align-items-center">
            <a className="navbar-brand text-light" href="#"><b>PATH2CAREER</b></a>

            {/* USER MANAGEMENT Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                USER MANAGEMENT
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/btechapprove">Approve Users</a></li>
                <li><a className="dropdown-item" href="/btechupdation">Updation</a></li>
              </ul>
            </div>

            {/* ON CAMPUS Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                ON CAMPUS
              </a>
              <ul className="dropdown-menu">
           
                <li><a className="dropdown-item" href="/btechjoblist">View Registrations</a></li>
            
              </ul>
            </div>

            {/* OFF CAMPUS Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                OFF CAMPUS
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/Addoffcampus">Add Off-Campus</a></li>
                <li><a className="dropdown-item" href="/offdelete">Delete Off-Campus</a></li>
              </ul>
            </div>
{/* 
            INTERVIEW Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                GD
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#" onClick={handleCreateRoom}>GD</a></li>
                <li><a className="dropdown-item" href="/btechuserlist">Add Time Slot</a></li>
                <li><a className="dropdown-item" href="/btechmonthpage">Review</a></li>
        
              </ul>
            </div>

            {/* APTITUDE TEST Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                APTITUDE TEST
              </a>
              <ul className="dropdown-menu">
              
                <li><a className="dropdown-item" href="/btechweeklist">Aptitude Attendance</a></li>
           
                <li><a className="dropdown-item" href="/btechscoretable">Result</a></li>
               
              </ul>
            </div>

            {/* CODING TEST Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                CODING TEST
              </a>
              <ul className="dropdown-menu">
              
                <li><a className="dropdown-item" href="/btechsubmissionweeks">Coding Attendance</a></li>
       
                <li><a className="dropdown-item" href="/btechFourweek">Result</a></li>
             
              </ul>
            </div>

             {/* INTERVIEW Dropdown */}
             <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              AI  INTERVIEW
              </a>
              <ul className="dropdown-menu">
    
                <li><a className="dropdown-item" href="/btechjobposition">Interview attendance</a></li>
                
            
              </ul>
            </div>
          

            {/* SIGNOUT BUTTON */}
            <button onClick={handleSignOut} className="btn btn-danger mx-3">
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Btechnavbar;
