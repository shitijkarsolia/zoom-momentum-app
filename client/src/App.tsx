import { useCallback, useRef, useEffect } from 'react';
import { useZoomSdk } from './hooks/useZoomSdk';
import { useZoomAuth } from './hooks/useZoomAuth';
import { useMessaging } from './hooks/useMessaging';
import { usePulseHost, usePulseStudent } from './hooks/usePulse';
import { useArenaHost, useArenaStudent } from './hooks/useArena';
import { AuthView } from './views/AuthView';
import { HostDashboard } from './views/HostDashboard';
import { StudentView } from './views/StudentView';
import type { AppMessage, Poll, LeaderboardEntry } from './types/messages';

export default function App() {
  const zoom = useZoomSdk();
  const auth = useZoomAuth();

  const messageRouterRef = useRef<(msg: AppMessage) => void>(() => {});

  const handleMessage = useCallback((message: AppMessage) => {
    messageRouterRef.current(message);
  }, []);

  const messaging = useMessaging({
    isHost: zoom.isHost,
    participantId: zoom.participantId,
    onMessage: handleMessage,
  });

  const pulseHost = usePulseHost({ broadcast: messaging.broadcast });
  const pulseStudent = usePulseStudent({ send: messaging.send });
  const arenaHost = useArenaHost({ broadcast: messaging.broadcast });
  const arenaStudent = useArenaStudent({ send: messaging.send, participantName: zoom.userName });

  useEffect(() => {
    messageRouterRef.current = (message: AppMessage) => {
      if (zoom.isHost) {
        if (message.type === 'POLL_RESPONSE') {
          const payload = message.payload as { pollId: string; optionIndex: number };
          pulseHost.handleResponse(message.senderId, payload.optionIndex);
        } else if (message.type === 'ARENA_ANSWER') {
          const payload = message.payload as { optionIndex: number; name: string };
          arenaHost.handleAnswer(message.senderId, payload.name, payload.optionIndex);
        }
      } else {
        if (message.type === 'POLL_START') {
          pulseStudent.handlePollStart(message.payload as Poll);
        } else if (message.type === 'POLL_RESULTS') {
          pulseStudent.handlePollResults(message.payload as Poll);
        } else if (message.type === 'ARENA_START') {
          arenaStudent.handleArenaStart();
        } else if (message.type === 'ARENA_QUESTION') {
          arenaStudent.handleQuestion(message.payload as {
            index: number; total: number; question: string; options: string[]; timeLimitSec: number;
          });
        } else if (message.type === 'ARENA_LEADERBOARD') {
          arenaStudent.handleLeaderboard(message.payload as {
            leaderboard: LeaderboardEntry[]; correctIndex: number; explanation: string;
          });
        } else if (message.type === 'ARENA_END') {
          arenaStudent.handleArenaEnd(message.payload as { leaderboard: LeaderboardEntry[] });
        }
      }
      console.log('[App] received message:', message.type, message);
    };
  }, [
    zoom.isHost,
    pulseHost.handleResponse,
    pulseStudent.handlePollStart,
    pulseStudent.handlePollResults,
    arenaHost.handleAnswer,
    arenaStudent.handleArenaStart,
    arenaStudent.handleQuestion,
    arenaStudent.handleLeaderboard,
    arenaStudent.handleArenaEnd,
  ]);

  if (!zoom.isConfigured && !zoom.error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading">Initializing Zoom SDK…</div>
      </div>
    );
  }

  if (zoom.error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ color: 'var(--zoom-error)' }}>SDK Error: {zoom.error}</p>
          <p style={{ color: 'var(--zoom-text-secondary)', fontSize: 12, marginTop: 8 }}>
            Make sure you're running this inside a Zoom meeting.
          </p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <AuthView onLogin={auth.login} isLoading={auth.isLoading} error={auth.error} />;
  }

  if (zoom.isHost) {
    return (
      <HostDashboard
        userName={zoom.userName}
        connected={messaging.connected}
        pulsePhase={pulseHost.phase}
        pulseDraft={pulseHost.draft}
        pulseResponseCount={pulseHost.responseCount}
        pulseActivePoll={pulseHost.activePoll}
        pulseError={pulseHost.error}
        onPulseGenerate={pulseHost.generatePoll}
        onPulseUpdateDraft={pulseHost.updateDraft}
        onPulseLaunch={pulseHost.launchPoll}
        onPulseEndPoll={pulseHost.endPoll}
        onPulseReset={pulseHost.resetPoll}
        arenaPhase={arenaHost.phase}
        arenaCurrentQuestion={arenaHost.currentQuestion}
        arenaCurrentIndex={arenaHost.currentIndex}
        arenaTotalQuestions={arenaHost.totalQuestions}
        arenaResponseCount={arenaHost.responseCount}
        arenaCountdown={arenaHost.countdown}
        arenaLeaderboard={arenaHost.leaderboard}
        arenaError={arenaHost.error}
        onArenaFetchQuestions={arenaHost.fetchQuestions}
        onArenaStartGame={arenaHost.startGame}
        onArenaShowLeaderboard={arenaHost.showLeaderboard}
        onArenaNextQuestion={arenaHost.nextQuestion}
        onArenaReset={arenaHost.resetArena}
      />
    );
  }

  return (
    <StudentView
      userName={zoom.userName}
      connected={messaging.connected}
      activePoll={pulseStudent.activePoll}
      selectedOption={pulseStudent.selectedOption}
      hasAnswered={pulseStudent.hasAnswered}
      pollResults={pulseStudent.results}
      onSelectOption={pulseStudent.selectOption}
      onSubmitAnswer={pulseStudent.submitAnswer}
      arenaPhase={arenaStudent.phase}
      arenaCurrentQuestion={arenaStudent.currentQuestion}
      arenaSelectedOption={arenaStudent.selectedOption}
      arenaCountdown={arenaStudent.countdown}
      arenaLeaderboard={arenaStudent.leaderboard}
      arenaCorrectIndex={arenaStudent.correctIndex}
      arenaExplanation={arenaStudent.explanation}
      arenaFinalLeaderboard={arenaStudent.finalLeaderboard}
      onArenaSelectAndSubmit={arenaStudent.selectAndSubmit}
    />
  );
}
