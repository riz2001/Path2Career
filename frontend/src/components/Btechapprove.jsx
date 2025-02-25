import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Btechapprove = () => {
    const [unapprovedUsers, setUnapprovedUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [approvedUser, setApprovedUser] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');

    // B.Tech Year/Batch options
    const courseYears = [
        'First Year A Batch', 'First Year B Batch', 'First Year C Batch',
        'Second Year A Batch', 'Second Year B Batch', 'Second Year C Batch',
        'Third Year A Batch', 'Third Year B Batch', 'Third Year C Batch',
        'Fourth Year A Batch', 'Fourth Year B Batch', 'Fourth Year C Batch'
    ];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/btech-unapproved-users');
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

            const userToApprove = unapprovedUsers.find(user => user._id === userId);
            if (userToApprove) {
                setApprovedUsers([...approvedUsers, { ...userToApprove, approved: true }]);
                setUnapprovedUsers(unapprovedUsers.filter(user => user._id !== userId));

                // Show popup with approved user details
                setApprovedUser(userToApprove);
                setShowPopup(true);
            }
        } catch (error) {
            setMessage('Error approving user');
        }
    };

    const deleteUser = async (userId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/users/delete/${userId}`);
            alert(response.data.message);
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

    // Filter only B.Tech users
    const filteredUnapprovedUsers = unapprovedUsers
        .filter(user => user.batch !== "MCA" && user.batch !== "MBA" && (selectedYear ? user.courseYear === selectedYear : true))
        .sort((a, b) => a.rollno.localeCompare(b.rollno));

    const filteredApprovedUsers = approvedUsers
        .filter(user => user.batch !== "MCA" && user.batch !== "MBA" && (selectedYear ? user.courseYear === selectedYear : true))
        .sort((a, b) => a.rollno.localeCompare(b.rollno));

    return (
        <div style={styles.container}>
            <br />
            <h2 style={styles.heading}>Approve B.Tech Users</h2>
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

            {/* Unapproved Users Table */}
            <h3>Unapproved B.Tech Users</h3>
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
                                    <button style={styles.deleteButton} onClick={() => deleteUser(user._id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={styles.noUsersMessage}>No unapproved B.Tech users available.</p>
            )}

            {/* Approved Users Table */}
            <h3>Approved B.Tech Users</h3>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={styles.noUsersMessage}>No approved B.Tech users available.</p>
            )}
        </div>
    );
};

export default Btechapprove;

// 🔹 Styles Added Here (Fix for "styles is not defined" error)
const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center', backgroundColor: '#f2f2f2', minHeight: '100vh' },
    heading: { fontSize: '2em', marginBottom: '20px', color: '#333', textAlign: 'center' },
    table: { margin: '0 auto', width: '80%', backgroundColor: '#f8f9fa' },
    th: { padding: '12px', textAlign: 'left' },
    td: { padding: '10px' },
    approveButton: { backgroundColor: '#28a745', color: 'white', padding: '8px 12px', cursor: 'pointer' },
    deleteButton: { backgroundColor: '#dc3545', color: 'white', padding: '8px 12px', cursor: 'pointer', marginLeft: '8px' },
    approvedText: { color: 'green', fontWeight: 'bold' },
};
