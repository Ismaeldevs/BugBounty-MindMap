import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamsAPI, projectsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Users, Crown, Shield, User as UserIcon, 
  Mail, UserPlus, Trash2, Settings, FolderOpen, Calendar 
} from 'lucide-react';

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    scope: '',
    program_url: '',
    tags: '',
    team_id: null
  });

  const currentUserMembership = members.find(m => m.user_id === user?.id);
  const isOwner = currentUserMembership?.role === 'owner';
  const isAdmin = currentUserMembership?.role === 'admin' || isOwner;

  useEffect(() => {
    loadTeamData();
  }, [id]);

  const loadTeamData = async () => {
    try {
      const [teamData, projectsData] = await Promise.all([
        teamsAPI.get(id),
        projectsAPI.list()
      ]);
      
      setTeam(teamData);
      setMembers(teamData.members || []);
      // Filter projects that belong to this team
      setProjects(projectsData.filter(p => p.team_id === parseInt(id)));
    } catch (error) {
      console.error('Error loading team:', error);
      toast.error('Failed to load team details');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!newMemberEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setAddingMember(true);
    try {
      const newMember = await teamsAPI.addMember(id, {
        email: newMemberEmail,
        role: newMemberRole
      });
      
      setMembers([...members, newMember]);
      toast.success(`${newMember.username} added to team!`);
      setNewMemberEmail('');
      setNewMemberRole('member');
      setShowAddMember(false);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.detail || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId, username) => {
    if (!confirm(`Remove ${username} from the team?`)) return;

    try {
      await teamsAPI.removeMember(id, userId);
      setMembers(members.filter(m => m.user_id !== userId));
      toast.success(`${username} removed from team`);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.detail || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId, username, newRole) => {
    try {
      await teamsAPI.updateMemberRole(id, userId, { role: newRole });
      setMembers(members.map(m => 
        m.user_id === userId ? { ...m, role: newRole } : m
      ));
      toast.success(`${username}'s role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!projectFormData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setCreatingProject(true);
    try {
      const projectData = {
        ...projectFormData,
        team_id: parseInt(id),
        tags: projectFormData.tags ? projectFormData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      
      const newProject = await projectsAPI.create(projectData);
      toast.success('Project created successfully!');
      setProjects([...projects, newProject]);
      setShowCreateProject(false);
      setProjectFormData({
        name: '',
        description: '',
        scope: '',
        program_url: '',
        tags: '',
        team_id: null
      });
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.detail || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-redteam-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyber-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 font-mono">Loading team...</p>
        </div>
      </div>
    );
  }

  if (!team) return null;

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

      <div className="container mx-auto px-6 py-8 max-w-7xl">
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
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold font-[Rajdhani] tracking-wider mb-2" style={{
                color: '#00ff41',
                textShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
              }}>
                {team.name}
              </h1>
              {team.description && (
                <p className="font-[Rajdhani] text-sm max-w-2xl" style={{ color: '#999999' }}>
                  {team.description}
                </p>
              )}
            </div>
            
            {isOwner && (
              <button
                onClick={() => navigate(`/teams/${id}/settings`)}
                className="px-4 py-2 rounded transition-all flex items-center gap-2 font-[Rajdhani] font-semibold tracking-wider"
                style={{
                  backgroundColor: 'rgba(102, 102, 102, 0.2)',
                  border: '1px solid rgba(102, 102, 102, 0.4)',
                  color: '#999999'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(102, 102, 102, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(102, 102, 102, 0.2)';
                }}
              >
                <Settings className="w-4 h-4" />
                SETTINGS
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm font-[Rajdhani]" style={{ color: '#999999' }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyber-blue" />
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-purple-400" />
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Created {new Date(team.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Section */}
          <div className="lg:col-span-2">
            <div
              className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-gray-700/50 rounded-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyber-green font-mono flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  TEAM MEMBERS
                </h2>
                
                {isAdmin && (
                  <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className="px-4 py-2 bg-cyber-green/20 text-cyber-green border border-cyber-green/50 font-mono rounded hover:bg-cyber-green/30 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    ADD MEMBER
                  </button>
                )}
              </div>

              {/* Add Member Form */}
              {showAddMember && (
                <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-900/50 border border-cyber-green/30 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="member@email.com"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 focus:border-cyber-green rounded text-white placeholder-gray-500 font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 focus:border-cyber-green rounded text-white font-mono outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={addingMember}
                      className="px-4 py-2 bg-cyber-green/20 text-cyber-green border border-cyber-green/50 font-mono rounded hover:bg-cyber-green/30 transition-all disabled:opacity-50"
                    >
                      {addingMember ? 'ADDING...' : 'ADD'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMember(false);
                        setNewMemberEmail('');
                        setNewMemberRole('member');
                      }}
                      className="px-4 py-2 bg-gray-700/50 text-gray-300 border border-gray-600/50 font-mono rounded hover:bg-gray-700 transition-all"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg hover:border-cyber-green/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 bg-gradient-to-br from-cyber-green/20 to-cyber-blue/20 border border-cyber-green/30 rounded-lg flex items-center justify-center"
                        >
                          {getRoleIcon(member.role)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono font-bold">
                              {member.username}
                            </span>
                            {member.user_id === user?.id && (
                              <span className="text-xs text-cyber-green font-mono">(YOU)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Role Badge/Selector */}
                        {isOwner && member.role !== 'owner' ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.user_id, member.username, e.target.value)}
                            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-xs font-mono text-white outline-none"
                          >
                            <option value="member">MEMBER</option>
                            <option value="admin">ADMIN</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded text-xs font-mono border ${
                            member.role === 'owner' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                            member.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/50'
                          }`}>
                            {member.role.toUpperCase()}
                          </span>
                        )}

                        {/* Remove Button */}
                        {isAdmin && member.role !== 'owner' && member.user_id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.user_id, member.username)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 font-mono">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Sidebar */}
          <div>
            <div
              className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-gray-700/50 rounded-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <h3 className="text-xl font-bold text-cyber-blue font-mono mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                TEAM PROJECTS
              </h3>

              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-mono text-sm">No team projects yet</p>
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="mt-4 px-4 py-2 bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50 font-mono rounded hover:bg-cyber-blue/30 transition-all text-sm"
                  >
                    CREATE PROJECT
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="p-3 bg-gray-900/50 border border-gray-700/50 rounded hover:border-cyber-blue/50 cursor-pointer transition-all"
                    >
                      <h4 className="text-white font-mono font-bold text-sm">
                        {project.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {project.status.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(5, 10, 14, 0.9)' }}>
          <div className="card-cyber max-w-md w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: 'var(--color-cyber-blue)' }}></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: 'var(--color-cyber-purple)' }}></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: 'var(--color-cyber-green)' }}></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: 'var(--color-cyber-pink)' }}></div>
            
            <h2 className="text-xl font-bold font-[Orbitron] mb-4 tracking-wider" style={{ color: 'var(--color-cyber-blue)' }}>
              CREATE_TEAM_PROJECT
            </h2>
            
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: 'var(--color-cyber-green)' }}>
                  &gt; PROJECT_NAME *
                </label>
                <input
                  type="text"
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
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
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
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
                  value={projectFormData.scope}
                  onChange={(e) => setProjectFormData({ ...projectFormData, scope: e.target.value })}
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
                  value={projectFormData.program_url}
                  onChange={(e) => setProjectFormData({ ...projectFormData, program_url: e.target.value })}
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
                  value={projectFormData.tags}
                  onChange={(e) => setProjectFormData({ ...projectFormData, tags: e.target.value })}
                  className="input-cyber w-full px-3 py-1.5 font-[FiraCode] text-sm"
                  placeholder="web, api, mobile"
                />
              </div>

              <div className="p-3 rounded" style={{
                backgroundColor: 'rgba(0, 217, 255, 0.05)',
                border: '1px solid rgba(0, 217, 255, 0.3)'
              }}>
                <p className="text-xs font-[Rajdhani]" style={{ color: '#00d9ff' }}>
                  ℹ This project will be shared with all team members
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
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
                  disabled={creatingProject}
                >
                  {creatingProject ? 'CREATING...' : 'CREATE_PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
