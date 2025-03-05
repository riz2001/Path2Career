import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Mcanavbar from './Mcaanavbar';
import Mbanavbar from './Mbanavbar';


const Mbaweekslist = () => {
  const [weeks, setWeeks] = useState([]);
  const [error, setError] = useState(null);

  // Fetch weeks from the backend when the component mounts
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/weeks');
        setWeeks(response.data);
      } catch (error) {
        setError('Error fetching weeks');
      }
    };

    fetchWeeks();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
<Mbanavbar/>
   <br></br>
    <div className="main-page">
      <h2 className="title">Available Weeks</h2>
      <div className="card-container">
        {weeks.map((week) => (
          <div key={week} className="card">
            <Link to={`/mbasubmissions/${week}`} className="card-link">
              <h3 className="card-title">Week {week}</h3>
            </Link>
          
          </div>
         
        ))}
          </div>
      </div>
      <style jsx>{`
        /* Apply background color to the entire page */
        body {
          background-color: #f0f2f5; /* Light gray background for the whole page */
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }

        .main-page {
          width: 80%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background-color: #ffffff; /* White background for the content area */
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .title {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
        }

        .card-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }

        .card {
          background-color: #007bff; /* Custom blue background for the cards */
          border: 1px solid #0056b3; /* Darker blue border for contrast */
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          width: 200px;
          text-align: center;
          padding: 15px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          color: #fff; /* White text for better readability */
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          background-color: #0056b3; /* Darker blue on hover */
        }

        .card-link {
          text-decoration: none;
          color: #ffffff;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        .card-title {
          font-size: 18px;
          color: #fff; /* White text for better readability */
        }

        .error {
          text-align: center;
          font-size: 18px;
          color: #ff0000;
        }
      `}</style>
    </div>
  );
};

export default Mbaweekslist;
