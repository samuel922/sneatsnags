import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateListingForm } from '../components/listings/CreateListingForm';

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate back to seller listings after successful creation
    navigate('/seller/listings');
  };

  const handleCancel = () => {
    // Navigate back to seller dashboard or listings
    navigate('/seller/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CreateListingForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};