export interface VetProfessional {
  id: string;
  staff_id: string;
  license_number: string;
  license_college: string | null;
  specialty: string | null;
  senasa_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Campos resueltos del staff vinculado
  staff_name?: string;
  staff_email?: string;
  staff_role?: string;
}

export interface VetProfessionalCreateData {
  id?: string;
  staff_id: string;
  license_number: string;
  license_college?: string | null;
  specialty?: string | null;
  senasa_number?: string | null;
  is_active?: boolean;
}

export type VetProfessionalUpdateData = Partial<VetProfessionalCreateData>;
