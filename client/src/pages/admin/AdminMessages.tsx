import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import {
  MessageSquare,
  Search,
  Eye,
  Mail,
  Phone,
  User,
  Calendar,
  X,
  CheckCircle,
  Archive,
  BookOpen,
  AlertCircle,
  Briefcase,
} from "lucide-react";

const statusColors: Record<string, string> = {
  new: "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-white/10",
  read: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  replied: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const statusIcons: Record<string, React.ElementType> = {
  new: AlertCircle,
  read: BookOpen,
  replied: CheckCircle,
  archived: Archive,
};

function StatusBadge({ status }: { status: string }) {
  const Icon = statusIcons[status] || AlertCircle;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-[var(--font-body)] font-medium border ${statusColors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
    >
      <Icon size={10} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminMessages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.contact.listAll.useQuery({
    limit: 100,
    offset: 0,
  });

  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      utils.contact.listAll.invalidate();
      toast.success("Message status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredMessages = messages?.filter((m: any) => {
    const matchesSearch =
      !searchTerm ||
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleOpenMessage = (message: any) => {
    setSelectedMessage(message);
    // Auto-mark as read if new
    if (message.status === "new") {
      updateStatusMutation.mutate({ id: message.id, status: "read" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--theme-primary)]/10 rounded" />
        <div className="h-12 bg-[var(--theme-surface)] rounded-lg border border-white/5" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[var(--theme-surface)] rounded-lg border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-white">
          Messages
        </h1>
        <p className="text-white/50 text-sm font-[var(--font-body)] mt-1">
          View and manage customer contact messages
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]/50" />
          <input
            type="text"
            placeholder="Search by name, email, subject, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--theme-surface)] border border-white/10 text-white placeholder-[var(--theme-primary-light)]/30 pl-10 pr-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["all", "new", "read", "replied", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 text-xs font-[var(--font-body)] font-medium rounded-lg border transition-all ${
                filterStatus === status
                  ? "bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/40 text-[var(--theme-primary)]"
                  : "bg-[var(--theme-surface)] border-white/5 text-white/50 hover:border-[var(--theme-primary)]/30"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {filteredMessages && filteredMessages.length > 0 ? (
          filteredMessages.map((message: any) => (
            <div
              key={message.id}
              onClick={() => handleOpenMessage(message)}
              className={`bg-[var(--theme-surface)] border rounded-lg p-4 cursor-pointer hover:border-[var(--theme-primary)]/30 transition-all ${
                message.status === "new"
                  ? "border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/[0.02]"
                  : "border-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      message.status === "new"
                        ? "bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30"
                        : "bg-[var(--theme-surface)] border border-white/5"
                    }`}
                  >
                    <User
                      size={16}
                      className={message.status === "new" ? "text-[var(--theme-primary)]" : "text-white/40"}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`font-[var(--font-body)] text-sm ${
                          message.status === "new"
                            ? "text-white font-semibold"
                            : "text-white/80 font-medium"
                        }`}
                      >
                        {message.name}
                      </p>
                      {message.subject && (
                        <span className="text-white/30 text-xs flex items-center gap-1">
                          <Briefcase size={10} /> {message.subject}
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs font-[var(--font-body)] flex items-center gap-1 mb-1.5">
                      <Mail size={10} /> {message.email}
                    </p>
                    <p className="text-white/60 text-sm font-[var(--font-body)] line-clamp-1">
                      {message.message}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={message.status} />
                  <span className="text-white/30 text-xs font-[var(--font-body)]">
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-12 text-center">
            <MessageSquare size={40} className="text-[var(--theme-primary)]/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-[var(--font-body)]">
              {searchTerm || filterStatus !== "all"
                ? "No messages match your filters"
                : "No messages yet"}
            </p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMessage(null);
          }}
        >
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[var(--theme-surface)] z-10">
              <div>
                <h3 className="text-white font-[var(--font-display)] text-lg font-semibold">
                  Message Details
                </h3>
                <p className="text-white/40 text-xs font-[var(--font-body)] mt-0.5">
                  From {selectedMessage.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Sender Info */}
              <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
                <h4 className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
                  Sender Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs">Name</p>
                    <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                      <User size={12} className="text-[var(--theme-primary)]" />
                      {selectedMessage.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Email</p>
                    <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                      <Mail size={12} className="text-[var(--theme-primary)]" />
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="hover:text-[var(--theme-primary)] transition-colors"
                      >
                        {selectedMessage.email}
                      </a>
                    </p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <p className="text-white/40 text-xs">Phone</p>
                      <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                        <Phone size={12} className="text-[var(--theme-primary)]" />
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="hover:text-[var(--theme-primary)] transition-colors"
                        >
                          {selectedMessage.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  {selectedMessage.subject && (
                    <div>
                      <p className="text-white/40 text-xs">Subject</p>
                      <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                        <Briefcase size={12} className="text-[var(--theme-primary)]" />
                        {selectedMessage.subject}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-white/40 text-xs">Received</p>
                    <p className="text-white font-[var(--font-body)] flex items-center gap-1">
                      <Calendar size={12} className="text-[var(--theme-primary)]" />
                      {selectedMessage.createdAt
                        ? new Date(selectedMessage.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4">
                <h4 className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
                  Message
                </h4>
                <p className="text-white/80 text-sm font-[var(--font-body)] leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Status Actions */}
              <div>
                <p className="text-[var(--theme-primary)] text-xs font-[var(--font-body)] uppercase tracking-wider mb-3">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["new", "read", "replied", "archived"] as const).map((status) => {
                    const Icon = statusIcons[status];
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          updateStatusMutation.mutate({
                            id: selectedMessage.id,
                            status,
                          });
                          setSelectedMessage({ ...selectedMessage, status });
                        }}
                        disabled={selectedMessage.status === status}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-[var(--font-body)] font-medium rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                          selectedMessage.status === status
                            ? "bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/40 text-[var(--theme-primary)]"
                            : "bg-[var(--theme-surface)] border-white/5 text-white/60 hover:border-[var(--theme-primary)]/30 hover:text-white"
                        }`}
                      >
                        <Icon size={14} />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Reply via Email */}
              <div className="pt-2 border-t border-white/5">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your inquiry"}&body=Dear ${selectedMessage.name},%0D%0A%0D%0AThank you for reaching out to VANIR GROUP.%0D%0A%0D%0A`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-semibold text-sm rounded-lg hover:bg-[var(--theme-primary-light)] transition-colors"
                >
                  <Mail size={14} />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
