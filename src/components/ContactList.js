// src/components/ContactList.js
import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

// ContactList component
const ContactList = ({ contacts, fetchContacts, setCurrentContact }) => {
  
  // State to manage loading status
  const [loading, setLoading] = useState(false);

  // Function to delete a contact
  const handleDelete = async (contact) => {
    setLoading(true);

    // Delete the image from storage
    if (contact.imageURL) {
      const imageRef = ref(storage, contact.imageURL);
      try {
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    // Delete the document from Firestore
    await deleteDoc(doc(db, 'contacts', contact.id));
    setLoading(false);
    fetchContacts();
  };

  // Render the list of contacts
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
              onClick={() => handleDelete(contact)}
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

// Export the ContactList component
export default ContactList;
