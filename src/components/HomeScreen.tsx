import { Phone, AlertTriangle, Shield } from 'lucide-react';
import type { CallType } from '../App';

interface HomeScreenProps {
  onStartCall: (type: CallType) => void;
}

export function HomeScreen({ onStartCall }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col p-6">
      {/* Header */}
      <div className="pt-12 pb-8 text-center space-y-4">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-30"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-gray-900 mb-2">
            Bảo Vệ Cuộc Gọi
          </h1>
          <p className="text-gray-600">
            Chọn loại cuộc gọi để xem demo
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center space-y-5">
        {/* Blacklist Call Button */}
        <button
          onClick={() => onStartCall('blacklist')}
          className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 rounded-3xl p-6 transition-all duration-300 active:scale-98 shadow-lg hover:shadow-xl min-h-[100px]"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-red-500 rounded-2xl blur-md opacity-40"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-left flex-1">
              <div className="text-gray-900 mb-1">
                Cuộc gọi trong blacklist
              </div>
              <div className="text-gray-600 text-sm">
                Số lừa đảo đã biết
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        </button>

        {/* Normal Call Button */}
        <button
          onClick={() => onStartCall('normal')}
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-200 rounded-3xl p-6 transition-all duration-300 active:scale-98 shadow-lg hover:shadow-xl min-h-[100px]"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-md opacity-40"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-left flex-1">
              <div className="text-gray-900 mb-1">
                Cuộc gọi tới bình thường
              </div>
              <div className="text-gray-600 text-sm">
                Số điện thoại chưa xác định
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        </button>
      </div>

      {/* Info Footer */}
      <div className="pt-8 pb-6">
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-gray-700 text-sm">
            Ứng dụng sẽ giúp bạn phát hiện cuộc gọi lừa đảo
          </p>
        </div>
      </div>
    </div>
  );
}
