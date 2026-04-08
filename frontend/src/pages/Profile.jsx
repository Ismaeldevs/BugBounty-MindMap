import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowLeft, Save, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    current_password: '',
    password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if changing password
    if (formData.password || formData.confirm_password || formData.current_password) {
      if (!formData.current_password) {
        toast.error('✗ CURRENT PASSWORD REQUIRED');
        return;
      }
      if (!formData.password) {
        toast.error('✗ NEW PASSWORD REQUIRED');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        toast.error('✗ PASSWORD MISMATCH');
        return;
      }
      if (formData.password.length < 8) {
        toast.error('✗ PASSWORD TOO SHORT (MIN 8 CHARS)');
        return;
      }
    }

    // Prepare update data
    const updateData = {};
    if (formData.username !== user.username) {
      updateData.username = formData.username;
    }
    if (formData.email !== user.email) {
      updateData.email = formData.email;
    }
    if (formData.password) {
      updateData.password = formData.password;
      updateData.current_password = formData.current_password;
    }

    // Check if there are changes
    if (Object.keys(updateData).length === 0) {
      toast.error('⚠ NO CHANGES DETECTED');
      return;
    }

    try {
      const result = await updateProfile(updateData);
      if (result.success) {
        toast.success('✓ PROFILE UPDATED');
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          password: '',
          confirm_password: '',
        }));
      } else {
        toast.error('✗ ' + (result.error || 'UPDATE FAILED'));
      }
    } catch (error) {
      toast.error('✗ UPDATE FAILED');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d0d0d' }}>
      <Navbar />
      
      <div 
        className="min-h-[calc(100vh-64px)] p-8 relative"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(rgba(74, 14, 78, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74, 14, 78, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0'
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 transition-all font-[Rajdhani] font-semibold"
          style={{
            backgroundColor: 'rgba(74, 14, 78, 0.2)',
            color: '#aa66aa',
            border: '1px solid rgba(74, 14, 78, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(74, 14, 78, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 8px rgba(74, 14, 78, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(74, 14, 78, 0.2)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>BACK_TO_DASHBOARD</span>
        </button>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 relative">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-8 h-8" style={{ color: '#ff4444' }} />
              <h1 
                className="text-4xl font-bold font-[Orbitron] tracking-wider"
                style={{ color: '#ff4444' }}
              >
                USER_PROFILE
              </h1>
            </div>
            <p className="text-sm font-[Rajdhani]" style={{ color: '#888888' }}>
              &gt; Manage your account settings and security
            </p>
          </div>

          {/* Profile Card */}
          <div
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.6) 0%, rgba(45, 45, 45, 0.6) 100%)',
              border: '2px solid',
              borderColor: 'rgba(204, 0, 0, 0.3)',
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(204, 0, 0, 0.05)',
              clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)',
            }}
          >
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: '3px solid #cc0000', borderLeft: '3px solid #cc0000' }} />
            <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: '3px solid #cc0000', borderRight: '3px solid #cc0000' }} />

            {/* Scan Lines */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
                animation: 'scan 8s linear infinite'
              }}
            />

            <div className="p-8 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Information Section */}
                <div>
                  <h2 
                    className="text-xl font-bold font-[Orbitron] mb-4 tracking-wider flex items-center space-x-2"
                    style={{ color: '#ff4444' }}
                  >
                    <User className="w-5 h-5" />
                    <span>ACCOUNT_INFO</span>
                  </h2>

                  <div className="space-y-4">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
                        &gt; USERNAME
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#666666' }} />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="input-cyber w-full pl-12"
                          placeholder="username"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
                        &gt; EMAIL
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#666666' }} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-cyber w-full pl-12"
                          placeholder="user@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="pt-6" style={{ borderTop: '1px solid rgba(204, 0, 0, 0.2)' }}>
                  <h2 
                    className="text-xl font-bold font-[Orbitron] mb-4 tracking-wider flex items-center space-x-2"
                    style={{ color: '#ff4444' }}
                  >
                    <Lock className="w-5 h-5" />
                    <span>SECURITY</span>
                  </h2>

                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
                        &gt; CURRENT_PASSWORD
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#666666' }} />
                        <input
                          type="password"
                          value={formData.current_password}
                          onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                          className="input-cyber w-full pl-12"
                          placeholder="Required to change password"
                        />
                      </div>
                      <p className="mt-1 text-xs font-[Rajdhani]" style={{ color: '#888888' }}>
                        * Leave blank to keep current password
                      </p>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
                        &gt; NEW_PASSWORD
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#666666' }} />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="input-cyber w-full pl-12"
                          placeholder="Min 8 chars, uppercase, lowercase, digit"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
                        &gt; CONFIRM_NEW_PASSWORD
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#666666' }} />
                        <input
                          type="password"
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                          className="input-cyber w-full pl-12"
                          placeholder="Repeat new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6" style={{ borderTop: '1px solid rgba(204, 0, 0, 0.2)' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 font-[Rajdhani] font-bold tracking-wider transition-all text-lg"
                    style={{
                      backgroundColor: 'rgba(0, 255, 65, 0.15)',
                      color: '#00ff41',
                      border: '2px solid rgba(0, 255, 65, 0.4)',
                      clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.25)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.15)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Save className="w-5 h-5" />
                    <span>{isLoading ? 'UPDATING...' : 'SAVE_CHANGES'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
