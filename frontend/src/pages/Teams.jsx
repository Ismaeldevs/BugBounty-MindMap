import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, Crown, Shield, User as UserIcon, Calendar, ChevronRight } from 'lucide-react';

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await teamsAPI.list();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    const iconProps = { className: "w-4 h-4" };
    switch (role) {
      case 'owner':
        return <Crown {...iconProps} style={{ color: '#fbbf24' }} />;
      case 'admin':
        return <Shield {...iconProps} style={{ color: '#aa66aa' }} />;
      default:
        return <UserIcon {...iconProps} style={{ color: '#999999' }} />;
    }
  };

  const getRoleBadge = (role) => {
    const badgeStyles = {
      owner: { 
        bg: 'rgba(251, 191, 36, 0.15)', 
        border: 'rgba(251, 191, 36, 0.4)', 
        color: '#fbbf24' 
      },
      admin: { 
        bg: 'rgba(170, 102, 170, 0.15)', 
        border: 'rgba(170, 102, 170, 0.4)', 
        color: '#aa66aa' 
      },
      member: { 
        bg: 'rgba(153, 153, 153, 0.15)', 
        border: 'rgba(153, 153, 153, 0.4)', 
        color: '#999999' 
      }
    };

    const style = badgeStyles[role] || badgeStyles.member;

    return (
      <span 
        className="px-2 py-1 rounded text-xs font-[Rajdhani] tracking-wider flex items-center gap-1"
        style={{
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          color: style.color
        }}
      >
        {getRoleIcon(role)}
        {role.toUpperCase()}
      </span>
    );
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
            <p className="mt-4 font-[Rajdhani] tracking-wide" style={{ color: '#999999' }}>LOADING_TEAMS...</p>
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
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(139, 0, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(74, 14, 78, 0.08) 0%, transparent 50%)',
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
      
      {/* Diagonal lines decoration */}
      <div className="fixed top-0 right-0 w-1/3 h-full pointer-events-none opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(204, 0, 0, 0.2) 10px, rgba(204, 0, 0, 0.2) 11px)',
      }}></div>
      
      {/* Scan Line Effect */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,255,65,0.05)] to-transparent" 
          style={{ 
            height: '150px', 
            animation: 'scan 6s linear infinite',
            boxShadow: '0 0 50px rgba(0, 255, 65, 0.1)'
          }} 
        />
      </div>
      
      <div className="container mx-auto px-6 py-8 max-w-7xl relative z-20">
        {/* Header with terminal styling */}
        <div className="mb-12 relative">
          {/* Corner decorations */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: '#00ff41' }}></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: '#00ff41' }}></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: '#00ff41' }}></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: '#00ff41' }}></div>
          
          <div className="flex items-center justify-between p-6 rounded-lg" style={{
            backgroundColor: 'rgba(13, 13, 13, 0.9)',
            border: '1px solid rgba(0, 255, 65, 0.3)',
            boxShadow: '0 0 20px rgba(0, 255, 65, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.5)'
          }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-[Rajdhani] tracking-widest" style={{ color: '#00ff41' }}>
                  [TEAMS_MODULE]
                </span>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#cc0000' }}></span>
              </div>
              <h1 className="text-4xl font-bold font-[Rajdhani] tracking-wider mb-2" style={{
                color: '#00ff41',
                textShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
              }}>
                MY TEAMS
              </h1>
              <p className="font-[Rajdhani] tracking-wide" style={{ color: '#999999' }}>
                &gt; Collaborate with other hunters on shared projects
              </p>
            </div>
            
            <button
              onClick={() => navigate('/teams/create')}
              className="group relative px-6 py-3 font-bold font-[Rajdhani] tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(0, 255, 65, 0.1)',
                border: '2px solid #00ff41',
                color: '#00ff41',
                boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 65, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 65, 0.2)';
              }}
            >
              <Plus className="w-5 h-5" />
              CREATE_TEAM
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative max-w-md">
              {/* Corner brackets for empty state */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: '#00ff41' }}></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: '#00ff41' }}></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: '#00ff41' }}></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: '#00ff41' }}></div>
              
              <div className="text-center p-12" style={{
                backgroundColor: 'rgba(13, 13, 13, 0.8)',
                border: '1px solid rgba(0, 255, 65, 0.2)'
              }}>
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#666666' }} />
                <p className="text-xl font-[Rajdhani] tracking-wider mb-2" style={{ color: '#999999' }}>
                  NO_TEAMS_FOUND
                </p>
                <p className="font-[Rajdhani]" style={{ color: '#666666' }}>
                  &gt; Create your first team to start collaborating
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="group relative cursor-pointer"
              >
                {/* Corner brackets for each card */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 transition-all duration-300 group-hover:w-6 group-hover:h-6" style={{ borderColor: '#cc0000' }}></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 transition-all duration-300 group-hover:w-6 group-hover:h-6" style={{ borderColor: '#cc0000' }}></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 transition-all duration-300 group-hover:w-6 group-hover:h-6" style={{ borderColor: '#00ff41' }}></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 transition-all duration-300 group-hover:w-6 group-hover:h-6" style={{ borderColor: '#00ff41' }}></div>
                
                <div 
                  className="p-6 rounded-lg transition-all duration-300 h-full relative overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(13, 13, 13, 0.95)',
                    border: '1px solid rgba(0, 255, 65, 0.2)',
                    boxShadow: '0 0 10px rgba(0, 255, 65, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(13, 13, 13, 0.98)';
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 65, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 65, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(13, 13, 13, 0.95)';
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 65, 0.2)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 65, 0.05)';
                  }}
                >
                  {/* Diagonal line overlay */}
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0, 255, 65, 0.05) 5px, rgba(0, 255, 65, 0.05) 6px)',
                  }}></div>
                  
                  <div className="relative z-10">
                    {/* Team Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded" style={{
                          backgroundColor: 'rgba(0, 255, 65, 0.1)',
                          border: '1px solid rgba(0, 255, 65, 0.3)'
                        }}>
                          {getRoleIcon(team.user_role)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-[Rajdhani] tracking-wide group-hover:tracking-wider transition-all" style={{ color: '#00ff41' }}>
                            {team.name}
                          </h3>
                          <div className="mt-1">
                            {getRoleBadge(team.user_role)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Description */}
                    {team.description && (
                      <p className="text-sm font-[Rajdhani] mb-4 line-clamp-2" style={{ color: '#999999' }}>
                        {team.description}
                      </p>
                    )}

                    {/* Stats with cyber styling */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 rounded" style={{
                        backgroundColor: 'rgba(0, 217, 255, 0.1)',
                        border: '1px solid rgba(0, 217, 255, 0.3)'
                      }}>
                        <Users className="w-4 h-4" style={{ color: '#00d9ff' }} />
                        <span className="text-sm font-[Rajdhani]" style={{ color: '#00d9ff' }}>
                          {team.members_count}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-[Rajdhani]" style={{ color: '#666666' }}>
                        <Calendar className="w-3 h-3" />
                        {new Date(team.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* View button */}
                    <div className="pt-4 border-t" style={{ borderColor: 'rgba(0, 255, 65, 0.1)' }}>
                      <div className="flex items-center justify-between group-hover:text-[#00ff41] transition-colors">
                        <span className="text-sm font-[Rajdhani] tracking-wider" style={{ color: '#999999' }}>
                          VIEW_DETAILS
                        </span>
                        <ChevronRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" style={{ color: '#00ff41' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
