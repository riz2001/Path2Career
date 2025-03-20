import React from 'react';
import { useNavigate } from 'react-router-dom';

const Usernavbar1 = () => {
  const navigate = useNavigate();

  // Styles for navbar items
  const styles = {
    navItem: {
      marginLeft: '10px',  // Add space between each item
      paddingTop: '0px',   // Align with other links
      paddingBottom: '0px' // Consistent padding for uniform height
    },
    dropdownItem: {
      cursor: 'pointer'
    }
  };

  // Function to handle room creation and navigate
  const handleCreateRoom = () => {
    const roomId = Date.now();  // Generate unique room ID
    navigate(`/room/${roomId}`);  // Navigate to the room with generated ID
  };

  // Function to handle signout
  const handleSignOut = () => {
    // Clear token and other session-related items
    sessionStorage.removeItem("token"); 
    sessionStorage.removeItem("userId"); 
    sessionStorage.clear();  // Optionally clear all session data

    // Redirect to the sign-in page
    navigate("/");
  };

  return (
    <nav className="navbar bg-dark border-bottom border-body" data-bs-theme="dark">
      <div className="container-fluid">
        <div className="d-flex justify-content-end align-items-center">
          <a className="navbar-brand text-light" href="#"><b>JOB CRACKER</b></a>
          <a className="navbar-brand text-light" href="/dashboard">DASHBOARD</a>
          
          {/* VIEW JOBS */}
          <a className="navbar-brand text-light" href="/ViewJobs">VIEW JOBS</a>

          {/* VIEW OFFCAMPUS */}
          <a className="navbar-brand text-light" href="/Soffcampus">VIEW OFFCAMPUS</a>

          {/* INTERVIEW DROPDOWN */}
          <div className="dropdown">
            <a className="navbar-brand dropdown-toggle text-light" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false" style={styles.navItem}>
              GD
            </a>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
              <li><a className="dropdown-item" onClick={handleCreateRoom} style={styles.dropdownItem}>MOCK INTERVIEW</a></li>
              <li><a className="dropdown-item" href="/user/timeslots" style={styles.dropdownItem}>SLOT BOOKING</a></li>
            </ul>
          </div>

          {/* APTITUDE DROPDOWN */}
          <div className="dropdown">
            <a className="navbar-brand dropdown-toggle text-light" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false" style={styles.navItem}>
              APTITUDE
            </a>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
              <li><a className="dropdown-item" href="/weekreview" style={styles.dropdownItem}>APTITUDE TEST</a></li>
              <li><a className="dropdown-item" href="/Qusers" style={styles.dropdownItem}>APTITUDE ATTENDANCE</a></li>
              <li><a className="dropdown-item" href="/aanswerview" style={styles.dropdownItem}>SOLUTION</a></li>
            </ul>
          </div>

          <div className="dropdown">
            <a className="navbar-brand dropdown-toggle text-light" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false" style={styles.navItem}>
              AI INTERVIEW
            </a>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
              <li><a className="dropdown-item" href="/i"  style={styles.dropdownItem}>MOCK INTERVIEW</a></li>
   
              <li><a className="dropdown-item" href="/userinterviews" style={styles.dropdownItem}>HISTORY</a></li>
            </ul>
          </div>
 {/* CODING DROPDOWN */}
 <div className="dropdown">
            <a className="navbar-brand dropdown-toggle text-light" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false" style={styles.navItem}>
            PERFORMANCE ANALYSIS
            </a>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
              <li><a className="dropdown-item" href="/prediction" style={styles.dropdownItem}>ANALYSIS</a></li>
           
            </ul>
          </div>

          {/* CODING DROPDOWN */}
          <div className="dropdown">
            <a className="navbar-brand dropdown-toggle text-light" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false" style={styles.navItem}>
              CODING
            </a>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
              <li><a className="dropdown-item" href="Cweeks" style={styles.dropdownItem}>CODING TEST</a></li>
              <li><a className="dropdown-item" href="/ucompilers" style={styles.dropdownItem}>CODING ATTENDANCE</a></li>
              <li><a className="dropdown-item" href="/Passeddisplay" style={styles.dropdownItem}>SOLUTION</a></li>
             
            </ul>
          </div>
          <a className="navbar-brand text-light" href="#"></a>
          <a className="navbar-brand text-light" href="#"></a>
          <a className="navbar-brand text-light" href="#"></a>
          <a className="navbar-brand text-light" href="#"></a>
          <a className="navbar-brand text-light" href="#"></a>
         
          
          

          {/* PROFILE & SIGNOUT DROPDOWN */}
          <div className="dropdown">
            <a className="navbar-brand dropdown-toggle text-light" href="#" role="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={styles.navItem}>
    <img src="https://tse2.mm.bing.net/th?id=OIP.bLJZE3pkcemcxyYfrliB4AHaHa&pid=Api&P=0&h=220" width="50" height="40"></img>
            </a>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li><a className="dropdown-item" href="/profilepage" style={styles.dropdownItem}>View Profile</a></li>
              <li><a className="dropdown-item" onClick={handleSignOut} style={styles.dropdownItem}>Sign Out</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Usernavbar1;
