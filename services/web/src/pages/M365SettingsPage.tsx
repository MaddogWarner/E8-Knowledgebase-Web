import { licenseModes, protections } from '../data/m365';
import { isLicenseMode } from '../lib/license';
import { useLocalStorage } from '../lib/useLocalStorage';
import type { Microsoft365LicenseMode } from '../types';

type Microsoft365BaseSelection = 'none' | 'e3' | 'e5';

function baseSelectionFor(mode: Microsoft365LicenseMode): Microsoft365BaseSelection {
  return licenseModes[mode].baseSelection;
}

export function M365SettingsPage() {
  const [licenseMode, setLicenseMode] = useLocalStorage<Microsoft365LicenseMode>('e8kb.licenseMode', 'none', isLicenseMode);
  const baseSelection = baseSelectionFor(licenseMode);
  const activeCount = Array.from({ length: 8 }, (_, index) => protections(index + 1, 'ml3', licenseMode).length).reduce((sum, count) => sum + count, 0);

  function setBaseSelection(selection: Microsoft365BaseSelection) {
    if (selection === 'none') setLicenseMode('none');
    if (selection === 'e3') setLicenseMode(licenseMode === 'e3P2' ? 'e3P2' : 'e3P1');
    if (selection === 'e5') setLicenseMode('e5');
  }

  return (
    <div className="page-stack narrow">
      <section className="page-heading">
        <p className="eyebrow">Optional licensed additions</p>
        <h1>Microsoft 365 Additional Controls</h1>
        <p>
          Select the Microsoft 365 licensing mode used in your environment. Maturity pages will show separate Microsoft 365 / Defender additions without changing the built-in Windows guidance.
        </p>
      </section>

      <section className="settings-panel">
        <label className="radio-row">
          <input type="radio" name="license-base" value="none" checked={baseSelection === 'none'} onChange={() => setBaseSelection('none')} />
          <span>
            <strong>{licenseModes.none.displayName}</strong>
            <small>{licenseModes.none.description}</small>
          </span>
        </label>

        <div className="radio-group">
          <label className="radio-row">
            <input type="radio" name="license-base" value="e3" checked={baseSelection === 'e3'} onChange={() => setBaseSelection('e3')} />
            <span>
              <strong>Microsoft 365 E3</strong>
              <small>Select the Entra ID licence level available alongside Microsoft 365 E3.</small>
            </span>
          </label>

          {baseSelection === 'e3' && (
            <div className="nested-radio-group">
              <label className="radio-row">
                <input type="radio" name="license-mode" value="e3P1" checked={licenseMode === 'e3P1'} onChange={() => setLicenseMode('e3P1')} />
                <span>
                  <strong>{licenseModes.e3P1.shortName}</strong>
                  <small>{licenseModes.e3P1.description}</small>
                </span>
              </label>
              <label className="radio-row">
                <input type="radio" name="license-mode" value="e3P2" checked={licenseMode === 'e3P2'} onChange={() => setLicenseMode('e3P2')} />
                <span>
                  <strong>{licenseModes.e3P2.shortName}</strong>
                  <small>{licenseModes.e3P2.description}</small>
                </span>
              </label>
            </div>
          )}
        </div>

        <label className="radio-row">
          <input type="radio" name="license-base" value="e5" checked={baseSelection === 'e5'} onChange={() => setBaseSelection('e5')} />
          <span>
            <strong>{licenseModes.e5.displayName}</strong>
            <small>{licenseModes.e5.description}</small>
          </span>
        </label>
      </section>

      {licenseMode !== 'none' && (
        <section className="active-summary">
          <h2>Active Additions</h2>
          <p>
            {licenseModes[licenseMode].shortName} is active. {activeCount} additional protection references are available across the eight controls at ML3.
          </p>
        </section>
      )}
    </div>
  );
}
