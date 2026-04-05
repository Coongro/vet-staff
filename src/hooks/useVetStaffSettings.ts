/**
 * Hook para leer settings del plugin vet-staff.
 */
import { getHostReact, useSettings } from '@coongro/plugin-sdk';

const React = getHostReact();
const { useMemo } = React;

export interface VetStaffSettings {
  licensePrefix: string;
  defaultCollege: string;
  senasaEnabled: boolean;
  senasaRequired: boolean;
  showInactive: boolean;
}

const DEFAULTS: VetStaffSettings = {
  licensePrefix: 'MP',
  defaultCollege: '',
  senasaEnabled: false,
  senasaRequired: false,
  showInactive: true,
};

export function useVetStaffSettings() {
  const { values, loading } = useSettings('vet-staff.');

  const settings = useMemo<VetStaffSettings>(() => {
    if (!values || loading) return DEFAULTS;
    return {
      licensePrefix: (values['vet-staff.license.prefix'] as string) ?? DEFAULTS.licensePrefix,
      defaultCollege:
        (values['vet-staff.license.defaultCollege'] as string) ?? DEFAULTS.defaultCollege,
      senasaEnabled: (values['vet-staff.senasa.enabled'] as boolean) ?? DEFAULTS.senasaEnabled,
      senasaRequired: (values['vet-staff.senasa.required'] as boolean) ?? DEFAULTS.senasaRequired,
      showInactive: (values['vet-staff.showInactive'] as boolean) ?? DEFAULTS.showInactive,
    };
  }, [values, loading]);

  return { settings, loading };
}
