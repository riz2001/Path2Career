import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Usernavbar1 from './Usernavbar1';

const Dashboard = () => {
  const cardStyle = {
    transition: "transform 0.3s ease",
  };

  const imgStyle = {
    transition: "transform 0.3s ease",
    height: "300px",
  };

  const handleCardHover = (e) => {
    e.currentTarget.style.transform = "scale(1.05)";
  };

  const handleCardLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
  };

  const handleImgHover = (e) => {
    e.currentTarget.style.transform = "scale(1.1)";
  };

  const handleImgLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <div>
      <Usernavbar1 />
      <div>
        <h1><marquee><b>JOB CRACKER</b></marquee></h1>
        <br />
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div id="carouselExampleIndicators" className="carousel slide">
                <div className="carousel-indicators">
                  <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                  <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                  <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                </div>
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <img
                      src="https://fisat.ac.in/wp-content/uploads/2022/07/Careers-banner.jpg"
                      className="d-block w-100"
                      alt="..."
                      style={{ height: "400px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      src="https://tse3.mm.bing.net/th?id=OIP.Vp7Kl58nNwur9dZ4LtbP5wHaCv&pid=Api&P=0&h=220"
                      className="d-block w-100"
                      alt="..."
                      style={{ height: "400px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      src="https://www.cmrit.ac.in/wp-content/uploads/2021/07/careers.jpg"
                      className="d-block w-100"
                      alt="..."
                      style={{ height: "400px", objectFit: "cover" }}
                    />
                  </div>
                </div>

                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <br />
        <div className="container">
          <div className="row">
            <h2 align="center">MODULES</h2>
          </div>
        </div>
        <br />
        <div className="container">
          {/* First row with 3 images */}
          <div className="row">
            <div className="col col-12 col-sm-4">
              <a href="/Viewjobs" style={{ textDecoration: 'none' }}>
                <div
                  className="card mb-3"
                  style={cardStyle}
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardLeave}
                >
                  <img
                    src="https://tse4.mm.bing.net/th?id=OIP.YMgl1tNlD8gzvaqSADs_wgHaHa&pid=Api&P=0&h=220"
                    className="card-img-top"
                    alt="ONCAMPUS"
                    style={imgStyle}
                    onMouseEnter={handleImgHover}
                    onMouseLeave={handleImgLeave}
                  />
                  <div className="card-body">
                    <h5 className="card-title">ONCAMPUS JOBS</h5>
                  </div>
                </div>
              </a>
            </div>

            <div className="col col-12 col-sm-4">
              <a href="/soffcampus" style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={cardStyle}
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardLeave}
                >
                  <img
                    src="https://tse3.mm.bing.net/th?id=OIP.E9F_PkXiaQPfHmnRwsElWAHaF4&pid=Api&P=0&h=220"
                    className="card-img-bottom"
                    alt="OffCampus Jobs"
                    style={imgStyle}
                    onMouseEnter={handleImgHover}
                    onMouseLeave={handleImgLeave}
                  />
                  <div className="card-body">
                    <h5 className="card-title">OFFCAMPUS JOBS</h5>
                  </div>
                </div>
              </a>
            </div>

            <div className="col col-12 col-sm-4">
              <a href="/weekreview" style={{ textDecoration: 'none' }}>
                <div
                  className="card mb-3"
                  style={cardStyle}
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardLeave}
                >
                  <img
                    src="https://tse1.mm.bing.net/th?id=OIP.Tvghn91nIgoytbQcP2sVZgHaH6&pid=Api&P=0&h=220"
                    className="card-img-top"
                    alt="Aptitude Test"
                    style={imgStyle}
                    onMouseEnter={handleImgHover}
                    onMouseLeave={handleImgLeave}
                  />
                  <div className="card-body">
                    <h5 className="card-title">APTITUDE TEST</h5>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Second row with 2 images */}
          <div className="row justify-content-center">
            <div className="col col-12 col-sm-4">
              <a href="/room/:roomid" style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={cardStyle}
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardLeave}
                >
                  <img
                    src="https://tse2.mm.bing.net/th?id=OIP.OmWy9DucTkNghv2ia9rCugAAAA&pid=Api&P=0&h=220"
                    className="card-img-bottom"
                    alt="Mock Interview"
                    style={imgStyle}
                    onMouseEnter={handleImgHover}
                    onMouseLeave={handleImgLeave}
                  />
                  <div className="card-body">
                    <h5 className="card-title">MOCK INTERVIEW</h5>
                  </div>
                </div>
              </a>
            </div>

            <div className="col col-12 col-sm-4">
              <a href="/Cweeks" style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={cardStyle}
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardLeave}
                >
                  <img
                    src="https://tse1.mm.bing.net/th?id=OIP.tBRZfgHjbMUvNP6Lee49CQAAAA&pid=Api&P=0&h=220"
                    alt="Coding Test"
                    style={imgStyle}
                    onMouseEnter={handleImgHover}
                    onMouseLeave={handleImgLeave}
                  />
                  <div className="card-body">
                    <h5 className="card-title">CODING TEST</h5>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
