import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Users } from 'lucide-react';

export default function CreateTeam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    setLoading(true);
    try {
      const team = await teamsAPI.create(formData);
      toast.success('Team created successfully!');
      navigate(`/teams/${team.id}`);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error.response?.data?.detail || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-redteam-dark">
      {/* Static Background Grid */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(#00ff4108 2px, transparent 2px),
            linear-gradient(90deg, #00ff4108 2px, transparent 2px),
            linear-gradient(#00d9ff05 1px, transparent 1px),
            linear-gradient(90deg, #00d9ff05 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px'
        }}
      />

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/teams')}
          className="mb-6 flex items-center gap-2 font-[Rajdhani] tracking-wider transition-colors"
          style={{ color: '#999999' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#00ff41'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#999999'}
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO TEAMS
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-[Rajdhani] tracking-wider mb-2" style={{
            color: '#00ff41',
            textShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
          }}>
            CREATE NEW TEAM
          </h1>
          <p className="font-[Rajdhani] tracking-wide" style={{ color: '#999999' }}>
            &gt; Start collaborating with other bug bounty hunters
          </p>
        </div>

        {/* Form Card */}
        <div
          className="relative p-8 bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-cyber-green/30 rounded-lg shadow-lg shadow-cyber-green/10"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 25px) 0, 100% 25px, 100% 100%, 25px 100%, 0 calc(100% - 25px))'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div>
              <label htmlFor="name" className="block font-[Rajdhani] tracking-wider text-sm mb-2" style={{ color: '#00ff41' }}>
                TEAM NAME *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full px-4 py-3 rounded-lg font-[Rajdhani] transition-all outline-none"
                style={{
                  backgroundColor: 'rgba(13, 13, 13, 0.8)',
                  border: '1px solid rgba(0, 255, 65, 0.3)',
                  color: '#ffffff'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0, 255, 65, 0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 255, 65, 0.3)'}
                placeholder="Elite Bug Hunters"
              />
              <p className="mt-1 text-xs font-[Rajdhani]" style={{ color: '#666666' }}>
                {formData.name.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block font-[Rajdhani] tracking-wider text-sm mb-2" style={{ color: '#00ff41' }}>
                DESCRIPTION <span style={{ color: '#666666' }}>(OPTIONAL)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg font-[Rajdhani] transition-all outline-none resize-none"
                style={{
                  backgroundColor: 'rgba(13, 13, 13, 0.8)',
                  border: '1px solid rgba(0, 255, 65, 0.3)',
                  color: '#ffffff'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0, 255, 65, 0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 255, 65, 0.3)'}
                placeholder="A team of experienced security researchers focused on web application vulnerabilities..."
              />
              <p className="mt-1 text-xs font-[Rajdhani]" style={{ color: '#666666' }}>
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg" style={{
              backgroundColor: 'rgba(0, 255, 65, 0.05)',
              border: '1px solid rgba(0, 255, 65, 0.3)'
            }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{
                    backgroundColor: 'rgba(0, 255, 65, 0.2)',
                    border: '1px solid #00ff41'
                  }}>
                    <span className="text-xs font-bold font-[Rajdhani]" style={{ color: '#00ff41' }}>i</span>
                  </div>
                </div>
                <div className="text-sm font-[Rajdhani]" style={{ color: '#cccccc' }}>
                  <p className="mb-2">You will be the <span className="font-bold" style={{ color: '#00ff41' }}>OWNER</span> of this team.</p>
                  <p>As owner, you can:</p>
                  <ul className="mt-1 ml-4 space-y-1 text-xs" style={{ color: '#999999' }}>
                    <li>• Add and remove members</li>
                    <li>• Assign roles (owner, admin, member)</li>
                    <li>• Create team projects</li>
                    <li>• Delete the team</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/teams')}
                className="flex-1 px-6 py-3 font-bold font-[Rajdhani] tracking-wider rounded-lg transition-all"
                style={{
                  backgroundColor: 'rgba(184, 0, 230, 0.1)',
                  border: '1px solid var(--color-cyber-purple)',
                  color: 'var(--color-cyber-purple)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(184, 0, 230, 0.2)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(184, 0, 230, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(184, 0, 230, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                disabled={loading}
              >
                CANCEL
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 font-bold font-[Rajdhani] tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'rgba(0, 255, 65, 0.15)',
                  border: '2px solid #00ff41',
                  color: '#00ff41',
                  boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.25)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5), inset 0 0 10px rgba(0, 255, 65, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.15)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 65, 0.3)';
                  }
                }}
              >
                {loading ? 'CREATING...' : 'CREATE_TEAM'}
              </button>
            </div>
          </form>
        </div>

        {/* Scan lines effect */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div 
            className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.03)_2px,rgba(0,255,65,0.03)_4px)]"
          />
        </div>
      </div>
    </div>
  );
}
