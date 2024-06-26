// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);

  const fetchContacts = async () => {
    const querySnapshot = await getDocs(collection(db, 'contacts'));
    const contactsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setContacts(contactsData);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="App">
      <h1>Contact App</h1>
      <ContactForm fetchContacts={fetchContacts} currentContact={currentContact} setCurrentContact={setCurrentContact} />
      <ContactList contacts={contacts} fetchContacts={fetchContacts} setCurrentContact={setCurrentContact} />
    </div>
  );
};

export default App;
