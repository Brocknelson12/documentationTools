import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Filter,
  Users,
  Instagram,
  ShoppingBag,
  Youtube,
  Club,
  User2,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  interests: string[];
  socialMedia: {
    instagram?: boolean;
    youtube?: boolean;
  };
  golfer: boolean;
  income: 'high' | 'medium' | 'low';
  consumption: 'high' | 'medium' | 'low';
}

// Generate sample customers who play golf with her parents
const generateSampleCustomers = (): Customer[] => {
  const customers: Customer[] = [];
  const golfClubMembers = 50; // Base number of golf club members

  for (let i = 0; i < golfClubMembers; i++) {
    const age = Math.floor(Math.random() * (80 - 35) + 35); // Age range 35-80 for golf club members
    const gender = Math.random() > 0.7 ? 'female' : 'male'; // 30% female, 70% male for golf club
    const income = age > 60 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low';
    const consumption = income === 'high' ? 
      (Math.random() > 0.3 ? 'high' : 'medium') : 
      income === 'medium' ? 
        (Math.random() > 0.5 ? 'medium' : 'low') : 
        'low';
    
    customers.push({
      id: `customer-${i}`,
      age,
      gender,
      interests: [
        'golf',
        ...(Math.random() > 0.5 ? ['fine dining'] : []),
        ...(Math.random() > 0.7 ? ['baking'] : []),
        ...(Math.random() > 0.6 ? ['health & wellness'] : []),
      ],
      socialMedia: {
        instagram: age < 65 && Math.random() > 0.5,
        youtube: age < 70 && Math.random() > 0.6,
      },
      golfer: true,
      income,
      consumption,
    });
  }

  return customers;
};

const CustomerBase = () => {
  const navigate = useNavigate();
  const [customers] = useState<Customer[]>(generateSampleCustomers());
  const [filters, setFilters] = useState({
    ageRange: [0, 100],
    gender: [] as string[],
    socialMedia: [] as string[],
    income: [] as string[],
    consumption: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(true);

  const filteredCustomers = customers.filter(customer => {
    const ageMatch = customer.age >= filters.ageRange[0] && customer.age <= filters.ageRange[1];
    const genderMatch = filters.gender.length === 0 || filters.gender.includes(customer.gender);
    const socialMatch = filters.socialMedia.length === 0 || 
      filters.socialMedia.some(platform => 
        platform === 'instagram' ? customer.socialMedia.instagram :
        platform === 'youtube' ? customer.socialMedia.youtube : false
      );
    const incomeMatch = filters.income.length === 0 || filters.income.includes(customer.income);
    const consumptionMatch = filters.consumption.length === 0 || filters.consumption.includes(customer.consumption);

    return ageMatch && genderMatch && socialMatch && incomeMatch && consumptionMatch;
  });

  const toggleFilter = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const getCustomerColor = (customer: Customer) => {
    if (customer.income === 'high') return 'text-green-600';
    if (customer.income === 'medium') return 'text-blue-600';
    return 'text-gray-600';
  };

  const getCustomerSize = (customer: Customer) => {
    if (customer.income === 'high') return 'w-6 h-6';
    if (customer.income === 'medium') return 'w-5 h-5';
    return 'w-4 h-4';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
        <h1 className="text-2xl font-bold">Customer Base Analysis</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Filters</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          {showFilters && (
            <CardContent className="space-y-6">
              {/* Age Range */}
              <div>
                <h3 className="font-medium mb-2">Age Range</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.ageRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      ageRange: [parseInt(e.target.value), prev.ageRange[1]]
                    }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.ageRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      ageRange: [prev.ageRange[0], parseInt(e.target.value)]
                    }))}
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {filters.ageRange[0]} - {filters.ageRange[1]} years
                </div>
              </div>

              {/* Gender */}
              <div>
                <h3 className="font-medium mb-2">Gender</h3>
                <div className="flex flex-wrap gap-2">
                  {['male', 'female', 'other'].map(gender => (
                    <Button
                      key={gender}
                      variant={filters.gender.includes(gender) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFilter('gender', gender)}
                    >
                      <User2 className="w-4 h-4 mr-2" />
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="font-medium mb-2">Social Media</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.socialMedia.includes('instagram') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('socialMedia', 'instagram')}
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    variant={filters.socialMedia.includes('youtube') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('socialMedia', 'youtube')}
                  >
                    <Youtube className="w-4 h-4 mr-2" />
                    YouTube
                  </Button>
                </div>
              </div>

              {/* Income Level */}
              <div>
                <h3 className="font-medium mb-2">Income Level</h3>
                <div className="flex flex-wrap gap-2">
                  {['high', 'medium', 'low'].map(income => (
                    <Button
                      key={income}
                      variant={filters.income.includes(income) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFilter('income', income)}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {income.charAt(0).toUpperCase() + income.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Consumption Level */}
              <div>
                <h3 className="font-medium mb-2">Consumption Level</h3>
                <div className="flex flex-wrap gap-2">
                  {['high', 'medium', 'low'].map(level => (
                    <Button
                      key={level}
                      variant={filters.consumption.includes(level) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFilter('consumption', level)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Customer Visualization */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Golf Club Members</CardTitle>
            <CardDescription>
              {filteredCustomers.length} potential customers from golf club connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Legend */}
            <div className="flex items-center gap-6 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-green-600" />
                <span className="text-sm">High Income</span>
              </div>
              <div className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Medium Income</span>
              </div>
              <div className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Low Income</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                <span className="text-sm">Instagram User</span>
              </div>
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5" />
                <span className="text-sm">YouTube User</span>
              </div>
              <div className="flex items-center gap-2">
                <Club className="w-5 h-5" />
                <span className="text-sm">Golf Club Member</span>
              </div>
            </div>

            {/* Customer Grid */}
            <div className="relative p-4 bg-gray-50 rounded-lg min-h-[600px]">
              {/* Group customers by income for organic clustering */}
              <div className="flex flex-wrap gap-8 justify-center">
                {['high', 'medium', 'low'].map(incomeLevel => {
                  const incomeGroup = filteredCustomers.filter(c => c.income === incomeLevel);
                  return (
                    <div key={incomeLevel} className="flex flex-wrap gap-4 max-w-[300px] relative">
                      {/* Add a subtle label for the group */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 
                        text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                        {incomeLevel.charAt(0).toUpperCase() + incomeLevel.slice(1)} Income Group
                      </div>
                      {/* Create organic-looking clusters within each income group */}
                      {incomeGroup.map((customer, idx) => (
                        <div
                          key={customer.id}
                          className="relative group transform hover:scale-110 transition-transform"
                          style={{
                            transform: `translate(${Math.sin(idx) * 20}px, ${Math.cos(idx) * 20}px)`,
                          }}
                        >
                          <User2 className={`${getCustomerColor(customer)} ${getCustomerSize(customer)}`} />
                          
                          {/* Social Media Indicators */}
                          <div className="absolute -top-2 -right-2 flex gap-1">
                            {customer.socialMedia.instagram && (
                              <Instagram className="w-3 h-3" />
                            )}
                            {customer.socialMedia.youtube && (
                              <Youtube className="w-3 h-3" />
                            )}
                          </div>

                          {/* Hover Info */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                            bg-white p-2 rounded shadow-lg text-xs whitespace-nowrap opacity-0 
                            group-hover:opacity-100 transition-opacity z-10">
                            <div>Age: {customer.age}</div>
                            <div>Gender: {customer.gender}</div>
                            <div>Income: {customer.income}</div>
                            <div>Consumption: {customer.consumption}</div>
                            <div>Interests: {customer.interests.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Key metrics about your potential customer base</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {Math.round(filteredCustomers.reduce((sum, c) => sum + c.age, 0) / filteredCustomers.length)}
                  </div>
                  <p className="text-sm text-gray-500">Average Age</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {Math.round(filteredCustomers.filter(c => c.socialMedia.instagram).length / filteredCustomers.length * 100)}%
                  </div>
                  <p className="text-sm text-gray-500">Instagram Users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {Math.round(filteredCustomers.filter(c => c.income === 'high').length / filteredCustomers.length * 100)}%
                  </div>
                  <p className="text-sm text-gray-500">High Income</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerBase;