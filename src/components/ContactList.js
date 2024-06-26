// src/components/ContactList.js
import React from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ContactList = ({ contacts, fetchContacts, setCurrentContact }) => {
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'contacts', id));
    fetchContacts();
  };

  return (
    <div>
      {contacts.map(contact => (
        <div key={contact.id}>
          <h3>{contact.name}</h3>
          <p>{contact.phone}</p>
          <p>{contact.email}</p>
          <img src={contact.imageURL} alt={contact.name} width="100" />
          <button onClick={() => setCurrentContact(contact)}>Edit</button>
          <button onClick={() => handleDelete(contact.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
