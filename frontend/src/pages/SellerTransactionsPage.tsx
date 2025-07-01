import { TransactionHistory } from '../components/shared/TransactionHistory';

export const SellerTransactionsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <TransactionHistory userType="seller" />
    </div>
  );
};