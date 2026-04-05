import { getHostReact, useSettings } from '@coongro/plugin-sdk';

const React = getHostReact();
const { useMemo } = React;

export interface VetStaffSettings {
  showLicense: boolean;
  showSpecialty: boolean;
  showSenasa: boolean;
}

const DEFAULTS: VetStaffSettings = {
  showLicense: true,
  showSpecialty: true,
  showSenasa: false,
};

export function useVetStaffSettings() {
  const { values, loading } = useSettings('vet-staff.');

  const settings = useMemo<VetStaffSettings>(() => {
    if (!values || loading) return DEFAULTS;
    return {
      showLicense: (values['vet-staff.fields.license'] as boolean) ?? DEFAULTS.showLicense,
      showSpecialty: (values['vet-staff.fields.specialty'] as boolean) ?? DEFAULTS.showSpecialty,
      showSenasa: (values['vet-staff.fields.senasa'] as boolean) ?? DEFAULTS.showSenasa,
    };
  }, [values, loading]);

  return { settings, loading };
}
