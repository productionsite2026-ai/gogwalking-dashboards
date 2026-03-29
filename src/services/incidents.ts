/**
 * Service Incidents - Signalement et gestion des incidents
 */

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentType = 
  | 'injury'
  | 'behavior'
  | 'lost_dog'
  | 'property_damage'
  | 'health'
  | 'other';

export interface IncidentReport {
  id: string;
  bookingId: string;
  reporterId: string; // ID du promeneur ou propriétaire
  reporterType: 'walker' | 'owner';
  
  // Informations de l'incident
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  
  // Détails
  location?: string;
  timestamp: Date;
  
  // Pièces jointes
  photoUrls: string[];
  
  // Statut
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  
  // Résolution
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentNotification {
  id: string;
  incidentId: string;
  recipientId: string;
  recipientEmail: string;
  type: 'incident_reported' | 'incident_acknowledged' | 'incident_resolved';
  message: string;
  read: boolean;
  createdAt: Date;
}

// Descriptions des types d'incidents
export const INCIDENT_TYPES: Record<IncidentType, string> = {
  injury: 'Blessure du chien',
  behavior: 'Problème de comportement',
  lost_dog: 'Chien perdu',
  property_damage: 'Dommage à la propriété',
  health: 'Problème de santé',
  other: 'Autre',
};

// Descriptions des niveaux de sévérité
export const SEVERITY_LEVELS: Record<IncidentSeverity, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevé',
  critical: 'Critique',
};

/**
 * Créer un rapport d'incident
 */
export async function createIncidentReport(
  report: Omit<IncidentReport, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'resolution' | 'resolvedAt' | 'resolvedBy'>
): Promise<IncidentReport> {
  const newReport: IncidentReport = {
    ...report,
    id: `incident-${Date.now()}`,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Sauvegarder dans la base de données
  try {
    const response = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du rapport');
    }

    return newReport;
  } catch (error) {
    console.error('Erreur création rapport d\'incident:', error);
    throw error;
  }
}

/**
 * Mettre à jour le statut d'un incident
 */
export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentReport['status'],
  resolution?: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/incidents/${incidentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        resolution,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur mise à jour incident:', error);
    return false;
  }
}

/**
 * Récupérer tous les incidents
 */
export async function getIncidents(filters?: {
  status?: IncidentReport['status'];
  severity?: IncidentSeverity;
  type?: IncidentType;
}): Promise<IncidentReport[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.severity) queryParams.append('severity', filters.severity);
    if (filters?.type) queryParams.append('type', filters.type);

    const response = await fetch(`/api/incidents?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des incidents');
    }

    return response.json();
  } catch (error) {
    console.error('Erreur récupération incidents:', error);
    return [];
  }
}

/**
 * Récupérer un incident spécifique
 */
export async function getIncidentById(incidentId: string): Promise<IncidentReport | null> {
  try {
    const response = await fetch(`/api/incidents/${incidentId}`);
    
    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Erreur récupération incident:', error);
    return null;
  }
}

/**
 * Envoyer une notification d'incident
 */
export async function sendIncidentNotification(
  incident: IncidentReport,
  recipientId: string,
  recipientEmail: string,
  type: IncidentNotification['type']
): Promise<boolean> {
  try {
    const messages: Record<IncidentNotification['type'], string> = {
      incident_reported: `Un incident a été signalé: ${incident.title}`,
      incident_acknowledged: `L'incident "${incident.title}" a été pris en charge`,
      incident_resolved: `L'incident "${incident.title}" a été résolu`,
    };

    const response = await fetch('/api/incidents/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId: incident.id,
        recipientId,
        recipientEmail,
        type,
        message: messages[type],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur envoi notification:', error);
    return false;
  }
}

/**
 * Uploader une photo d'incident
 */
export async function uploadIncidentPhoto(file: File, incidentId: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('incidentId', incidentId);

    const response = await fetch('/api/incidents/upload-photo', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload');
    }

    const data = await response.json();
    return data.photoUrl;
  } catch (error) {
    console.error('Erreur upload photo:', error);
    return null;
  }
}

/**
 * Obtenir les statistiques des incidents
 */
export async function getIncidentStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
}> {
  try {
    const response = await fetch('/api/incidents/stats');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return response.json();
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    return {
      total: 0,
      byStatus: {},
      bySeverity: {},
      byType: {},
    };
  }
}

export default {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  createIncidentReport,
  updateIncidentStatus,
  getIncidents,
  getIncidentById,
  sendIncidentNotification,
  uploadIncidentPhoto,
  getIncidentStats,
};
