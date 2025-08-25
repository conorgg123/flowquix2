import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { supabase } from './supabase';

interface CollaborationOptions {
  documentId: string;
  userId: string;
  onSync?: () => void;
  onUpdate?: (update: any) => void;
}

export class CollaborationManager {
  private doc: Y.Doc;
  private webrtc: WebrtcProvider;
  private persistence: IndexeddbPersistence;
  private documentId: string;
  private userId: string;

  constructor(options: CollaborationOptions) {
    this.documentId = options.documentId;
    this.userId = options.userId;
    this.doc = new Y.Doc();

    // Set up WebRTC provider for real-time sync
    this.webrtc = new WebrtcProvider(`pulsehub-${this.documentId}`, this.doc, {
      signaling: ['wss://signaling.pulsehub.com'],
      password: 'optional-password',
      awareness: {
        user: {
          id: this.userId,
          name: 'User',
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        }
      }
    });

    // Set up IndexedDB for offline persistence
    this.persistence = new IndexeddbPersistence(
      `pulsehub-${this.documentId}`,
      this.doc
    );

    // Handle sync events
    this.persistence.on('synced', () => {
      options.onSync?.();
    });

    // Handle document updates
    this.doc.on('update', (update: any) => {
      options.onUpdate?.(update);
    });
  }

  // Get shared text for rich text editing
  public getSharedText(name: string): Y.Text {
    return this.doc.getText(name);
  }

  // Get shared map for structured data
  public getSharedMap(name: string): Y.Map<any> {
    return this.doc.getMap(name);
  }

  // Get shared array for lists
  public getSharedArray(name: string): Y.Array<any> {
    return this.doc.getArray(name);
  }

  // Get awareness info about connected users
  public getAwareness(): Map<number, any> {
    return this.webrtc.awareness.getStates();
  }

  // Clean up resources
  public destroy(): void {
    this.webrtc.destroy();
    this.persistence.destroy();
    this.doc.destroy();
  }

  // Save document state to Supabase
  public async saveState(): Promise<void> {
    try {
      const state = Y.encodeStateAsUpdate(this.doc);
      const { error } = await supabase
        .from('document_states')
        .upsert({
          document_id: this.documentId,
          state: Array.from(state),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving document state:', err);
      throw err;
    }
  }

  // Load document state from Supabase
  public async loadState(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('document_states')
        .select('state')
        .eq('document_id', this.documentId)
        .single();

      if (error) throw error;
      if (data?.state) {
        Y.applyUpdate(this.doc, new Uint8Array(data.state));
      }
    } catch (err) {
      console.error('Error loading document state:', err);
      throw err;
    }
  }
}

// Create a new collaboration session
export function createCollaboration(options: CollaborationOptions): CollaborationManager {
  return new CollaborationManager(options);
}