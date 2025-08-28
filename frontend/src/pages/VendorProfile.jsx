import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setLoading, setError, addNotification } = useApp();
  
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('services');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (id) {
      loadVendorProfile();
      loadVendorServices();
    }
  }, [id]);

  const loadVendorProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.vendors.getById(id);
      setVendor(response.data);
    } catch (error) {
      console.error('Error loading vendor profile:', error);
      setError('Failed to load vendor profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadVendorServices = async () => {
    try {
      const response = await apiService.vendors.getServices(id);
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error loading vendor services:', error);
      setServices([]);
    }
  };

  const handleBookService = (service) => {
    if (!user) {
      addNotification({
        type: 'info',
        message: 'Please log in to book services'
      });
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      addNotification({
        type: 'warning',
        message: 'Only customers can book services'
      });
      return;
    }

    navigate(`/booking/${service.id}`);
  };

  const handleContactVendor = () => {
    if (!user) {
      addNotification({
        type: 'info',
        message: 'Please log in to contact vendors'
      });
      navigate('/login');
      return;
    }

    // For now, show a notification. In future, this could open a messaging interface
    addNotification({
      type: 'info',
      message: 'Contact feature coming soon! For now, you can book a service to start communication.'
    });
  };

  if (!vendor) {
    return (
      <div className="vendor-profile">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-profile">
      <div className="container mx-auto px-4 py-8">
        {/* Vendor Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
            {vendor.cover_image && (
              <img
                src={vendor.cover_image}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 relative z-10">
              <div className="flex-shrink-0 mb-4 md:mb-0">
                {vendor.avatar ? (
                  <img
                    src={vendor.avatar}
                    alt={vendor.business_name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center">
                    <span className="text-4xl text-gray-600">
                      {vendor.business_name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 md:ml-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {vendor.business_name}
                </h1>
                <div className="flex items-center mb-3">
                  <div className="flex items-center mr-4">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-lg font-semibold ml-1">
                      {vendor.average_rating || '5.0'}
                    </span>
                    <span className="text-gray-600 ml-1">
                      ({vendor.reviews_count || 0} reviews)
                    </span>
                  </div>
                  {vendor.location && (
                    <div className="flex items-center text-gray-600">
                      <span className="mr-1">📍</span>
                      <span>{vendor.location}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mb-4 max-w-2xl">
                  {vendor.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {vendor.specialties && vendor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-4 md:mt-0">
                <button
                  onClick={handleContactVendor}
                  className="px-6 py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Contact Vendor
                </button>
                <Link
                  to="#services"
                  onClick={() => setActiveTab('services')}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  View Services
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'services'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Services ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'portfolio'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({vendor.reviews_count || 0})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'about'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                About
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {service.images && service.images.length > 0 && (
                          <img
                            src={service.images[0].url}
                            alt={service.name}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                            <span className="text-lg font-bold text-green-600">
                              ${service.base_price}
                              {service.pricing_type === 'hourly' && '/hr'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {service.category_name}
                            </span>
                            <button
                              onClick={() => handleBookService(service)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold mb-2">No services available</h3>
                    <p className="text-gray-600">This vendor hasn't listed any services yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div>
                {vendor.portfolio_items && vendor.portfolio_items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendor.portfolio_items.map((item, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={item.image_url}
                          alt={item.title || `Portfolio item ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="text-lg font-semibold mb-2">No portfolio items</h3>
                    <p className="text-gray-600">This vendor hasn't uploaded any portfolio items yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {vendor.reviews && vendor.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {vendor.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold">
                                {review.customer_name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold">{review.customer_name || 'Anonymous'}</h4>
                              <div className="flex items-center">
                                <div className="flex text-yellow-400 mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Be the first to leave a review for this vendor!</p>
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">About {vendor.business_name}</h3>
                  <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
                </div>
                
                {vendor.years_experience && (
                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <p className="text-gray-700">{vendor.years_experience} years in the industry</p>
                  </div>
                )}

                {vendor.certifications && vendor.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Certifications</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {vendor.certifications.map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-gray-700">
                    {vendor.location && (
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        <span>{vendor.location}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center">
                        <span className="mr-2">📞</span>
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.website && (
                      <div className="flex items-center">
                        <span className="mr-2">🌐</span>
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {vendor.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;