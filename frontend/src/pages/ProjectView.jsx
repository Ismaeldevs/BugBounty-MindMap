import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, ExternalLink, Calendar, Tag } from 'lucide-react';

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject, isLoading } = useProjectStore();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: '',
    program_url: '',
    tags: '',
    status: 'active',
  });

  useEffect(() => {
    fetchProject(parseInt(projectId));
  }, [projectId, fetchProject]);

  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name || '',
        description: currentProject.description || '',
        scope: currentProject.scope || '',
        program_url: currentProject.program_url || '',
        tags: currentProject.tags?.join(', ') || '',
        status: currentProject.status || 'active',
      });
    }
  }, [currentProject]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await useProjectStore.getState().updateProject(parseInt(projectId), {
        name: formData.name,
        description: formData.description,
        scope: formData.scope,
        program_url: formData.program_url,
        tags: tagsArray,
        status: formData.status,
      });

      toast.success('Project updated successfully!');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: '#cc0000' }}></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 opacity-20" style={{ borderColor: '#cc0000' }}></div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold font-[Orbitron] mb-4" style={{ color: '#ff4444' }}>PROJECT_NOT_FOUND</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="font-[Rajdhani] font-semibold transition-all px-4 py-2"
          style={{
            backgroundColor: 'rgba(204, 0, 0, 0.15)',
            color: '#ff4444',
            border: '1px solid rgba(204, 0, 0, 0.4)'
          }}
        >
          &lt; BACK_TO_DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center mb-4 font-[Rajdhani] font-semibold transition-all px-3 py-2"
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
          <ArrowLeft className="w-5 h-5 mr-2" />
          &lt; BACK_TO_DASHBOARD
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold font-[Orbitron] mb-2 tracking-wider" style={{ color: '#ff4444' }}>
              {currentProject.name.toUpperCase()}
            </h1>
            <div className="flex items-center space-x-4 text-sm font-[Rajdhani]" style={{ color: '#888888' }}>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                INIT: {new Date(currentProject.created_at).toLocaleDateString()}
              </span>
              <span className="px-3 py-1 text-xs font-bold tracking-wider" style={{
                backgroundColor: currentProject.status === 'active' ? 'rgba(204, 0, 0, 0.2)' :
                currentProject.status === 'archived' ? 'rgba(45, 45, 45, 0.4)' :
                'rgba(74, 14, 78, 0.3)',
                color: currentProject.status === 'active' ? '#ff4444' :
                currentProject.status === 'archived' ? '#888888' :
                '#aa66aa',
                border: `1px solid ${currentProject.status === 'active' ? 'rgba(204, 0, 0, 0.5)' :
                currentProject.status === 'archived' ? 'rgba(45, 45, 45, 0.6)' :
                'rgba(74, 14, 78, 0.5)'}`
              }}>
                {currentProject.status.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center space-x-2 px-4 py-2 transition-all font-[Rajdhani] font-semibold"
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
              <Edit2 className="w-4 h-4" />
              <span>{editMode ? 'CANCEL' : 'EDIT'}</span>
            </button>
            <button
              onClick={() => navigate(`/projects/${projectId}/mindmap`)}
              className="flex items-center space-x-2 px-4 py-2 transition-all font-[Rajdhani] font-semibold"
              style={{
                backgroundColor: 'rgba(204, 0, 0, 0.15)',
                color: '#ff4444',
                border: '1px solid rgba(204, 0, 0, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.25)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(204, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <ExternalLink className="w-4 h-4" />
              <span>OPEN_MINDMAP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="p-6 relative" style={{
        backgroundColor: 'rgba(26, 15, 15, 0.6)',
        border: '1px solid rgba(139, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l" style={{ borderColor: '#cc0000' }}></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r" style={{ borderColor: '#aa66aa' }}></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l" style={{ borderColor: '#aa66aa' }}></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r" style={{ borderColor: '#cc0000' }}></div>
        
        {editMode ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>
                &gt; PROJECT_NAME
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-cyber w-full px-4 py-2 font-[FiraCode]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>
                &gt; DESCRIPTION
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-cyber w-full px-4 py-2 font-[FiraCode]"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>
                &gt; SCOPE [Domains/IPs]
              </label>
              <textarea
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                className="input-cyber w-full px-4 py-2 font-[FiraCode]"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>
                &gt; PROGRAM_URL
              </label>
              <input
                type="url"
                value={formData.program_url}
                onChange={(e) => setFormData({ ...formData, program_url: e.target.value })}
                className="input-cyber w-full px-4 py-2 font-[FiraCode]"
              />
            </div>

            <div>
              <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>
                &gt; TAGS [comma-separated]
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-cyber w-full px-4 py-2 font-[FiraCode]"
              />
            </div>

            <div>
              <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>
                &gt; STATUS
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-cyber w-full px-4 py-2 font-[FiraCode]"
              >
                <option value="active">ACTIVE</option>
                <option value="archived">ARCHIVED</option>
                <option value="completed">COMPLETED</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 transition-all font-[Rajdhani] font-semibold tracking-wide"
              style={{
                backgroundColor: 'rgba(204, 0, 0, 0.15)',
                color: '#ff4444',
                border: '1px solid rgba(204, 0, 0, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.25)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(204, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              SAVE_CHANGES
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {currentProject.description && (
              <div>
                <h3 className="text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>&gt; DESCRIPTION</h3>
                <p className="font-[Rajdhani] text-base" style={{ color: '#cccccc' }}>{currentProject.description}</p>
              </div>
            )}

            {currentProject.scope && (
              <div>
                <h3 className="text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>&gt; SCOPE</h3>
                <pre className="p-4 font-[FiraCode] text-sm whitespace-pre-wrap" style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: '#00ff41',
                  border: '1px solid rgba(0, 255, 65, 0.2)'
                }}>
                  {currentProject.scope}
                </pre>
              </div>
            )}

            {currentProject.program_url && (
              <div>
                <h3 className="text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>&gt; PROGRAM_URL</h3>
                <a
                  href={currentProject.program_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center transition-all font-[FiraCode] text-sm"
                  style={{ color: '#aa66aa' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#cc88cc';
                    e.currentTarget.style.textShadow = '0 0 8px rgba(170, 102, 170, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#aa66aa';
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  {currentProject.program_url}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            )}

            {currentProject.tags && currentProject.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-[Rajdhani] font-semibold mb-2 flex items-center tracking-wide" style={{ color: '#ff4444' }}>
                  <Tag className="w-4 h-4 mr-1" />
                  TAGS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentProject.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm font-[FiraCode] font-medium"
                      style={{
                        backgroundColor: 'rgba(74, 14, 78, 0.2)',
                        color: '#aa66aa',
                        border: '1px solid rgba(74, 14, 78, 0.4)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentProject.nodes && currentProject.nodes.length > 0 && (
              <div>
                <h3 className="text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#ff4444' }}>&gt; STATISTICS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4" style={{
                    backgroundColor: 'rgba(204, 0, 0, 0.15)',
                    border: '1px solid rgba(204, 0, 0, 0.4)'
                  }}>
                    <p className="text-3xl font-bold font-[Orbitron]" style={{ color: '#ff4444' }}>{currentProject.nodes.length}</p>
                    <p className="text-sm font-[Rajdhani]" style={{ color: '#888888' }}>TOTAL_NODES</p>
                  </div>
                  <div className="p-4" style={{
                    backgroundColor: 'rgba(204, 0, 0, 0.2)',
                    border: '1px solid rgba(204, 0, 0, 0.5)'
                  }}>
                    <p className="text-3xl font-bold font-[Orbitron]" style={{ color: '#ff4444' }}>
                      {currentProject.nodes.filter(n => n.status === 'vulnerable').length}
                    </p>
                    <p className="text-sm font-[Rajdhani]" style={{ color: '#888888' }}>VULNERABILITIES</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;
