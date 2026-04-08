import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useProjectStore } from '../store/projectStore';
import { nodesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Download, 
  Trash2,
  Globe,
  Server,
  Shield,
  AlertTriangle,
  StickyNote 
} from 'lucide-react';

import CustomNode from '../components/CustomNode';
import ConfirmModal from '../components/ConfirmModal';

const nodeTypes = {
  custom: CustomNode,
};

const MindMap = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject } = useProjectStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, nodeId: null, nodeLabel: '' });
  const reactFlowWrapper = useRef(null);

  // Load project and nodes
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProject(parseInt(projectId));
        const nodesData = await nodesAPI.list(parseInt(projectId));
        
        // Transform backend nodes to ReactFlow format
        const flowNodes = nodesData.map((node) => ({
          id: node.node_id,
          type: 'custom',
          position: { x: node.position_x, y: node.position_y },
          data: {
            label: node.label,
            nodeType: node.node_type,
            status: node.status,
            color: node.color,
            data: node.data,
            notes: node.notes,
            tags: node.tags,
            dbId: node.id,
          },
        }));

        // Create edges from connections
        const flowEdges = [];
        nodesData.forEach((node) => {
          if (node.connections && node.connections.length > 0) {
            node.connections.forEach((targetId) => {
              flowEdges.push({
                id: `${node.node_id}-${targetId}`,
                source: node.node_id,
                target: targetId,
                animated: true,
              });
            });
          }
        });

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        toast.error('Failed to load mindmap data');
      }
    };

    loadData();
  }, [projectId]);

  // Handle node drag end - save position
  const onNodeDragStop = useCallback(async (event, node) => {
    try {
      await nodesAPI.update(parseInt(projectId), node.id, {
        position_x: node.position.x,
        position_y: node.position.y,
      });
    } catch (error) {
      console.error('Failed to save node position:', error);
    }
  }, [projectId]);

  // Handle edge connection
  const onConnect = useCallback(
    async (params) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);

      // Update connections in backend
      try {
        const sourceNode = nodes.find((n) => n.id === params.source);
        const connections = edges
          .filter((e) => e.source === params.source)
          .map((e) => e.target);
        connections.push(params.target);

        await nodesAPI.update(parseInt(projectId), params.source, {
          connections: Array.from(new Set(connections)),
        });

        toast.success('Connection created');
      } catch (error) {
        toast.error('Failed to save connection');
      }
    },
    [nodes, edges, projectId]
  );

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Add new node
  const handleAddNode = async (nodeData) => {
    try {
      const newNodeData = {
        node_id: `node-${Date.now()}`,
        label: nodeData.label,
        node_type: nodeData.nodeType,
        status: nodeData.status || 'reconnaissance',
        position_x: nodeData.position?.x || 100,
        position_y: nodeData.position?.y || 100,
        data: nodeData.data || {},
        notes: nodeData.notes || '',
        tags: nodeData.tags || [],
        color: nodeData.color || '#64748b',
        connections: [],
      };

      const createdNode = await nodesAPI.create(parseInt(projectId), newNodeData);

      // Add to ReactFlow
      setNodes((nds) => [
        ...nds,
        {
          id: createdNode.node_id,
          type: 'custom',
          position: { x: createdNode.position_x, y: createdNode.position_y },
          data: {
            label: createdNode.label,
            nodeType: createdNode.node_type,
            status: createdNode.status,
            color: createdNode.color,
            data: createdNode.data,
            notes: createdNode.notes,
            tags: createdNode.tags,
            dbId: createdNode.id,
          },
        },
      ]);

      toast.success('Node added successfully');
      setShowAddModal(false);
    } catch (error) {
      toast.error('Failed to add node');
    }
  };

  // Delete node
  const handleDeleteNode = async (nodeId, nodeLabel) => {
    setConfirmDelete({ isOpen: true, nodeId, nodeLabel });
  };

  const confirmDeleteAction = async () => {
    try {
      await nodesAPI.delete(parseInt(projectId), confirmDelete.nodeId);
      setNodes((nds) => nds.filter((n) => n.id !== confirmDelete.nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== confirmDelete.nodeId && e.target !== confirmDelete.nodeId));
      setSelectedNode(null);
      toast.success('Node deleted');
      setConfirmDelete({ isOpen: false, nodeId: null, nodeLabel: '' });
    } catch (error) {
      toast.error('Failed to delete node');
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{
      backgroundColor: '#0d0d0d',
      backgroundImage: `
        linear-gradient(rgba(139, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 0, 0, 0.05) 1px, transparent 1px)
      `,
      backgroundSize: '30px 30px'
    }}>
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center relative" style={{
        backgroundColor: 'rgba(13, 13, 13, 0.95)',
        borderBottom: '2px solid rgba(204, 0, 0, 0.5)',
        boxShadow: '0 0 20px rgba(204, 0, 0, 0.2)'
      }}>
        {/* Terminal indicators */}
        <div className="absolute top-3 left-4 flex space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#cc0000', boxShadow: '0 0 8px #cc0000' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffc107', boxShadow: '0 0 8px #ffc107' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00ff41', boxShadow: '0 0 8px #00ff41' }}></div>
        </div>
        
        <div className="flex items-center space-x-4 ml-20">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex items-center font-[Rajdhani] font-semibold transition-all px-3 py-1"
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            &lt; BACK
          </button>
          <h1 className="text-xl font-bold font-[Orbitron] tracking-wider" style={{ color: '#ff4444' }}>
            {currentProject?.name?.toUpperCase() || 'MINDMAP_CANVAS'}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 font-[Rajdhani] font-semibold tracking-wide transition-all"
            style={{
              backgroundColor: 'rgba(0, 255, 65, 0.15)',
              color: '#00ff41',
              border: '2px solid #00ff41',
              boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.25)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.15)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 65, 0.3)';
            }}
          >
            <Plus className="w-4 h-4" />
            <span>ADD_NODE</span>
          </button>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            style: { stroke: '#ff4444', strokeWidth: 2 },
            animated: true,
            type: 'smoothstep'
          }}
        >
          <Controls style={{
            button: {
              backgroundColor: 'rgba(26, 15, 15, 0.9)',
              color: '#ff4444',
              border: '1px solid rgba(204, 0, 0, 0.5)'
            }
          }} />
          <MiniMap 
            style={{
              backgroundColor: 'rgba(13, 13, 13, 0.9)',
              border: '2px solid rgba(204, 0, 0, 0.5)'
            }}
            nodeColor={(node) => {
              switch (node.data.status) {
                case 'vulnerable':
                  return '#ff0000';
                case 'testing':
                  return '#ffc107';
                case 'in_scope':
                  return '#00ff41';
                case 'reconnaissance':
                  return '#aa66aa';
                default:
                  return '#666666';
              }
            }}
          />
          <Background 
            variant="dots" 
            gap={20} 
            size={1.5}
            color="rgba(204, 0, 0, 0.3)"
            style={{ backgroundColor: '#0a0a0a' }}
          />
          
          <Panel position="top-right" className="p-4 m-2" style={{
            backgroundColor: 'rgba(26, 15, 15, 0.95)',
            border: '2px solid rgba(204, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(204, 0, 0, 0.3)'
          }}>
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: '#cc0000' }}></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: '#aa66aa' }}></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: '#aa66aa' }}></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: '#cc0000' }}></div>
            
            <div className="text-sm space-y-2 relative">
              <p className="font-semibold font-[Orbitron] tracking-wider mb-3" style={{ color: '#ff4444' }}>STATUS_LEGEND</p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#00ff41', boxShadow: '0 0 8px rgba(0, 255, 65, 0.5)' }}></div>
                <span className="text-xs font-[Rajdhani]" style={{ color: '#cccccc' }}>IN_SCOPE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ffc107', boxShadow: '0 0 8px rgba(255, 193, 7, 0.5)' }}></div>
                <span className="text-xs font-[Rajdhani]" style={{ color: '#cccccc' }}>TESTING</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ff0000', boxShadow: '0 0 8px rgba(255, 0, 0, 0.5)' }}></div>
                <span className="text-xs font-[Rajdhani]" style={{ color: '#cccccc' }}>VULNERABLE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#aa66aa', boxShadow: '0 0 8px rgba(170, 102, 170, 0.5)' }}></div>
                <span className="text-xs font-[Rajdhani]" style={{ color: '#cccccc' }}>RECON</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#666666' }}></div>
                <span className="text-xs font-[Rajdhani]" style={{ color: '#cccccc' }}>OUT_OF_SCOPE</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Add Node Modal */}
      {showAddModal && (
        <AddNodeModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddNode}
        />
      )}

      {/* Node Details Sidebar */}
      {selectedNode && (
        <NodeDetailsSidebar
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onDelete={handleDeleteNode}
          projectId={projectId}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, nodeId: null, nodeLabel: '' })}
        onConfirm={confirmDeleteAction}
        title="DELETE_NODE"
        message={`Are you sure you want to permanently delete node "${confirmDelete.nodeLabel}"? This action cannot be undone.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        type="danger"
      />
    </div>
  );
};

// Add Node Modal Component
const AddNodeModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    label: '',
    nodeType: 'subdomain',
    status: 'reconnaissance',
    color: '#64748b',
    notes: '',
    tags: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
      position: { x: Math.random() * 500, y: Math.random() * 500 },
    });
  };

  const nodeTypeOptions = [
    { value: 'root', label: 'Root Domain', icon: Globe },
    { value: 'subdomain', label: 'Subdomain', icon: Globe },
    { value: 'ip_address', label: 'IP Address', icon: Server },
    { value: 'endpoint', label: 'Endpoint', icon: Globe },
    { value: 'technology', label: 'Technology', icon: Shield },
    { value: 'vulnerability', label: 'Vulnerability', icon: AlertTriangle },
    { value: 'note', label: 'Note', icon: StickyNote },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(5, 10, 14, 0.9)' }}>
      <div className="max-w-lg w-full p-6 relative" style={{
        backgroundColor: 'rgba(26, 15, 15, 0.95)',
        border: '2px solid rgba(204, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 30px rgba(204, 0, 0, 0.3)'
      }}>
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: '#cc0000' }}></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: '#aa66aa' }}></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: '#aa66aa' }}></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: '#cc0000' }}></div>
        
        <h2 className="text-2xl font-bold font-[Orbitron] mb-6 tracking-wider" style={{ color: '#ff4444' }}>ADD_NEW_NODE</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
              &gt; LABEL *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="input-cyber w-full px-4 py-2 font-[FiraCode]"
              placeholder="api.example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
              &gt; NODE_TYPE
            </label>
            <select
              value={formData.nodeType}
              onChange={(e) => setFormData({ ...formData, nodeType: e.target.value })}
              className="input-cyber w-full px-4 py-2 font-[FiraCode]"
            >
              {nodeTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
              &gt; STATUS
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-cyber w-full px-4 py-2 font-[FiraCode]"
            >
              <option value="in_scope">IN_SCOPE</option>
              <option value="out_of_scope">OUT_OF_SCOPE</option>
              <option value="reconnaissance">RECONNAISSANCE</option>
              <option value="testing">TESTING</option>
              <option value="vulnerable">VULNERABLE</option>
              <option value="patched">PATCHED</option>
              <option value="reported">REPORTED</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
              &gt; NOTES
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-cyber w-full px-4 py-2 font-[FiraCode]"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>
              &gt; TAGS [comma-separated]
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input-cyber w-full px-4 py-2 font-[FiraCode]"
              placeholder="high-priority, api, nginx"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 font-[Rajdhani] font-semibold tracking-wide transition-all"
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
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 font-[Rajdhani] font-semibold tracking-wide transition-all"
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
              ADD_NODE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Node Details Sidebar Component
const NodeDetailsSidebar = ({ node, onClose, onDelete, projectId }) => {
  return (
    <div className="fixed right-0 top-0 h-full w-96 z-50 overflow-y-auto" style={{
      backgroundColor: 'rgba(26, 15, 15, 0.98)',
      borderLeft: '2px solid rgba(204, 0, 0, 0.5)',
      boxShadow: '-10px 0 30px rgba(204, 0, 0, 0.3)'
    }}>
      <div className="p-6">
        {/* Corner decorations */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: '#cc0000' }}></div>
        
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold font-[Orbitron] tracking-wider" style={{ color: '#ff4444' }}>NODE_DETAILS</h2>
          <button
            onClick={onClose}
            className="transition-all p-1"
            style={{ color: '#aa66aa' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff4444';
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#aa66aa';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: '#00ff41' }}>&gt; LABEL</label>
            <p className="text-lg font-semibold font-[FiraCode]" style={{ color: '#ffffff' }}>{node.data.label}</p>
          </div>

          <div>
            <label className="block text-sm font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: '#00ff41' }}>&gt; TYPE</label>
            <span className="px-3 py-1 text-sm font-[Rajdhani] font-bold tracking-wider" style={{
              backgroundColor: 'rgba(74, 14, 78, 0.3)',
              color: '#aa66aa',
              border: '1px solid rgba(74, 14, 78, 0.5)',
              display: 'inline-block'
            }}>
              {node.data.nodeType.toUpperCase()}
            </span>
          </div>

          <div>
            <label className="block text-sm font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: '#00ff41' }}>&gt; STATUS</label>
            <span className="px-3 py-1 text-sm font-[Rajdhani] font-bold tracking-wider" style={{
              backgroundColor: node.data.status === 'vulnerable' ? 'rgba(255, 0, 0, 0.2)' :
              node.data.status === 'testing' ? 'rgba(255, 193, 7, 0.2)' :
              node.data.status === 'in_scope' ? 'rgba(0, 255, 65, 0.2)' :
              'rgba(102, 102, 102, 0.3)',
              color: node.data.status === 'vulnerable' ? '#ff0000' :
              node.data.status === 'testing' ? '#ffc107' :
              node.data.status === 'in_scope' ? '#00ff41' :
              '#888888',
              border: `1px solid ${node.data.status === 'vulnerable' ? 'rgba(255, 0, 0, 0.5)' :
              node.data.status === 'testing' ? 'rgba(255, 193, 7, 0.5)' :
              node.data.status === 'in_scope' ? 'rgba(0, 255, 65, 0.5)' :
              'rgba(102, 102, 102, 0.5)'}`,
              display: 'inline-block'
            }}>
              {node.data.status.toUpperCase()}
            </span>
          </div>

          {node.data.notes && (
            <div>
              <label className="block text-sm font-[Rajdhani] font-semibold mb-1 tracking-wide" style={{ color: '#00ff41' }}>&gt; NOTES</label>
              <p className="p-3 font-[FiraCode] text-sm" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                color: '#cccccc',
                border: '1px solid rgba(74, 14, 78, 0.3)'
              }}>{node.data.notes}</p>
            </div>
          )}

          {node.data.tags && node.data.tags.length > 0 && (
            <div>
              <label className="block text-sm font-[Rajdhani] font-semibold mb-2 tracking-wide" style={{ color: '#00ff41' }}>&gt; TAGS</label>
              <div className="flex flex-wrap gap-2">
                {node.data.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-[FiraCode]"
                    style={{
                      backgroundColor: 'rgba(74, 14, 78, 0.3)',
                      color: '#aa66aa',
                      border: '1px solid rgba(74, 14, 78, 0.5)'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onDelete(node.id, node.data.label)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 transition-all mt-6 font-[Rajdhani] font-semibold tracking-wide"
            style={{
              backgroundColor: 'rgba(139, 0, 0, 0.2)',
              color: '#cc0000',
              border: '1px solid rgba(139, 0, 0, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>DELETE_NODE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
