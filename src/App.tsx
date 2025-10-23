import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { IncomingCallScreen } from './components/IncomingCallScreen';
import { ActiveCallScreen } from './components/ActiveCallScreen';

export type CallType = 'blacklist' | 'normal' | null;
export type Screen = 'home' | 'incoming' | 'active';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [callType, setCallType] = useState<CallType>(null);
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(false);
  const [shouldStartRecording, setShouldStartRecording] = useState(false);

  const handleStartCall = (type: CallType) => {
    setCallType(type);
    setCurrentScreen('incoming');
  };

  const handleAnswerCall = (enableRecording: boolean = false) => {
    setIsRecordingEnabled(enableRecording);
    setShouldStartRecording(enableRecording);
    setCurrentScreen('active');
  };

  const handleEndCall = () => {
    setCurrentScreen('home');
    setCallType(null);
    setIsRecordingEnabled(false);
    setShouldStartRecording(false);
  };

  return (
    <div className="min-h-screen max-w-[428px] mx-auto bg-white relative overflow-hidden">
      {currentScreen === 'home' && (
        <HomeScreen onStartCall={handleStartCall} />
      )}
      
      {currentScreen === 'incoming' && callType && (
        <IncomingCallScreen
          callType={callType}
          onAnswer={handleAnswerCall}
          onReject={handleEndCall}
        />
      )}
      
      {currentScreen === 'active' && callType && (
        <ActiveCallScreen
          callType={callType}
          isRecordingEnabled={isRecordingEnabled}
          shouldStartRecording={shouldStartRecording}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
}
