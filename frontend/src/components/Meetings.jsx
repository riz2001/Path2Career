// src/components/MeetingsTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Usernavbar1 from './Usernavbar1';
import Mcanavbar from './Mcaanavbar';


const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null); // State to track which video to show

  // Fetch meetings data from backend API on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/meetings')
      .then(response => {
        setMeetings(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><p>Loading meetings...</p></div>;
  if (error) return <div className="container"><p>Error: {error}</p></div>;

  return (
    <div>
        <Mcanavbar/>

      <div className="container">
        <h2 className="header">Meetings</h2>
        <table className="meetings-table">
          <thead>
            <tr>
              <th>SL No</th>
              <th>Meeting ID</th>
              <th>User ID</th>
              <th>Time Slot ID</th>
              <th>Recording</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting, index) => (
              <tr key={meeting._id} className={index % 2 === 0 ? 'even' : ''}>
                <td>{index + 1}</td>
                <td>{meeting._id}</td>
                <td>{meeting.userId}</td>
                <td>{meeting.timeSlotId}</td>
                <td>
                  <button
                    onClick={() =>
                      setSelectedVideo(
                        `http://localhost:5000/${meeting.fileUrl.replace(/\\/g, '/')}`
                      )
                    }
                  >
                    View Recording
                  </button>
                </td>
                <td>{new Date(meeting.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedVideo && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-button" onClick={() => setSelectedVideo(null)}>
                &times;
              </button>
              <video controls autoPlay style={{ width: '100%' }}>
                <source src={selectedVideo} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        <style jsx>{`
          .container {
            max-width: 1000px;
            margin: 20px auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            font-family: Arial, sans-serif;
          }
          .header {
            text-align: center;
            color: #4CAF50;
            margin-bottom: 20px;
            font-size: 28px;
          }
          .meetings-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .meetings-table th,
          .meetings-table td {
            padding: 15px;
            border: 1px solid #ddd;
            text-align: left;
            font-size: 16px;
          }
          .meetings-table th {
            background-color: #007bff;
            color: #ffffff;
          }
          .even {
            background-color: #f9f9f9;
          }
          .meetings-table button {
            background: none;
            border: none;
            color: #007bff;
            text-decoration: underline;
            cursor: pointer;
            font-size: 16px;
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modal-content {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 800px;
            position: relative;
          }
          .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff0000;
            color: #fff;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 50%;
            font-size: 20px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Meetings;
