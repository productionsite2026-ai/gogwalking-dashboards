/**
 * Service Incidents - Signalement et gestion des incidents
 * Utilise Supabase directement côté client
 */

import { supabase } from "@/integrations/supabase/client";

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
  reporterId: string;
  reporterType: 'walker' | 'owner';
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location?: string;
  timestamp: Date;
  photoUrls: string[];
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
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

export const INCIDENT_TYPES: Record<IncidentType, string> = {
  injury: 'Blessure du chien',
  behavior: 'Problème de comportement',
  lost_dog: 'Chien perdu',
  property_damage: 'Dommage à la propriété',
  health: 'Problème de santé',
  other: 'Autre',
};

export const SEVERITY_LEVELS: Record<IncidentSeverity, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevé',
  critical: 'Critique',
};

/**
 * Créer un rapport d'incident via notification Supabase
 */
export async function createIncidentReport(
  report: Omit<IncidentReport, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'resolution' | 'resolvedAt' | 'resolvedBy'>
): Promise<IncidentReport> {
  // Insert as a notification for now (incident_reports table may not exist yet)
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: report.reporterId,
      type: 'incident',
      title: `🚨 Incident: ${report.title}`,
      message: `${INCIDENT_TYPES[report.type]} - ${SEVERITY_LEVELS[report.severity]}: ${report.description}`,
    });

  if (error) {
    console.error('Erreur création rapport incident:', error);
    throw new Error('Impossible de créer le rapport');
  }

  return {
    ...report,
    id: `incident-${Date.now()}`,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Uploader une photo d'incident
 */
export async function uploadIncidentPhoto(file: File, incidentId: string): Promise<string | null> {
  const fileName = `incidents/${incidentId}/${Date.now()}-${file.name}`;
  
  const { error } = await supabase.storage
    .from('walk-proofs')
    .upload(fileName, file);

  if (error) {
    console.error('Erreur upload photo incident:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('walk-proofs')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export default {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  createIncidentReport,
  uploadIncidentPhoto,
};
