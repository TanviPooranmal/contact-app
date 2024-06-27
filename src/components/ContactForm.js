// src/components/ContactForm.js
import 'intl-tel-input/build/css/intlTelInput.css';
import React, { useEffect, useRef, useState } from 'react';
import intlTelInput from 'intl-tel-input';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ContactForm = ({ currentContact, fetchContacts, setCurrentContact }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef(null);
  const intlTelInputRef = useRef(null); // Reference for intlTelInput instance
  useEffect(() => {
    if (currentContact) {
      setName(currentContact.name || '');
      setEmail(currentContact.email || '');
      // Set phone number in intlTelInput if currentContact has a phone number
      if (currentContact.phone) {
        intlTelInputRef.current?.setNumber(currentContact.phone);
      } else {
        // Clear the phone number input if no phone number is present
        intlTelInputRef.current?.setNumber('');
      }
    } else {
      setName('');
      setEmail('');
      intlTelInputRef.current?.setNumber(''); // Clear phone number input for new contacts
    }
  }, [currentContact]);
  useEffect(() => {
    const phoneInput = phoneInputRef.current;
    if (phoneInput) {
      intlTelInputRef.current = intlTelInput(phoneInput, {
        initialCountry: 'in',
        separateDialCode: true,
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.8/build/js/utils.js',
      });
    }
    return () => {
      if (intlTelInputRef.current) {
        intlTelInputRef.current.destroy();
      }
    };
  }, []);
  useEffect(() => {
    if (currentContact) {
      // Scroll to the form when currentContact changes
      document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentContact]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // Extract full phone number with country code
  const phoneNumber = intlTelInputRef.current.getNumber();

  let imageURL = '';
  if (image) {
    const imageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(imageRef, image);
    imageURL = await getDownloadURL(imageRef);
  }

  try {
    if (currentContact) {
      const contactRef = doc(db, 'contacts', currentContact.id);
      await updateDoc(contactRef, {
        name,
        phone: phoneNumber,
        email,
        imageURL: imageURL || currentContact.imageURL,
      });
      setCurrentContact(null);
    } else {
      await addDoc(collection(db, 'contacts'), {
        name,
        phone: phoneNumber,
        email,
        imageURL,
      });
    }

    setName('');
    setEmail('');
    setImage(null);
    setLoading(false);
    fetchContacts();
  } catch (error) {
    console.error("Error saving contact:", error);
    // Handle the error here, maybe show an error message to the user
    setLoading(false);
  }
};

  const handleReset = () => {
    setName('');
    setEmail('');
    setImage(null);
    setCurrentContact(null); // Clear current contact to ensure it's treated as a new addition
    intlTelInputRef.current?.setNumber(''); // Clear phone number input
  };
  const submitButtonText = currentContact ? 'Update Contact' : 'Add Contact';
  return (
    <div id="form-container" className="form-container">
      {loading && <div className="loader"></div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          ref={phoneInputRef}
          type="tel"
          id="phone"
          className="form-control"
          placeholder="Phone Number"
          name="phone"
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
        <div className="button-group">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : submitButtonText}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};
export default ContactForm;
