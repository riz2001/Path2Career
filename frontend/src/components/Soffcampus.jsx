import React, { useEffect, useState } from 'react';
import axios from 'axios';


import Adminnavbar from './Adminnavbar';

// CSS styles as a string
const styles = {
  container: {
    maxWidth: '1200px', // Wider container for more cards
    margin: '20px auto',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  cardContainer: {
    display: 'flex',
    flexWrap: 'wrap', // Allows wrapping to the next line
    justifyContent: 'space-between', // Space between cards
  },
  card: {
    backgroundColor: '#ffffff', // Set card background to white
    borderRadius: '12px',
    padding: '20px',
    margin: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    flex: '1 1 calc(30% - 20px)', // Adjusted width to fit 3 cards
    maxWidth: 'calc(30% - 20px)', // Adjusted max width to fit 3 cards
    position: 'relative',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  linkText: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.1em', // Slightly larger font size
  },
  cardHeading: {
    margin: '10px 0',
    fontSize: '1.6em', // Larger font size for company name
    fontWeight: '700', // Bolder font weight
    color: '#343a40', // Darker color for contrast
    textTransform: 'uppercase', // Uppercase for style
  },
  cardImage: {
    maxWidth: '100%',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.3s',
    border: '3px solid rgba(0, 123, 255, 0.5)', // Colorful border
  },
  cardImageHover: {
    transform: 'scale(1.05)',
  },
  detailText: {
    margin: '5px 0',
    color: '#495057',
    fontSize: '1em', // Adjusted font size for details
  },
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  modalVisible: {
    opacity: 1,
  },
  modalImage: {
    maxWidth: '80%',
    maxHeight: '80%',
    borderRadius: '8px',
  },
  closeModal: {
    position: 'absolute',
    top: '20px',
    right: '30px',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
  },
};

const Soffcampus = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalImage, setModalImage] = useState(null); // State for modal image
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/offcampussubmissions');
        setSubmissions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching submissions.');
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const openModal = (image) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
       <Adminnavbar/>
  
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}><b>OFFCAMPUS JOBS </b></h2>
      {submissions.length > 0 ? (
        <div style={styles.cardContainer}>
          {submissions.map((submission) => (
            <div 
              key={submission._id} 
              style={styles.card}
              onMouseEnter={(e) => (e.currentTarget.style.transform = styles.cardHover.transform)}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              {submission.image && (
                <img
                  src={`http://localhost:5000/${submission.image}`} // Adjust the URL if necessary
                  alt={`${submission.companyName} logo`}
                  style={styles.cardImage}
                  onClick={() => openModal(`http://localhost:3030/${submission.image}`)} // Opens the image in modal
                  onMouseEnter={(e) => (e.currentTarget.style.transform = styles.cardImageHover.transform)}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                />
              )}
              <h3 style={styles.cardHeading}>{submission.companyName}</h3> {/* Display only company name */}
              <p style={styles.detailText}>Salary: {submission.salary}</p>
              <p style={styles.detailText}>Location: {submission.location}</p>
              <p style={styles.detailText}>
                Application Link: 
                <a
                  href={submission.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.linkText}
                >
                  Apply Here
                </a>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No submissions found.</p>
      )}

      {/* Modal for Enlarged Image */}
      {isModalOpen && (
        <div style={{ ...styles.modal, ...(isModalOpen ? styles.modalVisible : {}) }}>
          <span style={styles.closeModal} onClick={closeModal}>&times;</span>
          <img src={modalImage} alt="Enlarged view" style={styles.modalImage} />
        </div>
      )}
    </div>
    </div>
  );
};

export default Soffcampus;
