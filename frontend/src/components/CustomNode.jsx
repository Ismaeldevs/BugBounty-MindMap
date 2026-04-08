import React from 'react';
import { Handle, Position } from 'reactflow';
import { Globe, Server, Shield, AlertTriangle, StickyNote, Code } from 'lucide-react';

const CustomNode = ({ data }) => {
  const getIcon = () => {
    switch (data.nodeType) {
      case 'root':
      case 'subdomain':
      case 'endpoint':
        return <Globe className="w-4 h-4" />;
      case 'ip_address':
        return <Server className="w-4 h-4" />;
      case 'technology':
        return <Code className="w-4 h-4" />;
      case 'vulnerability':
        return <AlertTriangle className="w-4 h-4" />;
      case 'note':
        return <StickyNote className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusStyles = () => {
    switch (data.status) {
      case 'in_scope':
        return {
          bg: 'rgba(0, 255, 65, 0.15)',
          border: '2px solid #00ff41',
          shadow: '0 0 15px rgba(0, 255, 65, 0.4)',
          color: '#00ff41'
        };
      case 'out_of_scope':
        return {
          bg: 'rgba(102, 102, 102, 0.15)',
          border: '2px solid #666666',
          shadow: '0 0 10px rgba(102, 102, 102, 0.3)',
          color: '#888888'
        };
      case 'reconnaissance':
        return {
          bg: 'rgba(170, 102, 170, 0.15)',
          border: '2px solid #aa66aa',
          shadow: '0 0 15px rgba(170, 102, 170, 0.4)',
          color: '#aa66aa'
        };
      case 'testing':
        return {
          bg: 'rgba(255, 193, 7, 0.15)',
          border: '2px solid #ffc107',
          shadow: '0 0 15px rgba(255, 193, 7, 0.4)',
          color: '#ffc107'
        };
      case 'vulnerable':
        return {
          bg: 'rgba(255, 0, 0, 0.2)',
          border: '2px solid #ff0000',
          shadow: '0 0 20px rgba(255, 0, 0, 0.6), inset 0 0 10px rgba(255, 0, 0, 0.2)',
          color: '#ff0000'
        };
      case 'patched':
        return {
          bg: 'rgba(74, 14, 78, 0.15)',
          border: '2px solid #4a0e4e',
          shadow: '0 0 15px rgba(74, 14, 78, 0.4)',
          color: '#aa66aa'
        };
      case 'reported':
        return {
          bg: 'rgba(0, 217, 255, 0.15)',
          border: '2px solid #00d9ff',
          shadow: '0 0 15px rgba(0, 217, 255, 0.4)',
          color: '#00d9ff'
        };
      default:
        return {
          bg: 'rgba(102, 102, 102, 0.15)',
          border: '2px solid #666666',
          shadow: '0 0 10px rgba(102, 102, 102, 0.3)',
          color: '#888888'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div 
      className="px-4 py-3 min-w-[200px] transition-all duration-300 hover:scale-105 relative"
      style={{
        backgroundColor: styles.bg,
        border: styles.border,
        boxShadow: styles.shadow,
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        backdropFilter: 'blur(5px)'
      }}
    >
      {/* Corner accent marks */}
      <div className="absolute top-0 left-0 w-2 h-2" style={{ borderTop: `2px solid ${styles.color}`, borderLeft: `2px solid ${styles.color}` }}></div>
      <div className="absolute bottom-0 right-0 w-2 h-2" style={{ borderBottom: `2px solid ${styles.color}`, borderRight: `2px solid ${styles.color}` }}></div>
      
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3"
        style={{
          background: styles.color,
          border: `2px solid ${styles.bg}`,
          boxShadow: `0 0 8px ${styles.color}`
        }}
      />
      
      <div className="flex items-center space-x-2 mb-1">
        <div style={{ color: styles.color }}>{getIcon()}</div>
        <div className="font-semibold text-sm font-[Rajdhani] tracking-wide" style={{ color: '#ffffff' }}>
          {data.label}
        </div>
      </div>
      
      <div className="text-xs font-[FiraCode] capitalize" style={{ color: styles.color, opacity: 0.9 }}>
        [{data.nodeType.replace('_', ' ')}]
      </div>

      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs font-[FiraCode]"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: styles.color,
                border: `1px solid ${styles.color}40`
              }}
            >
              #{tag}
            </span>
          ))}
          {data.tags.length > 2 && (
            <span className="px-2 py-0.5 text-xs font-[FiraCode]" style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: styles.color,
              border: `1px solid ${styles.color}40`
            }}>
              +{data.tags.length - 2}
            </span>
          )}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3"
        style={{
          background: styles.color,
          border: `2px solid ${styles.bg}`,
          boxShadow: `0 0 8px ${styles.color}`
        }}
      />
    </div>
  );
};

export default CustomNode;
