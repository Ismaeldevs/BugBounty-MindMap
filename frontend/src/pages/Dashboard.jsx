import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { teamsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, FolderOpen, Calendar, Trash2, Edit, ExternalLink, Download, Minus, Square, X } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const Dashboard = () => {
  const { projects, fetchProjects, deleteProject, exportProject, isLoading } = useProjectStore();
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, projectId: null, projectName: '' });
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: '',
    program_url: '',
    tags: '',
    team_id: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    loadTeams();
  }, [fetchProjects]);

  const loadTeams = async () => {
    try {
      const response = await teamsAPI.list();
      setTeams(response.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Project name is required');
      return;
    }

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const projectData = {
        name: formData.name,
        description: formData.description,
        scope: formData.scope,
        program_url: formData.program_url,
        tags: tagsArray,
        status: 'active',
      };

      // Add team_id if selected
      if (formData.team_id) {
        projectData.team_id = parseInt(formData.team_id);
      }

      const newProject = await useProjectStore.getState().createProject(projectData);

      toast.success('Project created successfully!');
      setShowModal(false);
      setFormData({ name: '', description: '', scope: '', program_url: '', tags: '', team_id: null });
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    setConfirmDelete({ isOpen: true, projectId, projectName });
  };

  const confirmDeleteAction = async () => {
    try {
      await deleteProject(confirmDelete.projectId);
      toast.success('Project deleted successfully');
      setConfirmDelete({ isOpen: false, projectId: null, projectName: '' });
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleExportProject = async (projectId) => {
    try {
      await exportProject(projectId);
      toast.success('Project exported successfully');
    } catch (error) {
      toast.error('Failed to export project');
    }
  };

  return (
    <div className="min-h-screen p-8 relative" style={{
      backgroundColor: '#0d0d0d',
      backgroundImage: `
        linear-gradient(rgba(139, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(rgba(74, 14, 78, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(74, 14, 78, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
      backgroundPosition: '0 0, 0 0, 0 0, 0 0'
    }}>
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(139, 0, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(74, 14, 78, 0.08) 0%, transparent 50%)',
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
      
      {/* Diagonal lines decoration */}
      <div className="fixed top-0 right-0 w-1/3 h-full pointer-events-none opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(204, 0, 0, 0.2) 10px, rgba(204, 0, 0, 0.2) 11px)',
      }}></div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-50" style={{ borderColor: '#cc0000' }}></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 opacity-50" style={{ borderColor: '#aa66aa' }}></div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex space-x-2 items-center">
              <div className="w-3 h-3 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer" style={{ backgroundColor: 'rgba(204, 0, 0, 0.3)', border: '1px solid #cc0000' }}>
                <X className="w-2 h-2" style={{ color: '#cc0000' }} />
              </div>
              <div className="w-3 h-3 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer" style={{ backgroundColor: 'rgba(255, 193, 7, 0.3)', border: '1px solid #ffc107' }}>
                <Minus className="w-2 h-2" style={{ color: '#ffc107' }} />
              </div>
              <div className="w-3 h-3 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer" style={{ backgroundColor: 'rgba(0, 255, 65, 0.3)', border: '1px solid #00ff41' }}>
                <Square className="w-2 h-2" style={{ color: '#00ff41' }} />
              </div>
            </div>
            <h1 className="text-3xl font-bold font-[Orbitron] tracking-wider" style={{ color: '#ff4444' }}>
              PROJECT_DATABASE
            </h1>
          </div>
          <p className="font-[Rajdhani] text-lg" style={{ color: '#999999' }}>
            &gt; Bug_Bounty_Programs // Reconnaissance_Data_Management
          </p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 transition-all font-[Rajdhani] font-semibold tracking-wide"
          style={{
            backgroundColor: 'rgba(0, 255, 65, 0.15)',
            color: '#00ff41',
            border: '2px solid #00ff41',
            boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.25)';
            e.currentTarget.style.borderColor = '#00ff41';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5), inset 0 0 10px rgba(0, 255, 65, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.15)';
            e.currentTarget.style.borderColor = '#00ff41';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 65, 0.3)';
          }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-[Rajdhani] font-semibold tracking-wide">NEW_PROJECT</span>
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: 'var(--color-cyber-blue)' }}></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 opacity-20" style={{ borderColor: 'var(--color-cyber-blue)' }}></div>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="card-cyber p-12 text-center relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: 'var(--color-cyber-blue)' }}></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: 'var(--color-cyber-purple)' }}></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: 'var(--color-cyber-green)' }}></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: 'var(--color-cyber-pink)' }}></div>
          
          <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-cyber-blue)' }} />
          <h3 className="text-2xl font-semibold font-[Orbitron] mb-2" style={{ color: 'var(--color-cyber-green)' }}>
            NO_PROJECTS_FOUND
          </h3>
          <p className="font-[Rajdhani] text-lg mb-6" style={{ color: 'var(--color-cyber-blue)' }}>
            &gt; Initialize_First_Bug_Bounty_Project
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-cyber inline-flex items-center space-x-2 px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            <span className="font-[Rajdhani] font-semibold">CREATE_PROJECT</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="cursor-pointer group relative p-6 transition-all duration-300"
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{
                backgroundColor: 'rgba(26, 15, 15, 0.6)',
                border: '1px solid rgba(139, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(26, 15, 15, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(204, 0, 0, 0.6)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(204, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(26, 15, 15, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(139, 0, 0, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Corner decorations - more subtle */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l transition-all duration-300 group-hover:w-5 group-hover:h-5" style={{ borderColor: 'var(--color-redteam-red)' }}></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r transition-all duration-300 group-hover:w-5 group-hover:h-5" style={{ borderColor: 'var(--color-redteam-purple)' }}></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-all duration-300 group-hover:w-5 group-hover:h-5" style={{ borderColor: 'var(--color-redteam-purple)' }}></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-all duration-300 group-hover:w-5 group-hover:h-5" style={{ borderColor: 'var(--color-redteam-red)' }}></div>
              
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold font-[Orbitron] tracking-wide line-clamp-1 transition-all" style={{ color: '#ff4444' }}>
                  {project.name.toUpperCase()}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    project.status === 'active' ? 'animate-pulse' : ''
                  }`} style={{ 
                    backgroundColor: project.status === 'active' ? 'var(--color-redteam-light)' :
                    project.status === 'archived' ? 'var(--color-redteam-gray)' :
                    'var(--color-redteam-purple)'
                  }}></span>
                  <span className="px-2 py-1 text-xs font-[Rajdhani] font-bold tracking-wider" style={{
                    backgroundColor: project.status === 'active' ? 'rgba(204, 0, 0, 0.2)' :
                    project.status === 'archived' ? 'rgba(45, 45, 45, 0.4)' :
                    'rgba(74, 14, 78, 0.3)',
                    color: project.status === 'active' ? '#ff4444' :
                    project.status === 'archived' ? '#888888' :
                    '#aa66aa',
                    border: `1px solid ${project.status === 'active' ? 'rgba(204, 0, 0, 0.5)' :
                    project.status === 'archived' ? 'rgba(45, 45, 45, 0.6)' :
                    'rgba(74, 14, 78, 0.5)'}`
                  }}>
                    {project.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="font-[Rajdhani] text-sm mb-4 line-clamp-2" style={{ color: 'rgba(153, 153, 153, 0.9)' }}>
                  &gt; {project.description}
                </p>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-[FiraCode] font-medium"
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
              )}

              {/* Date */}
              <div className="flex items-center text-sm mb-4 font-[Rajdhani]" style={{ color: '#888888' }}>
                <Calendar className="w-4 h-4 mr-2" />
                <span>INIT: {new Date(project.created_at).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-4" style={{ borderTop: '1px solid rgba(139, 0, 0, 0.3)' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/projects/${project.id}/mindmap`);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 transition-all font-[Rajdhani] font-semibold text-sm"
                  style={{
                    backgroundColor: 'rgba(204, 0, 0, 0.15)',
                    color: '#ff4444',
                    border: '1px solid rgba(204, 0, 0, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(204, 0, 0, 0.25)';
                    e.target.style.boxShadow = '0 0 8px rgba(204, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(204, 0, 0, 0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>OPEN</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportProject(project.id);
                  }}
                  className="flex items-center justify-center p-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(74, 14, 78, 0.2)',
                    color: '#aa66aa',
                    border: '1px solid rgba(74, 14, 78, 0.4)'
                  }}
                  title="Export"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(74, 14, 78, 0.3)';
                    e.target.style.boxShadow = '0 0 8px rgba(74, 14, 78, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(74, 14, 78, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id, project.name);
                  }}
                  className="flex items-center justify-center p-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(139, 0, 0, 0.2)',
                    color: '#cc0000',
                    border: '1px solid rgba(139, 0, 0, 0.4)'
                  }}
                  title="Delete"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(139, 0, 0, 0.3)';
                    e.target.style.boxShadow = '0 0 8px rgba(139, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(139, 0, 0, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 pt-20 z-50" style={{ backgroundColor: 'rgba(5, 10, 14, 0.9)' }}>
          <div className="card-cyber max-w-md w-full p-6 relative animate-fade-in max-h-[85vh] overflow-y-auto">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: 'var(--color-cyber-blue)' }}></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: 'var(--color-cyber-purple)' }}></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: 'var(--color-cyber-green)' }}></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: 'var(--color-cyber-pink)' }}></div>
            
            <h2 className="text-xl font-bold font-[Orbitron] mb-4 tracking-wider" style={{ color: 'var(--color-cyber-blue)' }}>
              CREATE_NEW_PROJECT
            </h2>
            
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: 'var(--color-cyber-green)' }}>
                  &gt; PROJECT_NAME *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-cyber w-full px-3 py-1.5 text-sm"
                  placeholder="HackerOne_Program_XYZ"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: 'var(--color-cyber-green)' }}>
                  &gt; DESCRIPTION
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-cyber w-full px-3 py-1.5 font-[FiraCode] text-sm"
                  rows="2"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-xs font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: 'var(--color-cyber-green)' }}>
                  &gt; SCOPE
                </label>
                <textarea
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="input-cyber w-full px-3 py-1.5 font-[FiraCode] text-sm"
                  rows="2"
                  placeholder="*.example.com, 192.168.1.0/24"
                />
              </div>

              <div>
                <label className="block text-xs font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: 'var(--color-cyber-green)' }}>
                  &gt; PROGRAM_URL
                </label>
                <input
                  type="url"
                  value={formData.program_url}
                  onChange={(e) => setFormData({ ...formData, program_url: e.target.value })}
                  className="input-cyber w-full px-3 py-1.5 font-[FiraCode] text-sm"
                  placeholder="https://hackerone.com/program"
                />
              </div>

              <div>
                <label className="block text-xs font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: 'var(--color-cyber-green)' }}>
                  &gt; TAGS
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-cyber w-full px-3 py-1.5 font-[FiraCode] text-sm"
                  placeholder="web, api, mobile"
                />
              </div>

              <div>
                <label className="block text-xs font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: 'var(--color-cyber-green)' }}>
                  &gt; TEAM
                </label>
                <select
                  value={formData.team_id || ''}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value || null })}
                  className="input-cyber w-full px-3 py-1.5 font-[FiraCode] text-sm"
                >
                  <option value="">Personal Project</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.user_role.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs font-[Rajdhani]" style={{ color: '#666666' }}>
                  Optional: Share with team
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 font-[Rajdhani] font-semibold tracking-wide transition-all"
                  style={{
                    backgroundColor: 'rgba(184, 0, 230, 0.1)',
                    color: 'var(--color-cyber-purple)',
                    border: '1px solid var(--color-cyber-purple)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(184, 0, 230, 0.2)';
                    e.target.style.boxShadow = '0 0 10px rgba(184, 0, 230, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(184, 0, 230, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-cyber flex-1 px-4 py-2 font-[Rajdhani] font-semibold tracking-wide"
                >
                  {isLoading ? 'CREATING...' : 'CREATE_PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, projectId: null, projectName: '' })}
        onConfirm={confirmDeleteAction}
        title="DELETE_PROJECT"
        message={`Are you sure you want to permanently delete "${confirmDelete.projectName}"? This action cannot be undone and will delete all associated data.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        type="danger"
      />
    </div>
  );
};

export default Dashboard;
