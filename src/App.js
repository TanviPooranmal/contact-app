// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

const LandingPage = ({ showApp }) => {
  return (
    <main className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h2>Effortlessly Manage Your Contacts</h2>
          <p>A simple and intuitive way to organize and stay connected with your contacts.</p>
          <button onClick={showApp}>Get Started</button>
        </div>
      </section>
    </main>
  );
};

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [showMainApp, setShowMainApp] = useState(false);
  const [loading] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const fetchContacts = async () => {
    const querySnapshot = await getDocs(collection(db, 'contacts'));
    const contactsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setContacts(contactsData);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const showApp = () => {
    setShowMainApp(true);
  };

  const toggleContacts = () => {
    setShowContacts(!showContacts);
  };

  return (
    <div className="App">
      <header>
        <div className="logo">
          <img src="../logo.png" alt="App Logo" />
          <h1>Contact Manager</h1>
        </div>
      </header>
      {showMainApp ? (
        <main>
          <div className="form-container">
            <ContactForm fetchContacts={fetchContacts} currentContact={currentContact} setCurrentContact={setCurrentContact} />
          </div>
          <button onClick={toggleContacts} className="toggle-contacts-btn">
            {showContacts ? 'Hide Contacts' : 'Show Contacts'}
          </button>
          {showContacts && (
            <ContactList contacts={contacts} fetchContacts={fetchContacts} setCurrentContact={setCurrentContact} />
          )}
        </main>
      ) : (
        <LandingPage showApp={showApp} />
      )}
      {loading && (
        <div className="loader"></div> // Show loader during adding, updating, or deleting
      )}
    </div>
  );
};

export default App;
