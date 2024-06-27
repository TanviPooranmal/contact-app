// src/components/ContactList.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';

const ContactList = ({ contacts, fetchContacts, setCurrentContact }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id) => {
    setLoading(true);
    await deleteDoc(doc(db, 'contacts', id));
    setLoading(false);
    fetchContacts();
  };

  return (
    <div className="loader-container">
      {loading && <div className="loader"></div>}
      <div>
        {contacts.map(contact => (
          <div key={contact.id} className="contact-item">
            <div className="contact-avatar">
          <img src={contact.imageURL} alt={contact.name} className="avatar-img" />
        </div>
        <h3 className="contact-name">{contact.name}</h3>
        <p className="contact-info"><span role="img" aria-label="phone">📞</span> {contact.phone}</p>
        <p className="contact-info"><span role="img" aria-label="email">📧</span> {contact.email}</p>
            <button
              onClick={() => setCurrentContact(contact)}
              className="edit-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Edit'}
            </button>
            <button
              onClick={() => handleDelete(contact.id)}
              className="delete-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );  
};

export default ContactList;
