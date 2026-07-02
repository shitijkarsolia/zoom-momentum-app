import { useEffect, useState } from 'react';
import { MicIcon, MicOffIcon, ShieldIcon, ChevronDownIcon } from './icons';

export interface StageParticipant {
  id: string;
  name: string;
  role: 'host' | 'student';
  isYou: boolean;
  isSpeaking: boolean;
  micOn: boolean;
  reaction: string | null;
}

interface MeetingStageProps {
  title: string;
  participants: StageParticipant[];
  meetingEnded: boolean;
  recording: boolean;
  compact?: boolean;
}

const AVATAR_HUES = [212, 262, 340, 160, 24, 288, 196, 92, 8, 232];

function avatarHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length] ?? 212;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]!.toUpperCase())
    .join('');
}

function useMeetingClock(): string {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function ParticipantTile({ participant }: { participant: StageParticipant }) {
  const hue = avatarHue(participant.name);
  return (
    <div
      className={`zmw-tile ${participant.isSpeaking ? 'zmw-tile--speaking' : ''} ${participant.isYou ? 'zmw-tile--you' : ''}`}
    >
      <div
        className="zmw-avatar"
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 48%, 38%), hsl(${(hue + 40) % 360}, 52%, 26%))`,
        }}
      >
        {initials(participant.name)}
      </div>
      {participant.isSpeaking && (
        <span className="zmw-voice" aria-hidden>
          <i /><i /><i />
        </span>
      )}
      {participant.reaction && (
        <span key={participant.reaction} className="zmw-reaction">{participant.reaction}</span>
      )}
      {participant.isYou && <span className="zmw-you-badge">You</span>}
      <span className="zmw-nameplate">
        <span className={`zmw-mic ${participant.micOn ? '' : 'zmw-mic--off'}`}>
          {participant.micOn ? <MicIcon size={11} /> : <MicOffIcon size={11} />}
        </span>
        {participant.name}
        {participant.role === 'host' ? ' (Host)' : ''}
      </span>
    </div>
  );
}

export function MeetingStage({ title, participants, meetingEnded, recording, compact = false }: MeetingStageProps) {
  const clock = useMeetingClock();

  return (
    <div className={`zmw-stage ${compact ? 'zmw-stage--compact' : ''}`} data-tour="stage">
      <div className="zmw-topbar">
        <div className="zmw-topbar-left">
          <span className="zmw-shield"><ShieldIcon size={15} /></span>
          <span className="zmw-meeting-title">{title}</span>
          {recording && !meetingEnded && (
            <span className="zmw-rec">
              <i className="zmw-rec-dot" /> REC
            </span>
          )}
        </div>
        <div className="zmw-topbar-right">
          <span className="zmw-clock">{clock}</span>
          <span className="zmw-view-btn">
            View <ChevronDownIcon size={12} />
          </span>
        </div>
      </div>

      <div className={`zmw-gallery ${meetingEnded ? 'zmw-gallery--ended' : ''}`}>
        {participants.map(participant => (
          <ParticipantTile key={participant.id} participant={participant} />
        ))}
        {meetingEnded && (
          <div className="zmw-ended-overlay">
            <strong>Class ended</strong>
            <span>Recovery packs sent to every student</span>
          </div>
        )}
      </div>
    </div>
  );
}
