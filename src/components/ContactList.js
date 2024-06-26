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
          <div key={contact.id}>
            <h3>{contact.name}</h3>
            <p>{contact.phone}</p>
            <p>{contact.email}</p>
            <img src={contact.imageURL} alt={contact.name} width="100" />
            <button onClick={() => setCurrentContact(contact)} disabled={loading}>
              {loading ? 'Loading...' : 'Edit'}
            </button>
            <button onClick={() => handleDelete(contact.id)} disabled={loading}>
              {loading ? 'Loading...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
