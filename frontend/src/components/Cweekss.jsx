import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Usernavbar1 from './Usernavbar1';


const Cweekss = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [weeks, setWeeks] = useState([]);

    // Fetch companies from API
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/companiesss'); // Adjust URL as necessary
                console.log('Fetched companies:', res.data);
                setCompanies(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching companies:', err);
                setError('Error fetching companies');
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    // Fetch weeks corresponding to the selected company
    const handleCompanyChange = async (e) => {
        const selected = e.target.value;
        setSelectedCompany(selected);
        if (selected) {
            try {
                const res = await axios.get(`http://localhost:5000/api/weeks/${selected}`); // Adjust URL as necessary
                console.log('Fetched weeks:', res.data);
                setWeeks(res.data);
            } catch (err) {
                console.error('Error fetching weeks:', err);
                setError('Error fetching weeks');
            }
        } else {
            setWeeks([]); // Reset weeks if no company is selected
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <Usernavbar1/>
           
            <div className="week-review">
                <h1 className="title">Registered Weeks</h1>
                
                <div>
                    <select 
                        onChange={handleCompanyChange} 
                        value={selectedCompany}
                        className="select-dropdown"
                    >
                        <option value="">Select a Company</option>
                        {companies.map((company, index) => (
                            <option key={index} value={company}>{company}</option>
                        ))}
                    </select>
                </div>
                
                <div className="card-container">
                    {weeks.map((week, index) => (
                        <div key={index} className="card">
                           <Link to={`/compiler/${selectedCompany}/${week}`} className="card-link">
                                <h3 className="card-title">Week {week}</h3>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                body {
                    background-color: #f0f2f5; /* Background color for the page */
                    margin: 0;
                    font-family: Arial, sans-serif;
                }
                .week-review {
                    width: 80%;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .title {
                    font-size: 24px;
                    color: #333;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .select-dropdown {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                    font-size: 16px;
                }
                .card-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                }
                .card {
                    background-color: #007bff; /* Change to your preferred color */
                    border: 1px solid #0056b3; /* Border color */
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    width: calc(30% - 20px); /* Responsive card width */
                    margin: 10px;
                    padding: 15px;
                    color: #fff; /* Card text color */
                    transition: transform 0.2s ease;
                    text-align: center;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                }
                .card-link {
                    text-decoration: none;
                    color: #ffffff; /* Card link color */
                }
                .card-title {
                    font-size: 18px;
                }
            `}</style>
        </div>
    );
};

export default Cweekss;
