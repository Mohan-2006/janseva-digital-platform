import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { UserPlus, Shield } from 'lucide-react';

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
  district: z.string().min(1, 'District is required'),
  preferred_language: z.enum(['en', 'hi'])
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password']
});

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
  'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar',
  'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
];

export default function Register() {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { preferred_language: 'en' }
  });

  const onSubmit = async (data) => {
    const { confirm_password, ...payload } = data;
    const result = await registerUser(payload);
    if (result.success) {
      toast.success('Registration successful! Welcome to JANSEVA.');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full mb-3 shadow-lg">
            <Shield className="w-7 h-7 text-blue-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">JANSEVA - New Registration</h1>
          <p className="text-blue-200 text-sm">निशुल्क सरकारी सेवाओं के लिए पंजीकरण करें</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Full Name *" error={errors.full_name}>
              <input {...register('full_name')} placeholder="As per Aadhaar card" className={inputClass} />
            </Field>

            <Field label="Email Address *" error={errors.email}>
              <input {...register('email')} type="email" placeholder="your@email.com" className={inputClass} />
            </Field>

            <Field label="Mobile Number *" error={errors.phone}>
              <input {...register('phone')} placeholder="10-digit mobile" maxLength={10} className={inputClass} />
            </Field>

            <Field label="Aadhaar Number" error={errors.aadhaar_number}>
              <input {...register('aadhaar_number')} placeholder="12-digit Aadhaar (optional)" maxLength={12} className={inputClass} />
            </Field>

            <Field label="District *" error={errors.district}>
              <select {...register('district')} className={inputClass}>
                <option value="">Select District</option>
                {MAHARASHTRA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>

            <Field label="Preferred Language" error={errors.preferred_language}>
              <select {...register('preferred_language')} className={inputClass}>
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </Field>

            <Field label="Password *" error={errors.password}>
              <input {...register('password')} type="password" placeholder="Min 8 characters" className={inputClass} />
            </Field>

            <Field label="Confirm Password *" error={errors.confirm_password}>
              <input {...register('confirm_password')} type="password" placeholder="Re-enter password" className={inputClass} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Full Address" error={errors.address}>
                <textarea {...register('address')} placeholder="House No, Street, Village/Town" rows={2} className={inputClass} />
              </Field>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already registered? <Link to="/login" className="text-blue-700 font-medium hover:underline">Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
