import { Mic, ShieldCheck } from 'lucide-react';

interface PermissionDialogProps {
  onResponse: (granted: boolean) => void;
}

export function PermissionDialog({ onResponse }: PermissionDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 w-full shadow-2xl">
        {/* Icon */}
        <div className="relative inline-flex mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-30"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
            <Mic className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-gray-900 mb-4">
          Yêu cầu quyền truy cập
        </h2>

        {/* Description */}
        <div className="text-center space-y-4 mb-8">
          <p className="text-gray-700">
            Ứng dụng cần quyền ghi âm để phân tích nội dung cuộc trò chuyện
          </p>
          <div className="flex items-center gap-3 justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
            <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <span className="text-blue-900">Giúp phát hiện cuộc gọi lừa đảo</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => onResponse(true)}
            className="w-full min-h-[56px] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl transition-all duration-200 active:scale-98 shadow-lg"
          >
            Cho phép
          </button>
          <button
            onClick={() => onResponse(false)}
            className="w-full min-h-[56px] bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl transition-all duration-200 active:scale-98"
          >
            Không cho phép
          </button>
        </div>
      </div>
    </div>
  );
}
