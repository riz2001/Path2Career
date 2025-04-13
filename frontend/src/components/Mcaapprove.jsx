import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Adminnavbar from './Adminnavbar';
import './Background.css';
import Mcanavbar from './Mcaanavbar';

const Approve = () => {
    const [unapprovedUsers, setUnapprovedUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [approvedUser, setApprovedUser] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');
    const courseYears = ['First Year A Batch', 'First Year B Batch', 'Second Year A Batch', 'Second Year B Batch'];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/mcaunapproved-users');
                const { unapprovedUsers, approvedUsers } = response.data;

                setUnapprovedUsers(unapprovedUsers);
                setApprovedUsers(approvedUsers);
            } catch (error) {
                setMessage('Error fetching users');
            }
        };

        fetchUsers();
    }, []);

    const approveUser = async (userId) => {
        try {
            const response = await axios.put(`http://localhost:5000/approve/${userId}`);
            setMessage(response.data.message);
            setApprovedUser(response.data.user);
            setShowPopup(true);

            const userToApprove = unapprovedUsers.find(user => user._id === userId);
            if (userToApprove) {
                setApprovedUsers([...approvedUsers, { ...userToApprove, approved: true }]);
                setUnapprovedUsers(unapprovedUsers.filter(user => user._id !== userId));
            }
        } catch (error) {
            setMessage('Error approving user');
        }
    };

    const deleteUser = async (userId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/users/delete/${userId}`);
            alert(response.data.message);
            // Update the user list in state after deletion
            setUnapprovedUsers(unapprovedUsers.filter(user => user._id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };
    
    const closePopup = () => {
        setShowPopup(false);
        setApprovedUser(null);
    };

    const filteredUnapprovedUsers = unapprovedUsers
        .filter(user => (selectedYear ? user.courseYear === selectedYear : true))
        .sort((a, b) => a.rollno.localeCompare(b.rollno));

    const filteredApprovedUsers = approvedUsers
        .filter(user => (selectedYear ? user.courseYear === selectedYear : true))
        .sort((a, b) => a.rollno.localeCompare(b.rollno));

    return (
        <div style={styles.container}>
            <Mcanavbar/>
            <br />
            <h2 style={styles.heading}>Approve Users</h2>
            {message && <p style={styles.message}>{message}</p>}

            <label style={styles.label} htmlFor="courseYear">Filter by Course Year:</label>
            <select
                id="courseYear"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={styles.select}
            >
                <option value="">All</option>
                {courseYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            <h3>Unapproved Users</h3>
            {filteredUnapprovedUsers.length > 0 ? (
                <table style={styles.table}>
                    <thead style={styles.thead}>
                        <tr>
                            <th style={styles.th}>Roll No</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Admission No</th>
                            <th style={styles.th}>Course Year</th>
                            <th style={styles.th}>Phone No</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUnapprovedUsers.map((user) => (
                            <tr key={user._id} style={styles.row}>
                                <td style={styles.td}>{user.rollno}</td>
                                <td style={styles.td}>{user.name}</td>
                                <td style={styles.td}>{user.admissionno}</td>
                                <td style={styles.td}>{user.courseYear}</td>
                                <td style={styles.td}>{user.phoneno}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>
                                    <button style={styles.approveButton} onClick={() => approveUser(user._id)}>
                                        Approve
                                    </button>
                                    <button style={styles.deleteButton} onClick={() => deleteUser(user._id, false)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={styles.noUsersMessage}>No unapproved users available.</p>
            )}

            <h3>Approved Users</h3>
            {filteredApprovedUsers.length > 0 ? (
                <table style={styles.table}>
                    <thead style={styles.thead}>
                        <tr>
                            <th style={styles.th}>Roll No</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Admission No</th>
                            <th style={styles.th}>Course Year</th>
                            <th style={styles.th}>Phone No</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApprovedUsers.map((user) => (
                            <tr key={user._id} style={styles.row}>
                                <td style={styles.td}>{user.rollno}</td>
                                <td style={styles.td}>{user.name}</td>
                                <td style={styles.td}>{user.admissionno}</td>
                                <td style={styles.td}>{user.courseYear}</td>
                                <td style={styles.td}>{user.phoneno}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>
                                    <span style={styles.approvedText}>Approved</span>
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.deleteButton} onClick={() => deleteUser(user._id, true)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={styles.noUsersMessage}>No approved users available.</p>
            )}

            {showPopup && (
                <div style={styles.popup}>
                    <div style={styles.popupContent}>
                        <h3>User Approved</h3>
                        {approvedUser && (
                            <p>{approvedUser.name} has been approved successfully!</p>
                        )}
                        <button style={styles.closeButton} onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Approve;

// Styles

    // Previous styles here...
  
// Styles
const styles = {
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        cursor: 'pointer',
        marginLeft: '8px',
    },
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        backgroundColor: '#f2f2f2',
        minHeight: '100vh',
    },
    heading: {
        fontSize: '2em',
        marginBottom: '20px',
        color: '#333',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    label: {
        marginRight: '10px',
        fontSize: '1em',
    },
    select: {
        padding: '10px',
        fontSize: '1em',
        marginBottom: '20px',
    },
    message: {
        color: 'red',
        fontWeight: 'bold',
    },
    noUsersMessage: {
        fontSize: '1.2em',
        color: '#555',
    },
    table: {
        margin: '0 auto',
        borderCollapse: 'separate',
        borderSpacing: '0 10px',
        width: '80%',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    thead: {
        backgroundColor: '#007bff',
        color: 'white',
    },
    th: {
        padding: '12px',
        fontSize: '1.1em',
        textAlign: 'left',
    },
    td: {
        padding: '15px 10px',
    },
    row: {
        backgroundColor: 'white',
        transition: 'background-color 0.3s',
    },
    approvedText: {
        color: 'green',
        fontWeight: 'bold',
    },
    approveButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    popup: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContent: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        cursor: 'pointer',
    },
};
