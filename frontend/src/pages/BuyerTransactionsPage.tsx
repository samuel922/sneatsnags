import { TransactionHistory } from '../components/shared/TransactionHistory';

export const BuyerTransactionsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <TransactionHistory userType="buyer" />
    </div>
  );
};