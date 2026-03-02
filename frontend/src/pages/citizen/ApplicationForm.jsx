import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const SERVICE_TYPES = [
  { value: 'birth_certificate', label: 'Birth Certificate / जन्म प्रमाणपत्र' },
  { value: 'death_certificate', label: 'Death Certificate / मृत्यु प्रमाणपत्र' },
  { value: 'income_certificate', label: 'Income Certificate / उत्पन्न प्रमाणपत्र' },
  { value: 'caste_certificate', label: 'Caste Certificate / जात प्रमाणपत्र' },
  { value: 'domicile_certificate', label: 'Domicile Certificate / अधिवास प्रमाणपत्र' },
  { value: 'ration_card', label: 'Ration Card / रेशन कार्ड' },
  { value: 'property_tax', label: 'Property Tax / मालमत्ता कर' },
  { value: 'water_connection', label: 'Water Connection / पाणी जोडणी' },
];

const DISTRICTS = [
  'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad',
  'Solapur', 'Kolhapur', 'Thane', 'Raigad', 'Satara',
];

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const [formData, setFormData] = useState({
    service_type: '',
    applicant_name: '',
    applicant_name_marathi: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: '',
    mobile: '',
    email: '',
    address: '',
    district: '',
    taluka: '',
    village: '',
    pincode: '',
    aadhar_number: '',
    purpose: '',
    additional_info: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        applicant_name: user.full_name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        district: user.district || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/citizen/applications', formData);
      setApplicationId(res.data.application_id);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-4">अर्ज यशस्वीरित्या सादर केला</p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Application ID / अर्ज क्रमांक</p>
            <p className="text-xl font-bold text-blue-900 font-mono">{applicationId}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">Save this ID to track your application status.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/citizen/status')} className="btn-primary flex-1">
              Track Status
            </button>
            <button onClick={() => navigate('/citizen/dashboard')} className="btn-secondary flex-1">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Apply for Service</h1>
          <p className="text-gray-600 mt-1">सेवेसाठी अर्ज करा</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details / सेवा तपशील</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type / सेवा प्रकार *
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select Service / सेवा निवडा</option>
                {SERVICE_TYPES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose / हेतू *
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                rows={3}
                className="input-field"
                placeholder="Describe the purpose of your application..."
              />
            </div>
          </div>

          {/* Personal Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details / वैयक्तिक माहिती</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" name="applicant_name" value={formData.applicant_name}
                  onChange={handleChange} required className="input-field" placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">पूर्ण नाव (मराठी)</label>
                <input type="text" name="applicant_name_marathi" value={formData.applicant_name_marathi}
                  onChange={handleChange} className="input-field" placeholder="पूर्ण नाव" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                <input type="text" name="father_name" value={formData.father_name}
                  onChange={handleChange} className="input-field" placeholder="Father's Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                <input type="text" name="mother_name" value={formData.mother_name}
                  onChange={handleChange} className="input-field" placeholder="Mother's Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth}
                  onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  required className="input-field">
                  <option value="">Select</option>
                  <option value="male">Male / पुरुष</option>
                  <option value="female">Female / महिला</option>
                  <option value="other">Other / इतर</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                <input type="tel" name="mobile" value={formData.mobile}
                  onChange={handleChange} required className="input-field" placeholder="10-digit mobile" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} className="input-field" placeholder="email@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                <input type="text" name="aadhar_number" value={formData.aadhar_number}
                  onChange={handleChange} className="input-field" placeholder="12-digit Aadhar number"
                  maxLength={12} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address / पत्ता</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                <textarea name="address" value={formData.address} onChange={handleChange}
                  required rows={2} className="input-field" placeholder="House No, Street, Area" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <select name="district" value={formData.district} onChange={handleChange}
                    required className="input-field">
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taluka</label>
                  <input type="text" name="taluka" value={formData.taluka} onChange={handleChange}
                    className="input-field" placeholder="Taluka" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village/City</label>
                  <input type="text" name="village" value={formData.village} onChange={handleChange}
                    className="input-field" placeholder="Village or City" />
                </div>
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                  required className="input-field" placeholder="6-digit PIN" maxLength={6} />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <textarea name="additional_info" value={formData.additional_info} onChange={handleChange}
              rows={3} className="input-field" placeholder="Any additional information relevant to your application..." />
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit Application / अर्ज सादर करा'}
            </button>
            <button type="button" onClick={() => navigate('/citizen/dashboard')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
