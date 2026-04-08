import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { ArrowLeft, Edit, Download, Trash2, Save, MapIcon } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject, updateProject, deleteProject, exportProject, isLoading } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: '',
    program_url: '',
    tags: '',
    status: 'active',
  });

  useEffect(() => {
    fetchProject(projectId);
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
      const projectData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      await updateProject(projectId, projectData);
      toast.success('Project updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleExport = async () => {
    try {
      await exportProject(projectId);
      toast.success('Project exported successfully!');
    } catch (error) {
      toast.error('Failed to export project');
    }
  };

  if (isLoading || !currentProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Projects
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{currentProject.name}</h1>
              )}
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <button
                  onClick={handleUpdate}
                  className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              
              <button
                onClick={handleExport}
                className="flex items-center space-x-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="completed">Completed</option>
                </select>
              ) : (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  currentProject.status === 'active' ? 'bg-green-100 text-green-800' :
                  currentProject.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentProject.status}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              ) : (
                <p className="text-gray-700">{currentProject.description || 'No description'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scope
              </label>
              {isEditing ? (
                <textarea
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{currentProject.scope || 'No scope defined'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program URL
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.program_url}
                  onChange={(e) => setFormData({ ...formData, program_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : currentProject.program_url ? (
                <a
                  href={currentProject.program_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {currentProject.program_url}
                </a>
              ) : (
                <p className="text-gray-500">No URL provided</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="web, api, mobile"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentProject.tags && currentProject.tags.length > 0 ? (
                    currentProject.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No tags</span>
                  )}
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">MindMap</h3>
            <p className="text-gray-600 mb-4">
              Visualize and organize reconnaissance data for this project
            </p>
            <Link
              to={`/projects/${projectId}/mindmap`}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MapIcon className="w-5 h-5" />
              <span>Open MindMap</span>
            </Link>
            
            {currentProject.nodes && currentProject.nodes.length > 0 && (
              <p className="mt-4 text-sm text-gray-600">
                {currentProject.nodes.length} node{currentProject.nodes.length !== 1 ? 's' : ''} in this project
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAction}
        title="DELETE_PROJECT"
        message={`Are you sure you want to permanently delete "${currentProject?.name}"? This action cannot be undone and will delete all associated data including nodes and connections.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        type="danger"
      />
    </div>
  );
};

export default ProjectDetail;
