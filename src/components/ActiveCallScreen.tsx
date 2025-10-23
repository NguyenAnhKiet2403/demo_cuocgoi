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

    useEffect(() => {
        if (isBlacklist) setShowFeedbackBanner(true);
    }, [isBlacklist]);

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        if (isRecordingEnabled && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'vi-VN';
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => {
                console.log("Recognition started ✅");
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript);
                    const scamKeywords = ['trúng thưởng', 'lừa đảo', 'đường dây'];
                    const hasScam = scamKeywords.some(k =>
                        finalTranscript.toLowerCase().includes(k)
                    );
                    if (hasScam && !showScamAlert) {
                        setShowScamAlert(true);
                        navigator.vibrate?.([200, 100, 200]);
                    }
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech error ❌:", event.error);
                if (event.error.includes("permission")) {
                    setPermissionError(true);
                    setIsListening(false);
                }
            };

            recognition.onend = () => {
                console.log("Recognition ended");
                setIsListening(false);
                if (isRecordingEnabled && hasStartedRef.current && !permissionError) {
                    setTimeout(() => recognition.start(), 150);
                }
            };

            recognitionRef.current = recognition;

            return () => recognitionRef.current?.stop();
        }
    }, [isRecordingEnabled, permissionError, showScamAlert]);

    // ✅ FIX: Request mic BEFORE recognition.start()
    useEffect(() => {
        if (shouldStartRecording && recognitionRef.current && !hasStartedRef.current) {
            hasStartedRef.current = true;
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    console.log("Mic permission granted ✅");
                    recognitionRef.current.start();
                })
                .catch(err => {
                    console.warn("Mic blocked ❌", err);
                    setPermissionError(true);
                });
        }
    }, [shouldStartRecording]);

    const handleStartRecording = async () => {
        if (!recognitionRef.current) return;
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            recognitionRef.current.start();
            setPermissionError(false);
            hasStartedRef.current = true;
        } catch {
            setPermissionError(true);
        }
    };

    const formatDuration = (sec: number) =>
        `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60)
            .toString().padStart(2, '0')}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col relative">
            {/* Scam Alert */}
            {showScamAlert && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-3xl p-8 w-full shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                            <h2 className="text-gray-900">Cảnh báo lừa đảo!</h2>
                        </div>
                        <button
                            className="w-full bg-red-600 text-white rounded-xl py-3 mt-4"
                            onClick={() => { setShowScamAlert(false); setShowFeedbackBanner(true); }}
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}

            {/* Call Content */}
            <div className="flex-1 flex flex-col items-center justify-between p-6">
                <div className="text-white text-3xl mt-10">{formatDuration(duration)}</div>

                <div className="text-center mt-10">
                    <div className="text-white text-2xl">{isBlacklist ? "0912 345 678" : "0987 654 321"}</div>
                    <div className="text-gray-400">{isBlacklist ? "Số lừa đảo" : "Số lạ"}</div>
                </div>

                {isRecordingEnabled && (
                    <div className="w-full bg-white/10 p-5 rounded-3xl mt-5">
                        {isListening ? (
                            <p className="text-white flex gap-2 items-center">
                                🔴 Đang ghi âm...
                            </p>
                        ) : permissionError ? (
                            <>
                                <p className="text-orange-300">Mic bị chặn ❌</p>
                                <button onClick={handleStartRecording} className="text-white underline mt-2">
                                    Cho phép lại
                                </button>
                            </>
                        ) : (
                            <button onClick={handleStartRecording} className="text-white underline">
                                Bắt đầu ghi âm
                            </button>
                        )}

                        {transcript && (
                            <p className="text-white text-sm mt-4">{transcript}</p>
                        )}
                    </div>
                )}

                <button
                    onClick={onEndCall}
                    className="bg-red-600 rounded-full w-20 h-20 mt-10 flex items-center justify-center"
                >
                    <PhoneOff className="text-white w-10 h-10" />
                </button>
            </div>
        </div>
    );
}
