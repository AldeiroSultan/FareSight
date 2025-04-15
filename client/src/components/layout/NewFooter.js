// client/src/components/layout/NewFooter.js
import React from 'react';
import { Link } from 'react-router-dom';

const NewFooter = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <i className="fas fa-paper-plane"></i>
            <span>FareSight</span>
            <p>Track flight prices. Get the best deals.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h3>Company</h3>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Support</h3>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FareSight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;