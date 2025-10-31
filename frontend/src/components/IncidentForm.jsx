import { useState } from 'react';
import { X } from 'lucide-react';

const IncidentForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Phishing',
    priority: 'Medium',
    date: new Date().toISOString().split('T')[0]
  });
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFileError('');

    if (selectedFiles.length > 5) {
      setFileError('Maximum 5 files allowed');
      return;
    }

    for (let file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`File ${file.name} exceeds 5MB limit`);
        return;
      }
    }

    setFiles(selectedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fileError) return;
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    files.forEach(file => data.append('evidence', file));
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Report New Incident</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              required
              rows="4"
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Phishing">Phishing</option>
                <option value="Malware">Malware</option>
                <option value="Ransomware">Ransomware</option>
                <option value="Unauthorized Access">Unauthorized Access</option>
                <option value="Data Breach">Data Breach</option>
                <option value="DDoS">DDoS</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select
                className="input-field"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evidence (Max 5 files, 5MB each)</label>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              className="input-field"
              onChange={handleFileChange}
            />
            {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
            {files.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">{files.length} file(s) selected</p>
            )}
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn-primary flex-1">Submit Report</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;
