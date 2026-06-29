// Calendar Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../components/ui/index';
import { useTasks } from '../contexts/TaskContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, parseISO } from 'date-fns';
import { RiArrowLeftLine, RiArrowRightLine, RiCalendarLine } from 'react-icons/ri';

export function Calendar() {
  const { tasks } = useTasks();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startDay = startOfMonth(current).getDay();

  const getTasksForDay = (day) => tasks.filter(t => t.deadline && isSameDay(parseISO(t.deadline), day));
  const selectedTasks = getTasksForDay(selected);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-100" style={{ fontFamily: 'Space Grotesk' }}>Calendar</h1>
        <p className="text-slate-400 text-sm">Your tasks and deadlines at a glance</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100" style={{ fontFamily: 'Space Grotesk' }}>{format(current, 'MMMM yyyy')}</h3>
              <div className="flex gap-2">
                <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  <RiArrowLeftLine />
                </button>
                <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  <RiArrowRightLine />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-xs text-slate-600 font-medium py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}
              {days.map(day => {
                const dayTasks = getTasksForDay(day);
                const sel = isSameDay(day, selected);
                const today = isToday(day);
                return (
                  <button key={day} onClick={() => setSelected(day)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-start p-1 transition-all ${sel ? 'gradient-btn text-white' : today ? 'ring-1 ring-purple-500 text-purple-300' : 'hover:bg-white/5 text-slate-400'}`}>
                    <span className="text-xs font-medium">{format(day, 'd')}</span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayTasks.slice(0, 3).map((t, i) => (
                          <div key={i} className="w-1 h-1 rounded-full"
                               style={{ background: t.priority === 'critical' ? '#ef4444' : t.priority === 'high' ? '#f97316' : '#7c3aed' }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <RiCalendarLine className="text-purple-400" />
              <h3 className="font-semibold text-slate-100 text-sm">{format(selected, 'MMMM d, yyyy')}</h3>
            </div>
            {selectedTasks.length === 0 ? (
              <div className="text-center py-10">
                <RiCalendarLine className="text-slate-700 text-3xl mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No tasks this day</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map(t => (
                  <div key={t._id} className="p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.priority}>{t.priority}</Badge>
                      {t.completed && <Badge variant="green">Done</Badge>}
                    </div>
                    <p className={`text-sm font-medium mt-1 ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{format(parseISO(t.deadline), 'h:mm a')}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
