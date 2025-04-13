import React from 'react';
import { useNavigate } from 'react-router-dom';

const Mcanavbar = () => {
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
                <li><a className="dropdown-item" href="/mcaapprove">Approve Users</a></li>
                <li><a className="dropdown-item" href="/mcaupdation">Updation</a></li>
              </ul>
            </div>

            {/* ON CAMPUS Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                ON CAMPUS
              </a>
              <ul className="dropdown-menu">
                
                <li><a className="dropdown-item" href="/joblist">View Registrations</a></li>
 
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
                <li><a className="dropdown-item" href="#" onClick={handleCreateRoom}>Mock Interview</a></li>
                <li><a className="dropdown-item" href="/userlist">Add Time Slot</a></li>
                <li><a className="dropdown-item" href="/monthpage">Review</a></li>
                <li><a className="dropdown-item" href="/meetings">Recordings</a></li>
               
              </ul>
            </div>

            {/* APTITUDE TEST Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                APTITUDE TEST
              </a>
              <ul className="dropdown-menu">
           
                <li><a className="dropdown-item" href="/weeklist">Aptitude Attendance</a></li>
            
                <li><a className="dropdown-item" href="/mcascoretable">Result</a></li>
           
              </ul>
            </div>

            {/* CODING TEST Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                CODING TEST
              </a>
              <ul className="dropdown-menu">
               
                <li><a className="dropdown-item" href="/submissionweeks">Coding Attendance</a></li>
    
                <li><a className="dropdown-item" href="/mcaFourweek">Result</a></li>
               
              </ul>
            </div>

             {/* INTERVIEW Dropdown */}
             <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              AI  INTERVIEW
              </a>
              <ul className="dropdown-menu">
    
                <li><a className="dropdown-item" href="/jobposition">Attendence</a></li>
                <li><a className="dropdown-item" href="/interviewtoppers">Result</a></li>
                <li><a className="dropdown-item" href="/deleteinterview"></a>Delete</li>
           
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

export default Mcanavbar;
