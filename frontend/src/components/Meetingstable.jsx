import React, { useEffect, useState } from 'react';

const MeetingsTable = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/meetings')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        return response.json();
      })
      .then(data => {
        setMeetings(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading meetings...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Meetings</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Meeting ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>User ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Time Slot ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Recording</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map(meeting => (
            <tr key={meeting._id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{meeting._id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{meeting.userId}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{meeting.timeSlotId}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <a
                  href={`http://localhost:5000/${meeting.fileUrl.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Recording
                </a>
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {new Date(meeting.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeetingsTable;
