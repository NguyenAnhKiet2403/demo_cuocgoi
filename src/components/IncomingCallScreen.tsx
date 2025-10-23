import { useEffect, useState } from 'react';
import { Phone, PhoneOff, AlertTriangle, Volume2 } from 'lucide-react';
import type { CallType } from '../App';
import { PermissionDialog } from './PermissionDialog';

interface IncomingCallScreenProps {
  callType: CallType;
  onAnswer: (enableRecording: boolean) => void;
  onReject: () => void;
}

export function IncomingCallScreen({ callType, onAnswer, onReject }: IncomingCallScreenProps) {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const isBlacklist = callType === 'blacklist';

  useEffect(() => {
    if (isBlacklist) {
      // Play warning sound using Web Speech API
      const utterance = new SpeechSynthesisUtterance('cuộc gọi lừa đảo');
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Repeat the warning
      const speakWarning = () => {
        window.speechSynthesis.speak(utterance);
      };
      
      speakWarning();
      const interval = setInterval(speakWarning, 3000);

      return () => {
        clearInterval(interval);
        window.speechSynthesis.cancel();
      };
    }
  }, [isBlacklist]);

  const handleAnswer = () => {
    window.speechSynthesis.cancel();
    if (callType === 'normal') {
      setShowPermissionDialog(true);
    } else {
      onAnswer(false);
    }
  };

  const handlePermissionResponse = (granted: boolean) => {
    setShowPermissionDialog(false);
    onAnswer(granted);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-6 ${
      isBlacklist 
        ? 'bg-gradient-to-b from-red-500 via-red-400 to-red-300' 
        : 'bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-300'
    }`}>
      {/* Top Section */}
      <div className="w-full pt-12 pb-8">
        {/* Warning Badge (for blacklist) */}
        {isBlacklist && (
          <div className="bg-white/95 backdrop-blur-sm text-gray-900 p-5 rounded-3xl shadow-2xl mb-6 animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="mb-1">
                  CẢNH BÁO LỪA ĐẢO
                </div>
              </div>
              <Volume2 className="w-7 h-7 text-red-500 flex-shrink-0" />
            </div>
            <p className="text-gray-600 text-sm pl-15">
              Số điện thoại này đã được báo cáo lừa đảo
            </p>
          </div>
        )}
      </div>

      {/* Middle Section - Caller */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Avatar with rings */}
        <div className="relative">
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-40 h-40 bg-white/20 rounded-full animate-ping"></div>
            <div className="absolute w-56 h-56 bg-white/10 rounded-full animate-pulse"></div>
          </div>
          
          {/* Main avatar */}
          <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center ${
              isBlacklist ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            }`}>
              <Phone className="w-14 h-14 text-white" />
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="text-center space-y-2">
          <div className="text-white text-3xl tracking-wide">
            {isBlacklist ? '0912 345 678' : '0987 654 321'}
          </div>
          <div className="text-white/90">
            {isBlacklist ? 'Số lừa đảo' : 'Số lạ'}
          </div>
        </div>

        {/* Status */}
        <div className="text-white/80">
          Cuộc gọi đến...
        </div>
      </div>

      {/* Bottom Section - Action Buttons */}
      <div className="w-full pb-8">
        <div className="flex justify-center items-center gap-20">
          {/* Reject Button */}
          <button
            onClick={onReject}
            className="group relative"
          >
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-40 group-active:opacity-60 transition-opacity"></div>
            <div className="relative w-20 h-20 bg-white hover:bg-gray-100 rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-90 shadow-2xl">
              <PhoneOff className="w-9 h-9 text-red-500" />
            </div>
            <div className="text-white text-center mt-3 text-sm">Từ chối</div>
          </button>

          {/* Answer Button */}
          <button
            onClick={handleAnswer}
            className="group relative"
          >
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-40 group-active:opacity-60 transition-opacity"></div>
            <div className="relative w-20 h-20 bg-white hover:bg-gray-100 rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-90 shadow-2xl">
              <Phone className="w-9 h-9 text-green-500" />
            </div>
            <div className="text-white text-center mt-3 text-sm">Nghe máy</div>
          </button>
        </div>
      </div>

      {/* Permission Dialog */}
      {showPermissionDialog && (
        <PermissionDialog onResponse={handlePermissionResponse} />
      )}
    </div>
  );
}
