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
  const [errors, setErrors] = useState({});
  const phoneInputRef = useRef(null);
  const intlTelInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Utility function to handle intlTelInput initialization
  const initializeIntlTelInput = () => {
    if (phoneInputRef.current) {
      try {
        intlTelInputRef.current = intlTelInput(phoneInputRef.current, {
          initialCountry: 'in',
          separateDialCode: true,
          utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23.1.0/build/js/utils.js',
        });
      } catch (error) {
        console.error('Error initializing intlTelInput:', error);
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
      intlTelInputRef.current?.setNumber('');
    }
  }, [currentContact]);

  // Scroll to the form when currentContact changes
  useEffect(() => {
    if (currentContact) {
      document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentContact]);

  /// Validate the form fields
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid.';
    }
    if (!intlTelInputRef.current.isValidNumber()) {
      newErrors.phone = 'Phone number is invalid.';
    }
    if (image && !image.type.startsWith('image/')) {
      newErrors.image = 'Selected file must be an image.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setLoading(true);

    // Get the phone number in E.164 format
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

      handleReset();
      fetchContacts();
    } catch (error) {
      console.error("Error saving contact:", error);
    } finally {
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
    setErrors({});
    if (intlTelInputRef.current) {
      intlTelInputRef.current.value = ''; // Reset the phone number input
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Set the submit button text based on whether the form is for adding or updating a contact
  const submitButtonText = currentContact ? 'Update Contact' : 'Add Contact';

  // Render the form
  return (
    <div id="form-container" className="form-container">
      {loading && <div className="loader"></div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            autoComplete="name" // Add autocomplete attribute
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        <div className="form-group">
          <input
            ref={phoneInputRef}
            type="tel"
            id="phone"
            className="form-control"
            placeholder="Phone Number"
            name="phone"
            required
            autoComplete="tel" // Add autocomplete attribute
          />
          {errors.phone && <p className="error-message">{errors.phone}</p>}
        </div>
        <div className="form-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email" // Add autocomplete attribute
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        <div className="form-group">
          <input
            type="file"
            id="image"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            autoComplete="off" // Typically, file inputs should have autocomplete="off"
          />
          {errors.image && <p className="error-message">{errors.image}</p>}
        </div>
        <div className="button-group">
          <div className="button-row">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Processing...' : submitButtonText}
            </button>
          </div>
          <div className="button-row">
            <button type="button" className="reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Export the ContactForm component
export default ContactForm;
