import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Headphones,
  Sparkles,
  ShieldCheck,
  Clock,
  MessageCircle
} from 'lucide-react';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { SupportChatMessage } from '../data/initialData';

export interface SupportTicket {
  id: string;
  name: string;
  phone: string;
  message: string;
  category: string;
  status: 'جديدة' | 'تمت المراجعة';
  createdAt: string;
}

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentUser: { name: string; phone: string; grade: string } | null;
  onTicketSubmitted?: (ticket: SupportTicket) => void;
  initialTab?: 'chat' | 'ticket';
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  studentUser,
  onTicketSubmitted,
  initialTab = 'chat'
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket'>(initialTab);

  // Live Chat States
  const [chatMessages, setChatMessages] = useState<SupportChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Ticket Form States
  const [name, setName] = useState(studentUser?.name || '');
  const [phone, setPhone] = useState(studentUser?.phone || '');
  const [category, setCategory] = useState('استفسار عن تفعيل الحساب');
  const [message, setMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentPhone = studentUser?.phone || phone.trim() || 'guest';
  const studentName = studentUser?.name || name.trim() || 'طالب';

  // Listen to live chat messages for this student
  useEffect(() => {
    if (!isOpen || !studentPhone || studentPhone === 'guest') return;

    try {
      const q = collection(db, 'support_messages');
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const msgs: SupportChatMessage[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as SupportChatMessage;
            if (data.studentPhone === studentPhone) {
              msgs.push(data);
            }
          });
          msgs.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setChatMessages(msgs);
        },
        (err) => {
          console.warn('Chat listener fallback:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Chat listener error:', e);
    }
  }, [isOpen, studentPhone]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  if (!isOpen) return null;

  // Send Live Chat Message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = newMessageText.trim();
    if (!cleanText) return;

    if (!studentUser && !phone.trim()) {
      setError('يرجى كتابة رقم هاتفك أولاً في تبويب التذكرة أو تسجيل الدخول لبدء المحادثة');
      return;
    }

    setIsSendingMessage(true);
    setError(null);

    const msgId = `msg-${Date.now()}`;
    const newMsg: SupportChatMessage = {
      id: msgId,
      studentPhone,
      studentName,
      senderRole: 'student',
      senderName: studentName,
      text: cleanText,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'support_messages', msgId), newMsg);
      setNewMessageText('');
    } catch (err: any) {
      console.warn('Send chat message error:', err);
      // Local fallback
      setChatMessages((prev) => [...prev, newMsg]);
      setNewMessageText('');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Submit Formal Ticket
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanMsg = message.trim();

    if (!cleanName || !cleanPhone || !cleanMsg) {
      setError('يرجى ملء جميع الحقول المطلوبة (الاسم، رقم الهاتف، والرسالة)');
      return;
    }

    setTicketLoading(true);
    setError(null);

    const ticketId = `ticket-${Date.now()}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      name: cleanName,
      phone: cleanPhone,
      category,
      message: cleanMsg,
      status: 'جديدة',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'support_tickets', ticketId), newTicket);

      // Save to local storage for instant sync
      try {
        const localTicketsStr = localStorage.getItem('bac_support_tickets');
        const localTickets: SupportTicket[] = localTicketsStr ? JSON.parse(localTicketsStr) : [];
        localTickets.unshift(newTicket);
        localStorage.setItem('bac_support_tickets', JSON.stringify(localTickets));
      } catch {}

      if (onTicketSubmitted) {
        onTicketSubmitted(newTicket);
      }

      setTicketSuccess(true);
      setTimeout(() => {
        setTicketSuccess(false);
        setMessage('');
        setActiveTab('chat');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh] my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                الدعم الفني والمحادثة المباشرة
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                مباشر
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تواصل مباشرة مع الأستاذ محمد رمضان الحرباوي وفريق الدعم
            </p>
          </div>
        </div>

        {/* Tab Toggle: Live Chat vs Formal Ticket */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-4 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chat');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>محادثة مباشرة (شات)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ticket');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ticket'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال استفسار / تذكرة</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* TAB 1: LIVE CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-[300px] max-h-[420px]">
            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 mb-3">
              {/* Welcome message from teacher */}
              <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl rounded-tr-none bg-slate-800 text-xs text-slate-200 border border-slate-700/80 shadow-sm leading-relaxed">
                  <p className="font-bold text-amber-400 text-[11px] mb-1">
                    الأستاذ: محمد رمضان الحرباوي 👑
                  </p>
                  <span>
                    أهلاً بك يا بني في منصتك التعليمية. اكتب رسالتك أو استفسارك هنا مباشرة، وسأقوم بالرد عليك شخصياً ومساعدتك في أي وقت.
                  </span>
                  <div className="text-[9px] text-slate-500 mt-1">تلقائي</div>
                </div>
              </div>

              {/* Dynamic messages */}
              {chatMessages.map((msg) => {
                const isStudent = msg.senderRole === 'student';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      isStudent ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isStudent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-amber-500 text-slate-950 font-bold'
                      }`}
                    >
                      {isStudent ? <User className="w-3.5 h-3.5" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs shadow-sm leading-relaxed ${
                        isStudent
                          ? 'rounded-tl-none bg-indigo-600 text-white'
                          : 'rounded-tr-none bg-slate-800 text-slate-200 border border-amber-500/30'
                      }`}
                    >
                      <p
                        className={`font-bold text-[11px] mb-0.5 ${
                          isStudent ? 'text-indigo-200' : 'text-amber-400'
                        }`}
                      >
                        {msg.senderName} {!isStudent && '👑 (المعلم)'}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={`text-[9px] mt-1 ${
                          isStudent ? 'text-indigo-200/80' : 'text-slate-500'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input to send chat message */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="اكتب رسالتك المباشرة هنا للأستاذ محمد رمضان..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isSendingMessage || !newMessageText.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: FORMAL TICKET */}
        {activeTab === 'ticket' && (
          <div>
            {ticketSuccess ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">تم إرسال تذكرتك بنجاح!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  شكراً لك. تم تحويل طلبك مباشرة إلى لوحة تحكم المعلم لمراجعته والرد عليك عبر الشات أو الهاتف.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب اسمك هنا"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:border-indigo-500 text-xs text-right"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نوع الطلب</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 text-xs cursor-pointer"
                  >
                    <option value="استفسار عن تفعيل الحساب">استفسار عن تفعيل واعتماد الحساب</option>
                    <option value="طلب كتاب أو مذكرة">طلب كتاب أو مذكرة غير موجودة</option>
                    <option value="مشكلة في تشغيل الفيديوهات">مشكلة في تشغيل الفيديوهات</option>
                    <option value="استفسار عام للمشرف">استفسار عام للأستاذ محمد رمضان</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نص الرسالة *</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب تفاصيل استفسارك أو مشكلتك..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 resize-y text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {ticketLoading ? (
                    <span>جاري الإرسال...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال التذكرة للإدارة</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
