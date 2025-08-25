import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  File as FileIcon,
  Tag,
  MessageSquare,
  Star,
  History,
  Trash2,
  Download,
  Plus,
  X,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
  tags: string[];
  version: number;
  project_id: string | null;
  created_at: string;
  created_by: string;
}

interface AssetVersion {
  id: string;
  version_number: number;
  url: string;
  changes: string;
  created_at: string;
}

interface FeedbackItem {
  id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  created_at: string;
  created_by: {
    email: string;
  };
}

export function AssetManager() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [versions, setVersions] = useState<AssetVersion[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    multiple: true
  });

  useEffect(() => {
    fetchAssets();
  }, [searchQuery, selectedTags]);

  useEffect(() => {
    if (selectedAsset) {
      fetchVersions(selectedAsset.id);
      fetchFeedback(selectedAsset.id);
    }
  }, [selectedAsset]);

  async function fetchAssets() {
    try {
      let query = supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      setError('Failed to fetch assets');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVersions(assetId: string) {
    try {
      const { data, error } = await supabase
        .from('asset_versions')
        .select('*')
        .eq('asset_id', assetId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (err) {
      console.error('Error fetching versions:', err);
    }
  }

  async function fetchFeedback(assetId: string) {
    try {
      const { data, error } = await supabase
        .from('feedback_items')
        .select(`
          *,
          created_by:created_by(email)
        `)
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  }

  async function handleFileDrop(acceptedFiles: File[]) {
    try {
      setUploading(true);
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${currentFolder}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file);

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error('Storage bucket not configured. Please contact support.');
          }
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath);

        // Create asset record in database
        const { error: dbError } = await supabase
          .from('assets')
          .insert([{
            name: file.name,
            size: file.size,
            type: file.type,
            url: publicUrl,
            tags: uploadTags,
            version: 1
          }]);

        if (dbError) throw dbError;
      }

      fetchFiles();
      setShowUploadDialog(false);
      setUploadTags([]);
    } catch (err) {
      console.error('Error uploading files:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to upload files');
      }
    } finally {
      setUploading(false);
    }
  }

  async function addFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAsset || !newFeedback.trim()) return;

    try {
      const { error } = await supabase
        .from('feedback_items')
        .insert([{
          asset_id: selectedAsset.id,
          content: newFeedback.trim(),
          status: 'pending'
        }]);

      if (error) throw error;
      setNewFeedback('');
      fetchFeedback(selectedAsset.id);
    } catch (err) {
      console.error('Error adding feedback:', err);
    }
  }

  async function deleteAsset(id: string, url: string) {
    try {
      // Delete from storage
      const filePath = url.split('/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('assets')
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setAssets(assets.filter(a => a.id !== id));
      if (selectedAsset?.id === id) {
        setSelectedAsset(null);
      }
    } catch (err) {
      setError('Failed to delete asset');
      console.error('Error:', err);
    }
  }

  function getFileIcon(type: string) {
    if (type.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <FileVideo className="h-8 w-8 text-purple-500" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-8 w-8 text-green-500" />;
    if (type.startsWith('text/')) return <FileText className="h-8 w-8 text-yellow-500" />;
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Digital Assets</h1>
        <button
          onClick={() => setShowUploadDialog(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload Assets
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Asset List */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search assets..."
                      className="pl-10 w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <button
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {assets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedAsset?.id === asset.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(asset.type)}
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {asset.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Version {asset.version} • Updated {format(new Date(asset.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(asset.url, '_blank');
                        }}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAsset(asset.id, asset.url);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {asset.tags.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex space-x-1">
                        {asset.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Details */}
        {selectedAsset && (
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
              {selectedAsset.type.startsWith('image/') ? (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  {getFileIcon(selectedAsset.type)}
                </div>
              )}
            </div>

            {/* Versions */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Versions</h2>
                <History className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {versions.map(version => (
                  <div key={version.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Version {version.version_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <a
                      href={version.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Feedback</h2>
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
              
              <form onSubmit={addFeedback} className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    placeholder="Add feedback..."
                    className="flex-1 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newFeedback.trim()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {feedback.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {item.created_by.email}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'approved' ? 'bg-green-100 text-green-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        item.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{item.content}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Assets</h2>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              {...getRootProps()}
              className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center ${
                isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <Upload className={`h-12 w-12 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select files'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Upload multiple files at once
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {uploadTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      onClick={() => setUploadTags(uploadTags.filter(t => t !== tag))}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      e.preventDefault();
                      setUploadTags([...uploadTags, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTag.trim()) {
                      setUploadTags([...uploadTags, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Tag
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Upload Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}