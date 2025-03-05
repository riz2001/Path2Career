import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Usernavbar1 from './Usernavbar1';


const Weekreview = () => {
  const [companies, setCompanies] = useState([]); // State to hold list of companies
  const [selectedCompany, setSelectedCompany] = useState(''); // State to hold selected company
  const [weeks, setWeeks] = useState([]); // State to hold weeks for selected company

  // Fetch companies when component mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/companies'); // Endpoint to get companies
        setCompanies(response.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch weeks based on selected company
 // Fetch weeks based on selected company
useEffect(() => {
  if (!selectedCompany) return; // Exit if no company selected

  const fetchWeeks = async () => {
    try {
      // Include the selected company as a query parameter in the request
      const response = await axios.get(`http://localhost:5000/api/weekssss`, {
        params: { company: selectedCompany },
      });
      setWeeks(response.data); // Set weeks based on response
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

  fetchWeeks();
}, [selectedCompany]);

  return (
    <div>
<Usernavbar1/>
      <br />
      <div className="week-review">
        <h2 className="title">Select Company</h2>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          style={{ padding: '8px', marginBottom: '20px', fontSize: '16px' }}
        >
          <option value="">-- Select a Company --</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>

        {selectedCompany && (
          <>
            <h2 className="title">Available Weeks for {selectedCompany}</h2>
            <div className="card-container">
              {weeks.map((week) => (
                <div key={week} className="card">
               <Link to={`/company/${selectedCompany}/week/${week}`} className="card-link">
  <h3 className="card-title">Week {week}</h3>
</Link>

                </div>
              ))}
            </div>
          </>
        )}
        
        <style jsx>{`
          body {
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }

          .week-review {
            width: 80%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            background-color: #ffffff;
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
            background-color: #007bff;
            border: 1px solid #0056b3;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            width: 200px;
            text-align: center;
            padding: 15px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            color: #fff;
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            background-color: #0056b3;
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
            color: #fff;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Weekreview;
