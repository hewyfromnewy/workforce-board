import { Calendar, Settings, Send } from 'lucide-react';
import { format as formatDate } from 'date-fns';

interface RosterHeaderProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onManageClick: () => void;
  onExportClick: () => void;
}

export function RosterHeader({ date, onDateChange, onManageClick, onExportClick }: RosterHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Daily Roster Board</h1>
            <p className="text-sm text-gray-500">NSW Council Workforce Management</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <Calendar className="w-4 h-4 text-gray-600" />
            <input
              type="date"
              value={formatDate(date, 'yyyy-MM-dd')}
              onChange={(e) => onDateChange(new Date(e.target.value))}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 cursor-pointer"
            />
          </div>

          <button
            onClick={onManageClick}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Manage</span>
          </button>

          <button
            onClick={onExportClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </header>
  );
}