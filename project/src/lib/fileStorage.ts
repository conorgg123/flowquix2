import { supabase } from './supabase';
import { diff } from 'diff';

interface FileVersion {
  id: string;
  version_number: number;
  url: string;
  changes: string;
  created_at: string;
}

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  version: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export async function uploadFile(
  file: File,
  path: string,
  tags: string[] = []
): Promise<FileMetadata> {
  try {
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    // Create file metadata
    const { data, error: metadataError } = await supabase
      .from('files')
      .insert([{
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        tags,
        version: 1
      }])
      .select()
      .single();

    if (metadataError) throw metadataError;
    return data;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
}

export async function createFileVersion(
  fileId: string,
  newContent: string,
  previousContent?: string
): Promise<FileVersion> {
  try {
    // Get current version
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('version')
      .eq('id', fileId)
      .single();

    if (fileError) throw fileError;

    // Calculate changes using diff
    const changes = previousContent
      ? diff.createPatch(file.name, previousContent, newContent)
      : 'Initial version';

    // Create new version
    const { data, error } = await supabase
      .from('asset_versions')
      .insert([{
        asset_id: fileId,
        version_number: file.version + 1,
        url: newContent,
        changes
      }])
      .select()
      .single();

    if (error) throw error;

    // Update file version
    const { error: updateError } = await supabase
      .from('files')
      .update({ version: file.version + 1 })
      .eq('id', fileId);

    if (updateError) throw updateError;

    return data;
  } catch (err) {
    console.error('Error creating file version:', err);
    throw err;
  }
}

export async function getFileVersions(fileId: string): Promise<FileVersion[]> {
  try {
    const { data, error } = await supabase
      .from('asset_versions')
      .select('*')
      .eq('asset_id', fileId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching file versions:', err);
    throw err;
  }
}

export async function restoreFileVersion(
  fileId: string,
  versionId: string
): Promise<void> {
  try {
    // Get version details
    const { data: version, error: versionError } = await supabase
      .from('asset_versions')
      .select('url, version_number')
      .eq('id', versionId)
      .single();

    if (versionError) throw versionError;

    // Create new version with restored content
    await createFileVersion(fileId, version.url);
  } catch (err) {
    console.error('Error restoring file version:', err);
    throw err;
  }
}

export async function addFileTag(
  fileId: string,
  tag: string
): Promise<void> {
  try {
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('tags')
      .eq('id', fileId)
      .single();

    if (fileError) throw fileError;

    const newTags = [...new Set([...(file.tags || []), tag])];

    const { error } = await supabase
      .from('files')
      .update({ tags: newTags })
      .eq('id', fileId);

    if (error) throw error;
  } catch (err) {
    console.error('Error adding file tag:', err);
    throw err;
  }
}

export async function removeFileTag(
  fileId: string,
  tag: string
): Promise<void> {
  try {
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('tags')
      .eq('id', fileId)
      .single();

    if (fileError) throw fileError;

    const newTags = (file.tags || []).filter((t: string) => t !== tag);

    const { error } = await supabase
      .from('files')
      .update({ tags: newTags })
      .eq('id', fileId);

    if (error) throw error;
  } catch (err) {
    console.error('Error removing file tag:', err);
    throw err;
  }
}