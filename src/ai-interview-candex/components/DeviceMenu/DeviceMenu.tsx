import { useEffect, useState } from 'react';
import classnames from 'classnames';
import { mdiCheck, mdiMicrophone, mdiVideo, mdiVolumeHigh } from '@mdi/js';
import { i18nUtils } from '@i18n';
import styles from './deviceMenu.module.scss';

const ICON_SIZE = 16;

function SvgIcon({ path, size = ICON_SIZE, color = 'currentColor' }: { path: string; size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

interface DeviceEntry {
  deviceId: string;
  label: string;
}

function useDevices(kinds: string[]) {
  const [devices, setDevices] = useState<Record<string, DeviceEntry[]>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        const result: Record<string, DeviceEntry[]> = {};
        for (const kind of kinds) {
          result[kind] = all
            .filter(d => d.kind === kind)
            .map((d, i) => ({
              deviceId: d.deviceId,
              label: d.label || `${kind} ${i + 1}`,
            }));
        }
        setDevices(result);
      } catch {
        // Permissions not granted
      }
    }
    load();
    return () => { cancelled = true; };
  }, [kinds.join(',')]);

  return devices;
}

function DeviceSection({
  title,
  devices,
  selectedId,
  onSelect,
  testLabel,
  testIcon,
  emptyLabel,
}: {
  title: string;
  devices: DeviceEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
  testLabel: string;
  testIcon: string;
  emptyLabel: string;
}) {
  return (
    <div className={styles.deviceMenuSection}>
      <div className={styles.deviceMenuSectionHeader}>
        <span className={styles.deviceMenuSectionTitle}>{title}</span>
      </div>
      <div className={styles.deviceMenuItems}>
        {devices.length === 0 && (
          <div className={styles.deviceMenuItem}>
            <span>{emptyLabel}</span>
          </div>
        )}
        {devices.map(d => (
          <div
            key={d.deviceId}
            className={classnames(styles.deviceMenuItem, {
              [styles.deviceMenuItemSelected]: selectedId === d.deviceId,
            })}
            onClick={() => onSelect(d.deviceId)}
          >
            <span>{d.label}</span>
            {selectedId === d.deviceId && <SvgIcon path={mdiCheck} size={16} color="#1B5143" />}
          </div>
        ))}
      </div>
      <button className={styles.deviceMenuTestBtn}>
        <SvgIcon path={testIcon} size={16} />
        <span>{testLabel}</span>
      </button>
    </div>
  );
}

const AUDIO_KINDS = ['audioinput', 'audiooutput'];
const VIDEO_KINDS = ['videoinput'];

interface DeviceMenuProps {
  type?: 'audio' | 'video';
}

export default function DeviceMenu({ type = 'audio' }: DeviceMenuProps) {
  const kinds = type === 'video' ? VIDEO_KINDS : AUDIO_KINDS;
  const devices = useDevices(kinds);

  const [selectedMic, setSelectedMic] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');

  const mics = devices['audioinput'] ?? [];
  const speakers = devices['audiooutput'] ?? [];
  const cameras = devices['videoinput'] ?? [];

  useEffect(() => {
    if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId);
  }, [mics, selectedMic]);

  useEffect(() => {
    if (speakers.length > 0 && !selectedSpeaker) setSelectedSpeaker(speakers[0].deviceId);
  }, [speakers, selectedSpeaker]);

  useEffect(() => {
    if (cameras.length > 0 && !selectedCamera) setSelectedCamera(cameras[0].deviceId);
  }, [cameras, selectedCamera]);

  if (type === 'video') {
    return (
      <div className={styles.deviceMenu}>
        <DeviceSection
          title={i18nUtils.gettext('Camera')}
          devices={cameras}
          selectedId={selectedCamera}
          onSelect={setSelectedCamera}
          testLabel={i18nUtils.gettext('Test camera')}
          testIcon={mdiVideo}
          emptyLabel={i18nUtils.gettext('No cameras found')}
        />
      </div>
    );
  }

  return (
    <div className={styles.deviceMenu}>
      <DeviceSection
        title={i18nUtils.gettext('Microphone')}
        devices={mics}
        selectedId={selectedMic}
        onSelect={setSelectedMic}
        testLabel={i18nUtils.gettext('Test microphone')}
        testIcon={mdiMicrophone}
        emptyLabel={i18nUtils.gettext('No microphones found')}
      />
      <div className={styles.deviceMenuDivider} />
      <DeviceSection
        title={i18nUtils.gettext('Speaker')}
        devices={speakers}
        selectedId={selectedSpeaker}
        onSelect={setSelectedSpeaker}
        testLabel={i18nUtils.gettext('Test speakers')}
        testIcon={mdiVolumeHigh}
        emptyLabel={i18nUtils.gettext('No speakers found')}
      />
    </div>
  );
}
