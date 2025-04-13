import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Adminnavbar from './Adminnavbar';
import Mcanavbar from './Mcaanavbar';

// CSS Styles
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '28px',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center'
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  th: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: '1px solid #ddd',
    padding: '10px',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ddd',
    padding: '10px',
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#45a049',
  },
  formContainer: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  formInput: {
    padding: '10px',
    margin: '5px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
  },
  formButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  cancelButton: {
    backgroundColor: 'red',
    marginLeft: '10px',
  },
  noUsers: {
    color: 'red',
    marginTop: '20px',
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: '20px',
  },
  filterLabel: {
    marginRight: '10px',
  },
  select: {
    padding: '10px',
    margin: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [slotData, setSlotData] = useState({ timeSlot: '', date: '', meetingLink: '' });
  const [courseYearFilter, setCourseYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/userss');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching users.');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Toggle multi-selection
  const handleUserSelect = (user) => {
    setSelectedUsers(prevState => {
      if (prevState.find(u => u._id === user._id)) {
        return prevState.filter(u => u._id !== user._id);
      }
      return [...prevState, user];
    });
  };

  const handleSlotChange = (e) => {
    const { name, value } = e.target;
    setSlotData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Submission: sends selected user IDs and slot details to the backend
  const handleSubmitSlot = async (e) => {
    e.preventDefault();
    if (!slotData.timeSlot || !slotData.date || !slotData.meetingLink || selectedUsers.length === 0) {
      alert('Please fill in all fields and select at least one user');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/addtimeslot', {
        userIds: selectedUsers.map(user => user._id),
        timeSlot: slotData.timeSlot,
        date: slotData.date,
        meetingLink: slotData.meetingLink,
      });
      alert(response.data.message);
      setSelectedUsers([]);
      setSlotData({ timeSlot: '', date: '', meetingLink: '' });
    } catch (error) {
      console.error('Error adding time slot:', error);
      alert(error.response?.data?.message || 'Error adding time slot');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Helper to return a date string "YYYY-MM" from a date
  const getMonthYearString = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    return `${year}-${month < 9 ? '0' + (month + 1) : month + 1}`;
  };

  // Group a user's timeSlots by month (key = "YYYY-MM")
  const groupSlotsByMonth = (timeSlots) => {
    const slotsByMonth = {};
    timeSlots.forEach(slot => {
      const date = new Date(slot.date);
      const monthYear = getMonthYearString(date);
      if (!slotsByMonth[monthYear]) {
        slotsByMonth[monthYear] = [];
      }
      slotsByMonth[monthYear].push(slot);
    });
    return slotsByMonth;
  };

  const courseYears = Array.from(new Set(users.map(user => user.courseYear)));
  const allMonths = Array.from(new Set(users.flatMap(user => Object.keys(groupSlotsByMonth(user.timeSlots)))));

  const getMonthName = (monthKey) => {
    const monthIndex = parseInt(monthKey.split('-')[1], 10) - 1;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthIndex];
  };

  // Compute available groups for the selected month.
  // For each user, we take the lowest numeric value from their slots' group.
  let availableGroups = [];
  if (monthFilter) {
    const groupsSet = new Set();
    users.forEach(user => {
      if (user.timeSlots) {
        const userSlots = user.timeSlots.filter(slot => getMonthYearString(new Date(slot.date)) === monthFilter);
        if (userSlots.length) {
          // Parse the numeric part from each group string (e.g., "Group1" -> 1)
          const userGroup = Math.min(...userSlots.map(slot => parseInt(slot.group.replace(/\D/g, ''))));
          groupsSet.add(userGroup);
        }
      }
    });
    availableGroups = Array.from(groupsSet).sort((a, b) => a - b);
  }

  // Filter users based on course year and, if a month and group filter are selected,
  // compute the user's group (lowest numeric value) and compare it.
  const filteredUsers = users.filter(user => {
    const matchesCourseYear = courseYearFilter ? user.courseYear === courseYearFilter : true;
    if (!monthFilter) return matchesCourseYear;
    const userSlots = user.timeSlots.filter(slot => getMonthYearString(new Date(slot.date)) === monthFilter);
    const userGroup = userSlots.length ? Math.min(...userSlots.map(slot => parseInt(slot.group.replace(/\D/g, '')))) : null;
    if (groupFilter !== "") {
      return matchesCourseYear && userGroup === Number(groupFilter);
    }
    return matchesCourseYear;
  }).sort((a, b) => a.rollno - b.rollno);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div>
      <Mcanavbar />
      <div style={styles.container}>
        <h2 style={styles.title}>ADD TIME SLOT</h2>
        
        {/* Filter Section */}
        <div style={styles.filterContainer}>
          <label style={styles.filterLabel} htmlFor="courseYearFilter">Filter by Course Year:</label>
          <select
            id="courseYearFilter"
            value={courseYearFilter}
            onChange={(e) => setCourseYearFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All</option>
            {courseYears.map((year, index) => (
              <option key={index} value={year}>{year}</option>
            ))}
          </select>

          <label style={styles.filterLabel} htmlFor="monthFilter">Filter by Month:</label>
          <select
            id="monthFilter"
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setGroupFilter(''); // reset group filter when month changes
            }}
            style={styles.select}
          >
            <option value="">All</option>
            {allMonths.map((month, index) => (
              <option key={index} value={month}>
                {getMonthName(month)} {month.split('-')[0]}
              </option>
            ))}
          </select>

          {/* Show filter by group if a month is selected */}
          {monthFilter && (
            <>
              <label style={styles.filterLabel} htmlFor="groupFilter">Filter by Group:</label>
              <select
                id="groupFilter"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                style={styles.select}
              >
                <option value="">All</option>
                {availableGroups.map((group) => (
                  <option key={group} value={group}>{`Group${group}`}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Display number of filtered users */}
        <div style={styles.title}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'} Found
        </div>

        <div style={styles.tableContainer}>
          {filteredUsers.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  {/* Checkbox header for multi-select */}
                  <th style={styles.th}>Select</th>
                  <th style={styles.th}>Roll No</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Admission No</th>
                  <th style={styles.th}>Email</th>
                  {monthFilter && <th style={styles.th}>Group</th>}
                  <th style={styles.th}>Course Year</th>
                  {monthFilter && <th style={styles.th}>Time Slots for {monthFilter}</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const slotsByMonth = groupSlotsByMonth(user.timeSlots);
                  const isChecked = selectedUsers.some(u => u._id === user._id);
                  const userSlotsForMonth = slotsByMonth[monthFilter] || [];
                  const userGroup = userSlotsForMonth.length 
                    ? Math.min(...userSlotsForMonth.map(slot => parseInt(slot.group.replace(/\D/g, ''))))
                    : 'No group';
                  return (
                    <tr key={user._id}>
                      <td style={styles.td}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleUserSelect(user)}
                        />
                      </td>
                      <td style={styles.td}>{user.rollno}</td>
                      <td style={styles.td}>{user.name}</td>
                      <td style={styles.td}>{user.admissionno}</td>
                      <td style={styles.td}>{user.email}</td>
                      {monthFilter && <td style={styles.td}>{userSlotsForMonth.length ? `Group${userGroup}` : 'No group'}</td>}
                      <td style={styles.td}>{user.courseYear}</td>
                      {monthFilter && (
                        <td style={styles.td}>
                          {userSlotsForMonth.length > 0
                            ? userSlotsForMonth.map((slot, index) => (
                                <div key={index}>
                                  {slot.timeSlot} - {formatDate(slot.date)}
                                </div>
                              ))
                            : 'No slots available'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={styles.noUsers}>No users found.</div>
          )}
        </div>

        {/* Add Slot Form for selected users */}
        {selectedUsers.length > 0 && (
          <div style={{ ...styles.formContainer, width: '400px', margin: '0 auto' }}>
            <h3>Add Time Slot for Selected Users</h3>
            <form onSubmit={handleSubmitSlot}>
              <input
                type="text"
                name="timeSlot"
                placeholder="Time Slot"
                value={slotData.timeSlot}
                onChange={handleSlotChange}
                style={styles.formInput}
              />
              <input
                type="date"
                name="date"
                value={slotData.date}
                onChange={handleSlotChange}
                style={styles.formInput}
              />
              <input
                type="text"
                name="meetingLink"
                placeholder="Meeting Link"
                value={slotData.meetingLink}
                onChange={handleSlotChange}
                style={styles.formInput}
              />
              <button type="submit" style={styles.formButton}>Submit</button>
              <button
                type="button"
                onClick={() => setSelectedUsers([])}
                style={{ ...styles.formButton, ...styles.cancelButton }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
