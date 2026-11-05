export interface DashboardStats {
  drivers_total: number;
  drivers_by_status: Record<'en_attente' | 'actif' | 'suspendu' | 'archive', number>;
  drivers_by_compliance: Record<'conforme' | 'expire_bientot' | 'non_conforme', number>;
  motorcycles_total: number;
  agents_total: number;
  controls_last_7_days: number;
}

export interface AppSettings {
  public_domain: string;
  expiry_warning_days: number;
}
