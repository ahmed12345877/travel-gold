/**
 * Content Calendar for Tourism Marketing
 * Visual calendar to plan and schedule marketing content
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  ArrowLeft,
  Clock,
  Edit2,
  Trash2,
  Instagram,
  Mail,
  FileText,
  PenTool,
  Megaphone,
} from "lucide-react";

/* ─── Types ─── */
interface CalendarEntry {
  id: number;
  title: string;
  description: string | null;
  contentType: string;
  platform: string | null;
  status: string;
  scheduledDate: number;
  colorTag: string;
}

/* ─── Constants ─── */
const CONTENT_TYPES = [
  {
    value: "social_media",
    label: "Social Media",
    icon: Instagram,
    color: "#E1306C",
  },
  { value: "email", label: "Email", icon: Mail, color: "#D4A853" },
  {
    value: "trip_description",
    label: "Trip Description",
    icon: FileText,
    color: "#4ECDC4",
  },
  { value: "blog_seo", label: "Blog/SEO", icon: PenTool, color: "#FF6B6B" },
  { value: "ad_copy", label: "Ad Copy", icon: Megaphone, color: "#45B7D1" },
];

const STATUSES = [
  { value: "planned", label: "Planned", color: "#6b7280" },
  { value: "in_progress", label: "In Progress", color: "#D4A853" },
  { value: "completed", label: "Completed", color: "#4ade80" },
  { value: "published", label: "Published", color: "#3b82f6" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ─── Helper ─── */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/* ─── Add/Edit Modal ─── */
function EntryModal({
  entry,
  selectedDate,
  onClose,
  onSave,
  isLoading,
}: {
  entry?: CalendarEntry;
  selectedDate: number;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(entry?.title || "");
  const [description, setDescription] = useState(entry?.description || "");
  const [contentType, setContentType] = useState(
    entry?.contentType || "social_media",
  );
  const [platform, setPlatform] = useState(entry?.platform || "");
  const [status, setStatus] = useState(entry?.status || "planned");
  const [colorTag, setColorTag] = useState(entry?.colorTag || "#D4A853");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSave({
      ...(entry ? { id: entry.id } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      contentType,
      platform: platform || undefined,
      status,
      scheduledDate: selectedDate,
      colorTag,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">
            {entry ? "Edit Entry" : "New Calendar Entry"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Instagram post about Luxor"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                focus:border-[var(--theme-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the content..."
              rows={2}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                focus:border-[var(--theme-primary)] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                  focus:border-[var(--theme-primary)] focus:outline-none"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                  focus:border-[var(--theme-primary)] focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Platform (Optional)
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g., Instagram, Facebook, Google Ads"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm
                focus:border-[var(--theme-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Color Tag
            </label>
            <div className="flex gap-2">
              {[
                "#D4A853",
                "#E1306C",
                "#4ECDC4",
                "#FF6B6B",
                "#45B7D1",
                "#96CEB4",
                "#6b7280",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorTag(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    colorTag === c
                      ? "border-white scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8922D] text-black font-bold rounded-lg
              hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all disabled:opacity-50"
          >
            {isLoading
              ? "Saving..."
              : entry
                ? "Update Entry"
                : "Add to Calendar"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function ContentCalendar() {
  const { isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number>(Date.now());
  const [editEntry, setEditEntry] = useState<CalendarEntry | undefined>();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar entries for current month
  const startOfMonth = new Date(year, month, 1).getTime();
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).getTime();

  const entriesQuery = trpc.marketing.listCalendar.useQuery(
    { startDate: startOfMonth, endDate: endOfMonth },
    { enabled: isAuthenticated },
  );

  const addMutation = trpc.marketing.addCalendarEntry.useMutation({
    onSuccess: () => {
      toast.success("Entry added!");
      setShowModal(false);
      setEditEntry(undefined);
      entriesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.marketing.updateCalendarEntry.useMutation({
    onSuccess: () => {
      toast.success("Entry updated!");
      setShowModal(false);
      setEditEntry(undefined);
      entriesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.marketing.deleteCalendarEntry.useMutation({
    onSuccess: () => {
      toast.success("Entry deleted!");
      entriesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const entries = entriesQuery.data || [];

  // Build calendar grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
    // Previous month padding
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }
    return days;
  }, [year, month, daysInMonth, firstDay]);

  const getEntriesForDay = (date: Date) => {
    const dayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();
    const dayEnd = dayStart + 86400000;
    return entries.filter(
      (e: any) => e.scheduledDate >= dayStart && e.scheduledDate < dayEnd,
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date.getTime());
    setEditEntry(undefined);
    setShowModal(true);
  };

  const handleEditEntry = (entry: CalendarEntry) => {
    setSelectedDate(entry.scheduledDate);
    setEditEntry(entry as CalendarEntry);
    setShowModal(true);
  };

  const handleSave = (data: any) => {
    if (data.id) {
      updateMutation.mutate(data);
    } else {
      addMutation.mutate(data);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-400 mb-8">
            Please login to use the Content Calendar.
          </p>
          <a
            href={getLoginUrl()}
            className="px-8 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8922D] text-black font-bold rounded-lg"
          >
            Login Now
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back link */}
          <Link href="/marketing">
            <button className="flex items-center gap-2 text-gray-400 hover:text-[var(--theme-primary)] transition-colors mb-6 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Marketing Suite
            </button>
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-[var(--theme-primary)]" />
                <span className="text-[var(--theme-primary)] text-sm tracking-[0.3em] uppercase font-light">
                  Content Calendar
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                Plan Your Content
              </h1>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={goToday}
                className="px-3 py-1.5 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]/30 transition-colors"
              >
                Today
              </button>
              <button
                onClick={prevMonth}
                className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-[var(--theme-primary)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white font-semibold text-lg min-w-[180px] text-center">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-[var(--theme-primary)] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            {CONTENT_TYPES.map((t) => (
              <div
                key={t.value}
                className="flex items-center gap-1.5 text-xs text-gray-400"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                {t.label}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[#2a2a2a]">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((cell, i) => {
                const dayEntries = cell.isCurrentMonth
                  ? getEntriesForDay(cell.date)
                  : [];
                const today = isToday(cell.date);

                return (
                  <div
                    key={i}
                    onClick={() =>
                      cell.isCurrentMonth && handleDayClick(cell.date)
                    }
                    className={`min-h-[100px] md:min-h-[120px] p-1.5 border-b border-r border-[#1a1a1a] cursor-pointer
                      transition-colors ${
                        cell.isCurrentMonth
                          ? "hover:bg-[#1a1a1a]"
                          : "opacity-30 cursor-default"
                      } ${today ? "bg-[var(--theme-primary)]/5" : ""}`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        today
                          ? "text-[var(--theme-primary)] font-bold"
                          : cell.isCurrentMonth
                            ? "text-gray-300"
                            : "text-gray-600"
                      }`}
                    >
                      {cell.day}
                    </div>

                    {/* Entries */}
                    <div className="space-y-0.5">
                      {dayEntries.slice(0, 3).map((entry: any) => {
                        const typeConfig = CONTENT_TYPES.find(
                          (t) => t.value === entry.contentType,
                        );
                        return (
                          <div
                            key={entry.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEntry(entry);
                            }}
                            className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: `${entry.colorTag || typeConfig?.color || "#D4A853"}20`,
                              color:
                                entry.colorTag ||
                                typeConfig?.color ||
                                "#D4A853",
                              borderLeft: `2px solid ${entry.colorTag || typeConfig?.color || "#D4A853"}`,
                            }}
                            title={entry.title}
                          >
                            {entry.title}
                          </div>
                        );
                      })}
                      {dayEntries.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayEntries.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming entries list (mobile-friendly) */}
          <div className="mt-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--theme-primary)]" />
              This Month's Schedule ({entries.length} items)
            </h3>
            {entries.length === 0 ? (
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-8 text-center">
                <CalendarIcon className="w-10 h-10 text-[var(--theme-primary)]/30 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  No content scheduled this month. Click on a day to add an
                  entry.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries
                  .sort((a: any, b: any) => a.scheduledDate - b.scheduledDate)
                  .map((entry: any) => {
                    const typeConfig = CONTENT_TYPES.find(
                      (t) => t.value === entry.contentType,
                    );
                    const statusConfig = STATUSES.find(
                      (s) => s.value === entry.status,
                    );
                    const Icon = typeConfig?.icon || CalendarIcon;
                    return (
                      <div
                        key={entry.id}
                        className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-3 flex items-center gap-3 hover:border-[var(--theme-primary)]/20 transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${typeConfig?.color || "#D4A853"}15`,
                          }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: typeConfig?.color || "#D4A853" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">
                            {entry.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>
                              {new Date(
                                entry.scheduledDate,
                              ).toLocaleDateString()}
                            </span>
                            {entry.platform && (
                              <span className="px-1.5 py-0.5 rounded bg-[#1a1a1a]">
                                {entry.platform}
                              </span>
                            )}
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${statusConfig?.color}20`,
                                color: statusConfig?.color,
                              }}
                            >
                              {statusConfig?.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="p-1.5 rounded text-gray-500 hover:text-[var(--theme-primary)] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this entry?")) {
                                deleteMutation.mutate({ id: entry.id });
                              }
                            }}
                            className="p-1.5 rounded text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <EntryModal
            entry={editEntry}
            selectedDate={selectedDate}
            onClose={() => {
              setShowModal(false);
              setEditEntry(undefined);
            }}
            onSave={handleSave}
            isLoading={addMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
