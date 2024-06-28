// src/components/ContactForm.js
import 'intl-tel-input/build/css/intlTelInput.css';
import React, { useEffect, useRef, useState } from 'react';
import intlTelInput from 'intl-tel-input';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ContactForm component
const ContactForm = ({ currentContact, fetchContacts, setCurrentContact }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef(null);
  const intlTelInputRef = useRef(null);

  // Utility function to handle intlTelInput initialization
  const initializeIntlTelInput = () => {
    if (phoneInputRef.current) {
      try {
        intlTelInputRef.current = intlTelInput(phoneInputRef.current, {
          initialCountry: 'in', // Set initial country code (optional)
          separateDialCode: true, // Display country code separately (optional)
          utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23.1.0/build/js/utils.js',
        }); 
      } catch (error) {
        console.error('Error initializing intlTelInput:', error); // Log any errors to the console
      }
    }
  };

  // Initialize intlTelInput on component mount
  useEffect(() => {
    initializeIntlTelInput();

    // Cleanup function to destroy the intlTelInput instance on unmount
    return () => {
      if (intlTelInputRef.current) {
        intlTelInputRef.current.destroy();
      }
    };
  }, []);

  // Set the phone number input value to the currentContact's phone number
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

  // Scroll to the form when currentContact changes
  useEffect(() => {
    if (currentContact) {
      document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentContact]);

  // Handle form submission
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

  // Save the contact to Firestore
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

  // Handle form reset
  const handleReset = () => {
    setName('');
    setEmail('');
    setImage(null);
    setCurrentContact(null);
    intlTelInputRef.current?.setNumber('');
    intlTelInputRef.current?.setCountry('in');
  };

  // Set the submit button text based on whether the form is for adding or updating a contact
  const submitButtonText = currentContact ? 'Update Contact' : 'Add Contact';

  // Render the form
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

// Export the ContactForm component
export default ContactForm;
