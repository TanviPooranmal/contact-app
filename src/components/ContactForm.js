// src/components/ContactForm.js
import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ContactForm = ({ fetchContacts, currentContact, setCurrentContact }) => {
  const [name, setName] = useState(currentContact ? currentContact.name : '');
  const [phone, setPhone] = useState(currentContact ? currentContact.phone : '');
  const [email, setEmail] = useState(currentContact ? currentContact.email : '');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageURL = '';
    if (image) {
      const imageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(imageRef, image);
      imageURL = await getDownloadURL(imageRef);
    }

    if (currentContact) {
      const contactRef = doc(db, 'contacts', currentContact.id);
      await updateDoc(contactRef, {
        name,
        phone,
        email,
        imageURL: imageURL || currentContact.imageURL
      });
      setCurrentContact(null);
    } else {
      await addDoc(collection(db, 'contacts'), {
        name,
        phone,
        email,
        imageURL
      });
    }

    setName('');
    setPhone('');
    setEmail('');
    setImage(null);
    fetchContacts();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone Number"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        accept="image/*"
      />
      <button type="submit">{currentContact ? 'Update' : 'Add'} Contact</button>
    </form>
  );
};

export default ContactForm;
