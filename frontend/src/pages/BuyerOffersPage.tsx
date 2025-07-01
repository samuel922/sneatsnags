import { BuyerOffersList } from '../components/buyer/BuyerOffersList';

export const BuyerOffersPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Offers</h1>
      <BuyerOffersList showUserOffersOnly={true} />
    </div>
  );
};