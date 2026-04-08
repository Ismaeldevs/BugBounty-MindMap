import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';

export default function TeamSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadTeam();
  }, [id]);

  const loadTeam = async () => {
    try {
      const data = await teamsAPI.get(id);
      setTeam(data);
      setFormData({
        name: data.name,
        description: data.description || ''
      });
    } catch (error) {
      console.error('Error loading team:', error);
      toast.error('Failed to load team');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    setSaving(true);
    try {
      await teamsAPI.update(id, formData);
      toast.success('Team updated successfully!');
      navigate(`/teams/${id}`);
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error(error.response?.data?.detail || 'Failed to update team');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await teamsAPI.delete(id);
      toast.success('Team deleted successfully');
      navigate('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete team');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{
        backgroundColor: '#0d0d0d',
        backgroundImage: `
          linear-gradient(rgba(139, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(rgba(74, 14, 78, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(74, 14, 78, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
      }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="inline-block w-16 h-16 border-4 rounded-full animate-spin" style={{ 
                borderColor: '#cc0000',
                borderTopColor: 'transparent'
              }}></div>
              <div className="absolute inset-0 inline-block w-16 h-16 border-2 rounded-full animate-ping opacity-20" style={{ 
                borderColor: '#cc0000'
              }}></div>
            </div>
            <p className="mt-4 font-[Rajdhani] tracking-wide" style={{ color: '#999999' }}>LOADING...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{
      backgroundColor: '#0d0d0d',
      backgroundImage: `
        linear-gradient(rgba(139, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(rgba(74, 14, 78, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(74, 14, 78, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
    }}>
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/teams/${id}`)}
          className="mb-6 flex items-center gap-2 font-[Rajdhani] tracking-wider transition-colors"
          style={{ color: '#999999' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#00ff41'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#999999'}
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO TEAM
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-[Rajdhani] tracking-wider mb-2" style={{
            color: '#00ff41',
            textShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
          }}>
            TEAM SETTINGS
          </h1>
          <p className="font-[Rajdhani] tracking-wide" style={{ color: '#999999' }}>
            &gt; Configure team settings
          </p>
        </div>

        {/* Update Form */}
        <div className="mb-8 p-6 rounded-lg" style={{
          backgroundColor: 'rgba(13, 13, 13, 0.9)',
          border: '1px solid rgba(0, 255, 65, 0.3)',
          boxShadow: '0 0 20px rgba(0, 255, 65, 0.1)'
        }}>
          <h2 className="text-xl font-bold font-[Rajdhani] tracking-wider mb-4" style={{ color: '#00ff41' }}>
            GENERAL SETTINGS
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-[Rajdhani] tracking-wider text-sm mb-2" style={{ color: '#00ff41' }}>
                TEAM NAME *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              />
              <p className="mt-1 text-xs font-[Rajdhani]" style={{ color: '#666666' }}>
                {formData.name.length}/100 characters
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block font-[Rajdhani] tracking-wider text-sm mb-2" style={{ color: '#00ff41' }}>
                DESCRIPTION <span style={{ color: '#666666' }}>(OPTIONAL)</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              />
              <p className="mt-1 text-xs font-[Rajdhani]" style={{ color: '#666666' }}>
                {formData.description.length}/500 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 font-bold font-[Rajdhani] tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'rgba(0, 255, 65, 0.15)',
                border: '2px solid #00ff41',
                color: '#00ff41',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.25)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5), inset 0 0 10px rgba(0, 255, 65, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.15)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 65, 0.3)';
                }
              }}
            >
              <Save className="w-5 h-5" />
              {saving ? 'SAVING...' : 'SAVE_CHANGES'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-lg" style={{
          backgroundColor: 'rgba(13, 13, 13, 0.9)',
          border: '1px solid rgba(204, 0, 0, 0.3)',
          boxShadow: '0 0 20px rgba(204, 0, 0, 0.1)'
        }}>
          <h2 className="text-xl font-bold font-[Rajdhani] tracking-wider mb-2" style={{ color: '#cc0000' }}>
            DANGER ZONE
          </h2>
          <p className="font-[Rajdhani] text-sm mb-4" style={{ color: '#999999' }}>
            Once you delete a team, there is no going back. This will remove all members and unlink all team projects.
          </p>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 font-bold font-[Rajdhani] tracking-wider rounded-lg transition-all flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(204, 0, 0, 0.15)',
              border: '2px solid #cc0000',
              color: '#cc0000',
              boxShadow: '0 0 10px rgba(204, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.25)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(204, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.15)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(204, 0, 0, 0.3)';
            }}
          >
            <Trash2 className="w-5 h-5" />
            DELETE_TEAM
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(5, 10, 14, 0.95)' }}>
          <div className="max-w-md w-full p-6 rounded-lg relative" style={{
            backgroundColor: 'rgba(13, 13, 13, 0.95)',
            border: '2px solid rgba(204, 0, 0, 0.5)',
            boxShadow: '0 0 30px rgba(204, 0, 0, 0.3)'
          }}>
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: '#cc0000' }}></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: '#cc0000' }}></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: '#cc0000' }}></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: '#cc0000' }}></div>

            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-full" style={{
                backgroundColor: 'rgba(204, 0, 0, 0.2)',
                border: '1px solid rgba(204, 0, 0, 0.5)'
              }}>
                <AlertTriangle className="w-6 h-6" style={{ color: '#cc0000' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-[Rajdhani] tracking-wider mb-2" style={{ color: '#cc0000' }}>
                  DELETE_TEAM
                </h3>
                <p className="font-[Rajdhani] text-sm mb-2" style={{ color: '#cccccc' }}>
                  Are you sure you want to delete <span className="font-bold" style={{ color: '#00ff41' }}>"{team?.name}"</span>?
                </p>
                <p className="font-[Rajdhani] text-xs" style={{ color: '#999999' }}>
                  This action cannot be undone. All members will lose access and team projects will become personal projects of their creators.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 font-[Rajdhani] font-semibold tracking-wider rounded-lg transition-all"
                style={{
                  backgroundColor: 'rgba(102, 102, 102, 0.2)',
                  border: '1px solid rgba(102, 102, 102, 0.4)',
                  color: '#999999'
                }}
                onMouseEnter={(e) => {
                  if (!deleting) e.currentTarget.style.backgroundColor = 'rgba(102, 102, 102, 0.3)';
                }}
                onMouseLeave={(e) => {
                  if (!deleting) e.currentTarget.style.backgroundColor = 'rgba(102, 102, 102, 0.2)';
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 font-[Rajdhani] font-semibold tracking-wider rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'rgba(204, 0, 0, 0.2)',
                  border: '2px solid #cc0000',
                  color: '#cc0000',
                  boxShadow: '0 0 10px rgba(204, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.3)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(204, 0, 0, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.2)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(204, 0, 0, 0.3)';
                  }
                }}
              >
                {deleting ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
