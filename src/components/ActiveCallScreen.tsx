import { useEffect, useState, useRef } from 'react';
import { PhoneOff, AlertTriangle, X, Mic, MicOff } from 'lucide-react';
import type { CallType } from '../App';

interface ActiveCallScreenProps {
  callType: CallType;
  isRecordingEnabled: boolean;
  shouldStartRecording: boolean;
  onEndCall: () => void;
}

export function ActiveCallScreen({ callType, isRecordingEnabled, shouldStartRecording, onEndCall }: ActiveCallScreenProps) {
  const [duration, setDuration] = useState(0);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [showScamAlert, setShowScamAlert] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const recognitionRef = useRef<any>(null);
  const hasStartedRef = useRef(false);

  const isBlacklist = callType === 'blacklist';

  // Show feedback banner for blacklist calls
  useEffect(() => {
    if (isBlacklist) {
      setShowFeedbackBanner(true);
    }
  }, [isBlacklist]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (isRecordingEnabled && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setPermissionError(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          
          // Check for scam keywords
          const lowerTranscript = finalTranscript.toLowerCase();
          const scamKeywords = ['trúng thưởng', 'lừa đảo', 'đường dây'];
          const hasScamKeyword = scamKeywords.some(keyword => 
            lowerTranscript.includes(keyword)
          );

          if (hasScamKeyword && !showScamAlert) {
            setShowScamAlert(true);
            // Vibrate if available
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionError(true);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        // Auto restart if still recording enabled and no permission error
        if (isRecordingEnabled && !permissionError && hasStartedRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.error('Failed to restart recognition:', e);
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;

      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error('Error stopping recognition:', e);
          }
        }
      };
    }
  }, [isRecordingEnabled, permissionError, showScamAlert]);

  // Start recording when shouldStartRecording becomes true
  useEffect(() => {
    if (shouldStartRecording && recognitionRef.current && !hasStartedRef.current) {
      hasStartedRef.current = true;
      console.log('Starting speech recognition...');
      
      // Small delay to ensure we're in a user interaction context
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to start recognition:', e);
          setPermissionError(true);
        }
      }, 100);
    }
  }, [shouldStartRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCloseFeedbackBanner = () => {
    setShowFeedbackBanner(false);
  };

  const handleFeedbackResponse = (isScam: boolean) => {
    setShowFeedbackBanner(false);
    // In a real app, this would send feedback to the server
  };

  const handleCloseScamAlert = () => {
    setShowScamAlert(false);
    setShowFeedbackBanner(true);
  };

  const handleStartRecording = () => {
    if (recognitionRef.current && !isListening) {
      hasStartedRef.current = true;
      setPermissionError(false);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setPermissionError(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col relative">
      {/* Scam Alert Dialog */}
      {showScamAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 mb-2">
                  CẢNH BÁO LỪA ĐẢO!
                </h2>
                <p className="text-gray-600">
                  Phát hiện từ khóa đáng ngờ trong cuộc trò chuyện
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-6">
              <p className="text-red-700 text-sm mb-1">Từ khóa phát hiện:</p>
              <p className="text-gray-900">"{transcript.split(' ').slice(-10).join(' ')}"</p>
            </div>

            <button
              onClick={handleCloseScamAlert}
              className="w-full min-h-[56px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-200 active:scale-98 shadow-lg"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {showFeedbackBanner && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 shadow-2xl z-40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="flex-1">
              Đây có phải là cuộc gọi lừa đảo không?
            </span>
            <button
              onClick={handleCloseFeedbackBanner}
              className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleFeedbackResponse(true)}
              className="flex-1 min-h-[52px] bg-white text-orange-600 rounded-xl transition-all duration-200 active:scale-98 shadow-lg"
            >
              Có
            </button>
            <button
              onClick={() => handleFeedbackResponse(false)}
              className="flex-1 min-h-[52px] bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 active:scale-98"
            >
              Không
            </button>
          </div>
        </div>
      )}

      {/* Call Screen Content */}
      <div className="flex-1 flex flex-col items-center justify-between p-6 pt-12">
        {/* Top Section */}
        <div className="w-full space-y-6 text-center" style={{ marginTop: showFeedbackBanner ? '140px' : '0' }}>
          {/* Status */}
          <div>
            <div className="text-gray-400 mb-2">
              Đang gọi...
            </div>
            <div className="text-white text-3xl tracking-wider">
              {formatDuration(duration)}
            </div>
          </div>
        </div>

        {/* Middle Section - Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-2xl opacity-30"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-600">
              <span className="text-5xl">👤</span>
            </div>
          </div>

          {/* Phone Number */}
          <div className="text-center">
            <div className="text-white text-2xl mb-1 tracking-wide">
              {isBlacklist ? '0912 345 678' : '0987 654 321'}
            </div>
            <div className="text-gray-400">
              {isBlacklist ? 'Số lừa đảo' : 'Số lạ'}
            </div>
          </div>

          {/* Recording Indicator */}
          {isRecordingEnabled && (
            <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                {isListening ? (
                  <>
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center animate-pulse">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white flex-1">
                      Đang ghi âm...
                    </span>
                  </>
                ) : permissionError ? (
                  <>
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                      <MicOff className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-orange-200 block mb-2">
                        Quyền mic bị từ chối
                      </span>
                      <button
                        onClick={handleStartRecording}
                        className="text-xs bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        Thử lại
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-blue-200 block mb-2">
                        Sẵn sàng ghi âm
                      </span>
                      <button
                        onClick={handleStartRecording}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        Bắt đầu
                      </button>
                    </div>
                  </>
                )}
              </div>
              {transcript && (
                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                  <div className="text-gray-400 text-xs mb-2">Nội dung:</div>
                  <div className="text-white max-h-24 overflow-y-auto">
                    {transcript}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section - End Call Button */}
        <div className="w-full pb-4">
          <div className="flex justify-center">
            <button
              onClick={onEndCall}
              className="group relative"
            >
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-40 group-active:opacity-60 transition-opacity"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-90 shadow-2xl">
                <PhoneOff className="w-9 h-9 text-white" />
              </div>
              <div className="text-white text-center mt-3 text-sm">Kết thúc</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
