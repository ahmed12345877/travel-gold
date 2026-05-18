import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  MessageCircle,
  Search,
  Trash2,
  Mail,
  MailOpen,
  Reply,
  Archive,
  Star,
  X,
  Send,
  Clock,
  User,
} from "lucide-react";

export default function MessagesAdmin() {
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");

  const { data: messagesData, isLoading } = trpc.contact.listAll.useQuery({
    limit: 50,
    offset: 0,
  });
  const messages = messagesData || [];

  const filtered = messages.filter((m: any) => {
    const matchSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="text-[var(--theme-primary)]" size={24} />
            إدارة الرسائل
          </h1>
          <p className="text-white/50 text-sm mt-1">
            عرض والرد على رسائل الاتصال
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{messages.length}</p>
          <p className="text-xs text-white/50">إجمالي الرسائل</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {messages.filter((m: any) => m.status === "new").length}
          </p>
          <p className="text-xs text-white/50">غير مقروءة</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {messages.filter((m: any) => m.status === "replied").length}
          </p>
          <p className="text-xs text-white/50">تم الرد</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
            size={16}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[var(--theme-surface)] border-white/10 text-white pr-10"
            placeholder="البحث في الرسائل..."
          />
        </div>
        <div className="flex gap-1">
          {(["all", "unread", "starred"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                filter === f
                  ? "bg-[var(--theme-primary)] text-black"
                  : "bg-white/5 text-white/50"
              }`}
            >
              {f === "all" ? "الكل" : f === "unread" ? "غير مقروءة" : "مميزة"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <p className="text-sm font-medium text-white">
              الرسائل ({filtered.length})
            </p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-white/40">
                جاري التحميل...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-white/40">لا توجد رسائل</div>
            ) : (
              filtered.map((msg: any) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-right p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                    selectedMessage?.id === msg.id
                      ? "bg-[var(--theme-primary)]/5 border-r-2 border-r-[var(--theme-primary)]"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {msg.name}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {msg.subject || "بدون موضوع"}
                      </p>
                      <p className="text-xs text-white/20 mt-1 truncate">
                        {msg.message?.slice(0, 60)}...
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 mr-2">
                      <span className="text-[10px] text-white/20">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleDateString("ar-EG")
                          : ""}
                      </span>
                      {msg.status === "new" && (
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-[var(--theme-surface)] border border-white/5 rounded-lg overflow-hidden">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center">
                      <User size={18} className="text-[var(--theme-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {selectedMessage.name}
                      </p>
                      <p className="text-xs text-white/40" dir="ltr">
                        {selectedMessage.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-white/30 hover:text-[var(--theme-primary)]">
                      <Star size={14} />
                    </button>
                    <button className="p-1.5 text-white/30 hover:text-blue-400">
                      <Archive size={14} />
                    </button>
                    <button className="p-1.5 text-white/30 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {selectedMessage.subject && (
                  <p className="text-sm text-white/60 mt-2 font-medium">
                    {selectedMessage.subject}
                  </p>
                )}
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={12} className="text-white/20" />
                  <span className="text-xs text-white/20">
                    {selectedMessage.createdAt
                      ? new Date(selectedMessage.createdAt).toLocaleString(
                          "ar-EG",
                        )
                      : ""}
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
                {selectedMessage.phone && (
                  <p className="text-xs text-white/30 mt-4" dir="ltr">
                    📞 {selectedMessage.phone}
                  </p>
                )}
              </div>
              <div className="p-4 border-t border-white/5">
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="bg-[#1a1a1a] border-white/10 text-white flex-1"
                    placeholder="اكتب ردك هنا..."
                    rows={2}
                  />
                  <Button className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] self-end">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Mail size={40} className="text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">اختر رسالة لعرضها</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
