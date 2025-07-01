import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProfileStats as ProfileStatsType } from '../../services/profileService';

interface ProfileStatsProps {
  stats?: ProfileStatsType;
  isLoading: boolean;
}

export const ProfileStats = ({ stats, isLoading }: ProfileStatsProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div className="p-8 text-center text-gray-500">
          <p>No statistics available yet.</p>
          <p className="mt-2">Start making offers to see your stats!</p>
        </div>
      </Card>
    );
  }

  const successRate = stats.totalOffers > 0 ? (stats.acceptedOffers / stats.totalOffers) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                All time
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                {successRate >= 50 ? (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Great success rate!
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Keep trying!
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Target className="h-4 w-4 mr-1" />
                {stats.acceptedOffers} successful purchases
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Offer Price</p>
                <p className="text-2xl font-bold text-gray-900">${stats.averageOfferPrice.toFixed(2)}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-1" />
                Per offer average
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer Status Breakdown */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Breakdown</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Accepted</span>
                </div>
                <div className="text-sm text-gray-900">
                  {stats.acceptedOffers} ({stats.totalOffers > 0 ? ((stats.acceptedOffers / stats.totalOffers) * 100).toFixed(1) : 0}%)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </div>
                <div className="text-sm text-gray-900">
                  {stats.activeOffers} ({stats.totalOffers > 0 ? ((stats.activeOffers / stats.totalOffers) * 100).toFixed(1) : 0}%)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Other</span>
                </div>
                <div className="text-sm text-gray-900">
                  {stats.totalOffers - stats.acceptedOffers - stats.activeOffers} ({stats.totalOffers > 0 ? (((stats.totalOffers - stats.acceptedOffers - stats.activeOffers) / stats.totalOffers) * 100).toFixed(1) : 0}%)
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/my-offers">
                <Button variant="outline" className="w-full">
                  View All Offers
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Favorite Categories */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Categories</h3>
            
            {stats.favoriteCategories && stats.favoriteCategories.length > 0 ? (
              <div className="space-y-4">
                {stats.favoriteCategories.slice(0, 5).map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mr-3 text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900">
                      {category.count} offers
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No category preferences yet.</p>
                <p className="mt-2">Make more offers to see your favorites!</p>
              </div>
            )}

            <div className="mt-6">
              <Link to="/events">
                <Button variant="outline" className="w-full">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'offer_accepted' ? 'bg-green-100' :
                      activity.type === 'offer_created' ? 'bg-blue-100' :
                      activity.type === 'payment_completed' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'offer_accepted' && <Award className="h-4 w-4 text-green-600" />}
                      {activity.type === 'offer_created' && <Target className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'payment_completed' && <DollarSign className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'offer_cancelled' && <TrendingDown className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-sm font-medium text-gray-900">
                      ${activity.amount.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link to="/buyer/transactions">
                <Button variant="outline" className="w-full">
                  View All Transactions
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};