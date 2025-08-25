import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  File as FileIcon,
  Upload,
  Folder,
  Download,
  Trash2,
  X,
  Search,
  Plus,
  FolderPlus,
  Image,
  FileText,
  FilePdf,
  FileSpreadsheet,
  Video,
  Music,
  Archive,
  Code
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  folder_path: string;
  created_at: string;
  updated_at: string;
}

interface Folder {
  path: string;
  files: number;
}

// Helper function to get file icon based on type
function getFileIcon(type: string) {
  if (type.startsWith('image/')) {
    return <Image className="h-8 w-8 text-purple-500" />;
  } else if (type.includes('pdf')) {
    return <FilePdf className="h-8 w-8 text-red-500" />;
  } else if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
    return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
  } else if (type.startsWith('video/')) {
    return <Video className="h-8 w-8 text-blue-500" />;
  } else if (type.startsWith('audio/')) {
    return <Music className="h-8 w-8 text-yellow-500" />;
  } else if (type.includes('zip') || type.includes('compressed')) {
    return <Archive className="h-8 w-8 text-orange-500" />;
  } else if (type.includes('javascript') || type.includes('json') || type.includes('html') || type.includes('css')) {
    return <Code className="h-8 w-8 text-gray-700" />;
  } else {
    return <FileText className="h-8 w-8 text-gray-500" />;
  }
}

// Mock data for files
const mockFilesData: Record<string, File[]> = {
  '/': [
    {
      id: '1',
      name: 'Project Plan.pdf',
      size: 2547852,
      type: 'application/pdf',
      url: '#',
      folder_path: '/',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Team Photo.jpg',
      size: 4582145,
      type: 'image/jpeg',
      url: '#',
      folder_path: '/',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Budget.xlsx',
      size: 1842563,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      url: '#',
      folder_path: '/',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      name: 'Meeting Notes.docx',
      size: 842361,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: '#',
      folder_path: '/',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  '/Documents': [
    {
      id: '5',
      name: 'Requirements.pdf',
      size: 1548756,
      type: 'application/pdf',
      url: '#',
      folder_path: '/Documents',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      name: 'Contract.pdf',
      size: 2854123,
      type: 'application/pdf',
      url: '#',
      folder_path: '/Documents',
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '7',
      name: 'User Manual.docx',
      size: 3542187,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: '#',
      folder_path: '/Documents',
      created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  '/Images': [
    {
      id: '8',
      name: 'Logo.png',
      size: 542361,
      type: 'image/png',
      url: '#',
      folder_path: '/Images',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '9',
      name: 'Banner.jpg',
      size: 2458963,
      type: 'image/jpeg',
      url: '#',
      folder_path: '/Images',
      created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '10',
      name: 'Product Mockup.psd',
      size: 15842365,
      type: 'application/octet-stream',
      url: '#',
      folder_path: '/Images',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  '/Reports': [
    {
      id: '11',
      name: 'Q1 Report.pdf',
      size: 4582123,
      type: 'application/pdf',
      url: '#',
      folder_path: '/Reports',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '12',
      name: 'Q2 Report.pdf',
      size: 4825163,
      type: 'application/pdf',
      url: '#',
      folder_path: '/Reports',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '13',
      name: 'Analytics.xlsx',
      size: 2584123,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      url: '#',
      folder_path: '/Reports',
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// Mock data for folders
const mockFolders: Folder[] = [
  { path: '/Documents', files: 3 },
  { path: '/Images', files: 3 },
  { path: '/Reports', files: 3 }
];

export function FileList() {
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState('/');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    multiple: true
  });

  useEffect(() => {
    fetchFiles();
  }, [currentFolder]);

  async function fetchFiles() {
    try {
      setLoading(true);
      
      // Simulate API fetch delay
      setTimeout(() => {
        // Get the files for the current folder from mock data
        const folderFiles = mockFilesData[currentFolder] || [];
        setFiles(folderFiles);
        
        // Filter out the current folder from the mock folders
        const relevantFolders = mockFolders.filter(folder => 
          folder.path !== currentFolder && 
          (
            // Show top-level folders when in root
            (currentFolder === '/' && !folder.path.slice(1).includes('/')) ||
            // Show nested folders when in a specific folder
            (currentFolder !== '/' && folder.path.startsWith(currentFolder + '/') && 
             folder.path.slice(currentFolder.length + 1).split('/').length === 1)
          )
        );
        
        setFolders(relevantFolders);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
      setLoading(false);
    }
  }

  async function handleFileDrop(acceptedFiles: File[]) {
    try {
      setUploading(true);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock file entries
      const newFiles: File[] = acceptedFiles.map(file => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '#',
        folder_path: currentFolder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Add to existing files
      setFiles(prevFiles => [...newFiles, ...prevFiles]);
      
      // Update mock data store
      if (mockFilesData[currentFolder]) {
        mockFilesData[currentFolder] = [...newFiles, ...mockFilesData[currentFolder]];
      } else {
        mockFilesData[currentFolder] = newFiles;
      }
      
      setUploading(false);
    } catch (err) {
      console.error('Error uploading files:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to upload files');
      }
      setUploading(false);
    }
  }

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      // Create new folder path
      const newPath = currentFolder === '/'
        ? `/${newFolderName}`
        : `${currentFolder}/${newFolderName}`;
      
      // Check if folder already exists
      if (mockFolders.some(folder => folder.path === newPath)) {
        setError('Folder already exists');
        return;
      }
      
      // Add new folder to mock folders
      const newFolder: Folder = {
        path: newPath,
        files: 0
      };
      
      mockFolders.push(newFolder);
      setFolders([...folders, newFolder]);
      
      // Initialize empty file array for the new folder
      mockFilesData[newPath] = [];
      
      setShowNewFolderDialog(false);
      setNewFolderName('');
    } catch (err) {
      console.error('Error creating folder:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create folder');
      }
    }
  }

  async function deleteFile(id: string, url: string) {
    try {
      // Remove file from state
      setFiles(files.filter(f => f.id !== id));
      
      // Remove file from mock data
      if (mockFilesData[currentFolder]) {
        mockFilesData[currentFolder] = mockFilesData[currentFolder].filter(f => f.id !== id);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete file');
      }
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Files</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FolderPlus className="h-5 w-5 mr-2" />
            New Folder
          </button>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-red-700 hover:text-red-900 focus:outline-none"
          >
            <X className="h-4 w-4 inline" />
          </button>
        </div>
      )}

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
          {uploading && (
            <div className="mt-2 animate-pulse text-indigo-600">
              Uploading...
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-2 mb-4 text-sm">
        <button
          onClick={() => setCurrentFolder('/')}
          className="text-gray-600 hover:text-gray-900"
        >
          Home
        </button>
        {currentFolder !== '/' && currentFolder.split('/').filter(Boolean).map((folder, index, array) => (
          <React.Fragment key={folder}>
            <span className="text-gray-400">/</span>
            <button
              onClick={() => setCurrentFolder('/' + array.slice(0, index + 1).join('/'))}
              className="text-gray-600 hover:text-gray-900"
            >
              {folder}
            </button>
          </React.Fragment>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <div
              key={folder.path}
              onClick={() => setCurrentFolder(folder.path)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Folder className="h-8 w-8 text-indigo-600" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {folder.path.split('/').pop()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {folder.files} files
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {getFileIcon(file.type)}
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={file.url}
                    download
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id, file.url);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Uploaded {format(new Date(file.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          ))}

          {filteredFiles.length === 0 && folders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No files in this folder</h3>
              <p className="mt-2 text-gray-500">
                Upload files or create a new folder to get started
              </p>
            </div>
          )}
        </div>
      )}

      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Folder</h2>
              <button
                onClick={() => setShowNewFolderDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createFolder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter folder name"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewFolderDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}