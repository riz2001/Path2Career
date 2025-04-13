import React from 'react';
import { useNavigate } from 'react-router-dom';

const Adminnavbar = () => {
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

           

            {/* ON CAMPUS Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                ON CAMPUS
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/AddJob">Add Job</a></li>
                <li><a className="dropdown-item" href="/mbajoblist">View Registrations</a></li>
                <li><a className="dropdown-item" href="/deletejobs">Delete</a></li>
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
            INTERVIEW Dropdown
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                INTERVIEW
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#" onClick={handleCreateRoom}>Mock Interview</a></li>
                <li><a className="dropdown-item" href="/userlist">Add Time Slot</a></li>
                <li><a className="dropdown-item" href="/monthpage">Review</a></li>
                <li><a className="dropdown-item" href="/deletemonth">Delete</a></li>
              </ul>
            </div> */}

            {/* APTITUDE TEST Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                APTITUDE TEST
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/addquestion">Add Aptitude Questions</a></li>
                <li><a className="dropdown-item" href="/updateaptitude">Update</a></li>
            
                <li><a className="dropdown-item" href="/aanswer">Add Solutions</a></li>
             
                <li><a className="dropdown-item" href="/deletequiz">Deletion</a></li>
              </ul>
            </div>

            {/* CODING TEST Dropdown */}
            <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                CODING TEST
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/Codingq">Add Coding Questions</a></li>
                <li><a className="dropdown-item" href="/Codingupdate">Updation</a></li>
             
                <li><a className="dropdown-item" href="/pasttestcases">Add Solutions</a></li>
             
                <li><a className="dropdown-item" href="/deletecode">Deletion</a></li>
              </ul>
            </div>

             {/* INTERVIEW Dropdown */}
             <div className="dropdown d-flex align-items-center mx-3">
              <a className="navbar-brand text-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              AI  INTERVIEW
              </a>
              <ul className="dropdown-menu">
    
             
                
                <li><a className="dropdown-item" href="/createinterview">CREATE INTERVIEW</a></li>
                <li><a className="dropdown-item" href="/deleteinterview">DELETE INTERVIEW</a></li>
           
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

export default Adminnavbar;
