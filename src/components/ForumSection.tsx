import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Plus,
  Heart,
  Share2,
  Send,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Pin,
  Trash2,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import {
  StudentUser,
  ForumPost,
  ForumReply,
  FORUM_CATEGORIES,
  DEFAULT_FORUM_POSTS,
  DEFAULT_FORUM_REPLIES
} from '../data/initialData';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

interface ForumSectionProps {
  studentUser: StudentUser | null;
  isTeacherAuthenticated?: boolean;
  teacherProfile?: { name: string; email: string } | null;
  theme?: 'dark' | 'light';
  onOpenAuthModal: () => void;
  onUpdateStudentUser?: (user: StudentUser) => void;
}

export const ForumSection: React.FC<ForumSectionProps> = ({
  studentUser,
  isTeacherAuthenticated = false,
  teacherProfile,
  theme = 'dark',
  onOpenAuthModal,
  onUpdateStudentUser
}) => {
  const isDark = theme === 'dark';

  // Determine user role
  const isOwner =
    isTeacherAuthenticated ||
    studentUser?.role === 'owner' ||
    studentUser?.phone === 'ramadanh66778@gmail.com';
  const isAdmin = isOwner || studentUser?.role === 'admin';

  // Forum membership status:
  // Teachers/Admins are approved automatically. Students depend on forumStatus.
  const isMemberApproved =
    isOwner || isAdmin || studentUser?.forumStatus === 'approved';
  const isMemberPending = !isMemberApproved && studentUser?.forumStatus === 'pending';

  // Posts & Replies State
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    try {
      const saved = localStorage.getItem('bac_forum_posts');
      return saved ? JSON.parse(saved) : DEFAULT_FORUM_POSTS;
    } catch {
      return DEFAULT_FORUM_POSTS;
    }
  });

  const [replies, setReplies] = useState<Record<string, ForumReply[]>>(() => {
    try {
      const saved = localStorage.getItem('bac_forum_replies');
      return saved ? JSON.parse(saved) : DEFAULT_FORUM_REPLIES;
    } catch {
      return DEFAULT_FORUM_REPLIES;
    }
  });

  // Pending forum membership requests
  const [pendingMembers, setPendingMembers] = useState<StudentUser[]>([]);

  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // New Post Form
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState<string>('');
  const [postCategory, setPostCategory] = useState<string>('نقاش عام وتجارب');
  const [postContent, setPostContent] = useState<string>('');
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);

  // Reply input per post
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Join Forum Request Form Modal
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinUsername, setJoinUsername] = useState<string>(studentUser?.username || '');
  const [joinGrade, setJoinGrade] = useState<string>(studentUser?.grade || 'تانية بكالوريا');
  const [joinName, setJoinName] = useState<string>(studentUser?.name || '');
  const [joinPhone, setJoinPhone] = useState<string>(studentUser?.phone || '');
  const [isSubmittingJoin, setIsSubmittingJoin] = useState<boolean>(false);
  const [joinSuccessNotice, setJoinSuccessNotice] = useState<boolean>(false);

  // Admin Pending Requests Modal
  const [showAdminPendingModal, setShowAdminPendingModal] = useState<boolean>(false);

  // 1. Sync Forum Posts from Firestore in Real-Time
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'forum_posts'),
        (snapshot) => {
          if (!snapshot.empty) {
            const fetchedPosts: ForumPost[] = [];
            snapshot.forEach((d) => {
              fetchedPosts.push(d.data() as ForumPost);
            });
            fetchedPosts.sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setPosts(fetchedPosts);
            try {
              localStorage.setItem('bac_forum_posts', JSON.stringify(fetchedPosts));
            } catch {}
          }
        },
        (error) => console.warn('Firestore forum_posts fallback:', error.message)
      );
      return () => unsub();
    } catch (e) {
      console.warn('Forum posts listener error:', e);
    }
  }, []);

  // 2. Sync Forum Replies from Firestore in Real-Time
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'forum_replies'),
        (snapshot) => {
          if (!snapshot.empty) {
            const groupedReplies: Record<string, ForumReply[]> = {};
            snapshot.forEach((d) => {
              const r = d.data() as ForumReply;
              if (!groupedReplies[r.postId]) {
                groupedReplies[r.postId] = [];
              }
              groupedReplies[r.postId].push(r);
            });
            Object.keys(groupedReplies).forEach((k) => {
              groupedReplies[k].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
            });
            setReplies(groupedReplies);
            try {
              localStorage.setItem('bac_forum_replies', JSON.stringify(groupedReplies));
            } catch {}
          }
        },
        (error) => console.warn('Firestore forum_replies fallback:', error.message)
      );
      return () => unsub();
    } catch (e) {
      console.warn('Forum replies listener error:', e);
    }
  }, []);

  // 3. Sync Pending Forum Members for Admin
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const list: StudentUser[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            if (d.forumStatus === 'pending') {
              list.push({
                phone: d.phone || docSnap.id,
                name: d.name || 'طالب',
                username: d.username,
                grade: d.grade || 'تانية بكالوريا',
                forumStatus: 'pending',
                status: d.status || 'approved',
                createdAt: d.createdAt || new Date().toISOString()
              });
            }
          });
          setPendingMembers(list);
        },
        (error) => console.warn('Pending forum members fallback:', error.message)
      );
      return () => unsub();
    } catch (e) {
      console.warn('Forum members listener error:', e);
    }
  }, [isAdmin]);

  // Handle Submit Join Forum Request
  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUser) {
      onOpenAuthModal();
      return;
    }
    const cleanUsername = joinUsername.trim().replace(/^@+/, '');
    if (!cleanUsername) return;

    setIsSubmittingJoin(true);
    try {
      const updatedUser: StudentUser = {
        ...studentUser,
        name: joinName.trim() || studentUser.name,
        phone: joinPhone.trim() || studentUser.phone,
        username: `@${cleanUsername}`,
        grade: joinGrade.trim() || studentUser.grade,
        forumStatus: 'pending'
      };

      // Save to Firestore users doc
      const safeDocId = studentUser.phone.replace(/[^a-zA-Z0-9_]/g, '_');
      await Promise.allSettled([
        setDoc(doc(db, 'users', studentUser.phone), {
          username: `@${cleanUsername}`,
          forumStatus: 'pending',
          forumRequestedAt: new Date().toISOString()
        }, { merge: true }),
        setDoc(doc(db, 'users', safeDocId), {
          username: `@${cleanUsername}`,
          forumStatus: 'pending',
          forumRequestedAt: new Date().toISOString()
        }, { merge: true })
      ]);

      if (onUpdateStudentUser) {
        onUpdateStudentUser(updatedUser);
      }
      try {
        localStorage.setItem('student_session', JSON.stringify(updatedUser));
      } catch {}

      setJoinSuccessNotice(true);
      setShowJoinModal(false);
    } catch (err) {
      console.warn('Error submitting forum join:', err);
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  // Handle Admin Approve/Reject Forum Member
  const handleApproveForumMember = async (memberPhone: string, memberName: string) => {
    const safeDocId = memberPhone.replace(/[^a-zA-Z0-9_]/g, '_');
    try {
      await Promise.allSettled([
        setDoc(doc(db, 'users', memberPhone), { forumStatus: 'approved', forumApprovedAt: new Date().toISOString() }, { merge: true }),
        setDoc(doc(db, 'users', safeDocId), { forumStatus: 'approved', forumApprovedAt: new Date().toISOString() }, { merge: true })
      ]);
      setPendingMembers((prev) => prev.filter((m) => m.phone !== memberPhone));
    } catch (err) {
      console.warn('Approve forum member error:', err);
    }
  };

  const handleRejectForumMember = async (memberPhone: string) => {
    const safeDocId = memberPhone.replace(/[^a-zA-Z0-9_]/g, '_');
    try {
      await Promise.allSettled([
        setDoc(doc(db, 'users', memberPhone), { forumStatus: 'rejected' }, { merge: true }),
        setDoc(doc(db, 'users', safeDocId), { forumStatus: 'rejected' }, { merge: true })
      ]);
      setPendingMembers((prev) => prev.filter((m) => m.phone !== memberPhone));
    } catch (err) {
      console.warn('Reject forum member error:', err);
    }
  };

  // Handle Submit New Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const authorPhone = isTeacherAuthenticated
      ? teacherProfile?.email || 'ramadanh66778@gmail.com'
      : studentUser?.phone || 'student';
    const authorName = isTeacherAuthenticated
      ? 'الأستاذ: محمد رمضان الحرباوي 👑'
      : studentUser?.name || 'طالب';
    const authorUsername = isTeacherAuthenticated
      ? '@ramadan_owner'
      : studentUser?.username || `@student_${authorPhone.slice(-4)}`;
    const authorRole = isOwner ? 'owner' : isAdmin ? 'admin' : 'student';

    const newPostId = `post-${Date.now()}`;
    const newPost: ForumPost = {
      id: newPostId,
      authorPhone,
      authorName,
      authorUsername,
      authorRole,
      title: postTitle.trim(),
      content: postContent.trim(),
      category: postCategory,
      likes: [authorPhone],
      repliesCount: 0,
      createdAt: new Date().toISOString(),
      isPinned: isOwner
    };

    setIsSubmittingPost(true);
    // Instant local state update
    setPosts((prev) => [newPost, ...prev]);

    try {
      await setDoc(doc(db, 'forum_posts', newPostId), newPost);
      setShowNewPostModal(false);
      setPostTitle('');
      setPostContent('');
    } catch (err) {
      console.warn('Error saving forum post:', err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Handle Like Post
  const handleToggleLike = async (postId: string) => {
    const userIdentifier = isTeacherAuthenticated
      ? teacherProfile?.email || 'ramadanh66778@gmail.com'
      : studentUser?.phone;

    if (!userIdentifier) {
      onOpenAuthModal();
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const hasLiked = post.likes.includes(userIdentifier);
    const updatedLikes = hasLiked
      ? post.likes.filter((id) => id !== userIdentifier)
      : [...post.likes, userIdentifier];

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p))
    );

    try {
      await updateDoc(doc(db, 'forum_posts', postId), { likes: updatedLikes });
    } catch (err) {
      console.warn('Error updating likes:', err);
    }
  };

  // Handle Submit Reply
  const handleAddReply = async (postId: string) => {
    const replyText = (replyTextMap[postId] || '').trim();
    if (!replyText) return;

    const authorPhone = isTeacherAuthenticated
      ? teacherProfile?.email || 'ramadanh66778@gmail.com'
      : studentUser?.phone || 'student';
    const authorName = isTeacherAuthenticated
      ? 'الأستاذ: محمد رمضان الحرباوي 👑'
      : studentUser?.name || 'طالب';
    const authorUsername = isTeacherAuthenticated
      ? '@ramadan_owner'
      : studentUser?.username || `@user_${authorPhone.slice(-4)}`;
    const authorRole = isOwner ? 'owner' : isAdmin ? 'admin' : 'student';

    const replyId = `rep-${Date.now()}`;
    const newReply: ForumReply = {
      id: replyId,
      postId,
      authorPhone,
      authorName,
      authorUsername,
      authorRole,
      content: replyText,
      likes: [],
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setReplies((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newReply]
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, repliesCount: (p.repliesCount || 0) + 1 } : p
      )
    );
    setReplyTextMap((prev) => ({ ...prev, [postId]: '' }));

    try {
      await Promise.allSettled([
        setDoc(doc(db, 'forum_replies', replyId), newReply),
        updateDoc(doc(db, 'forum_posts', postId), {
          repliesCount: (posts.find((p) => p.id === postId)?.repliesCount || 0) + 1
        })
      ]);
    } catch (err) {
      console.warn('Error saving forum reply:', err);
    }
  };

  // Delete Post (Author or Admin/Owner)
  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await deleteDoc(doc(db, 'forum_posts', postId));
    } catch (err) {
      console.warn('Delete post warning:', err);
    }
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    const matchesCat =
      selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      p.authorUsername.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300" dir="rtl">
      {/* Forum Header Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-2xl transition-colors ${
          isDark
            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-indigo-500/30 text-white'
            : 'bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-indigo-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>مجتمع الطلاب والأساتذة • تانية بكالوريا</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إشراف مباشر: محمد رمضان الحرباوي</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              منتدى النقاش وتبادل الخبرات والحلول النموذجية
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              اطرح أسئلتك في أي مادة، شارك ملخصاتك وتلخيصات الدروس، وناقش حلول المسائل مع زملائك والمشرفين والمعلم.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && pendingMembers.length > 0 && (
              <button
                onClick={() => setShowAdminPendingModal(true)}
                className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer animate-pulse"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>طلبات الانضمام ({pendingMembers.length}) 🛡️</span>
              </button>
            )}

            {isMemberApproved ? (
              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء موضوع جديد / اطرح سؤالاً ✏️</span>
              </button>
            ) : isMemberPending ? (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span>طلب انضمامك للمنتدى قيد مراجعة الإدارة ⏳</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!studentUser) {
                    onOpenAuthModal();
                  } else {
                    setShowJoinModal(true);
                  }
                }}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>طلب الانضمام إلى المنتدى وعمل اسم مستخدم 💬</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notice if just requested join */}
      {joinSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              تم إرسال طلب انضمامك للمنتدى بنجاح! سيتم اعتماده وتفعيله من قِبل إدارة الأستاذ محمد رمضان قريباً.
            </span>
          </div>
          <button onClick={() => setJoinSuccessNotice(false)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في موضوعات المنتدى بالكلمة، المادة، أو اسم الكاتب..."
              className={`w-full border rounded-2xl pr-10 pl-4 py-3 text-xs sm:text-sm focus:border-indigo-500 shadow-md ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {FORUM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === 'all' ? 'all' : cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                (cat.id === 'all' && selectedCategory === 'all') || selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const postReplies = replies[post.id] || [];
            const isExpanded = expandedPostId === post.id;
            const currentUserId = isTeacherAuthenticated
              ? teacherProfile?.email || 'ramadanh66778@gmail.com'
              : studentUser?.phone;
            const hasLiked = currentUserId ? post.likes.includes(currentUserId) : false;
            const canDelete =
              isOwner ||
              isAdmin ||
              (studentUser && studentUser.phone === post.authorPhone);

            return (
              <div
                key={post.id}
                className={`rounded-3xl border p-5 sm:p-6 shadow-xl transition-all ${
                  post.isPinned
                    ? isDark
                      ? 'bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-gradient-to-r from-amber-50 via-white to-white border-amber-300 shadow-amber-500/5'
                    : isDark
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Post Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-md ${
                        post.authorRole === 'owner'
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-700'
                          : post.authorRole === 'admin'
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                          : 'bg-gradient-to-tr from-blue-600 to-cyan-600'
                      }`}
                    >
                      {post.authorName.charAt(0) || 'ط'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm">{post.authorName}</span>
                        <span className="text-[11px] font-mono text-indigo-400 font-semibold" dir="ltr">
                          {post.authorUsername}
                        </span>

                        {post.authorRole === 'owner' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black">
                            👑 مالك المنصة
                          </span>
                        )}
                        {post.authorRole === 'admin' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-bold">
                            🛡️ مشرف عام
                          </span>
                        )}
                        {post.isPinned && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" />
                            <span>مثبت</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="px-2 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                          {post.category}
                        </span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="حذف الموضوع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <h3 className="font-black text-base sm:text-lg mb-2 leading-snug">{post.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {post.content}
                </p>

                {/* Post Footer Actions */}
                <div className="flex items-center justify-between gap-4 mt-5 pt-3 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                        hasLiked
                          ? 'bg-rose-500/15 text-rose-500 border-rose-500/40'
                          : isDark
                          ? 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500' : ''}`} />
                      <span>{post.likes.length} إعجاب</span>
                    </button>

                    <button
                      onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                        isExpanded
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : isDark
                          ? 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{postReplies.length} تعليقات ومشاركات</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Replies Section */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold text-slate-400">التعليقات والإجابات:</h4>

                    {/* Replies list */}
                    {postReplies.length > 0 ? (
                      <div className="space-y-2.5">
                        {postReplies.map((reply, rIdx) => (
                          <div
                            key={`${reply.id}-${rIdx}`}
                            className={`p-3.5 rounded-2xl border ${
                              reply.authorRole === 'owner'
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : reply.authorRole === 'admin'
                                ? 'bg-purple-500/10 border-purple-500/30'
                                : isDark
                                ? 'bg-slate-950/70 border-slate-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs">{reply.authorName}</span>
                                <span className="text-[10px] text-indigo-400 font-mono" dir="ltr">
                                  {reply.authorUsername}
                                </span>
                                {reply.authorRole === 'owner' && (
                                  <span className="text-[10px] text-amber-400 font-bold">👑 المعلم</span>
                                )}
                                {reply.authorRole === 'admin' && (
                                  <span className="text-[10px] text-purple-400 font-bold">🛡️ مشرف</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {new Date(reply.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-3">
                        لا توجد تعليقات بعد. كن أول من يشارك في الإجابة والحل!
                      </p>
                    )}

                    {/* Add Reply Input */}
                    {isMemberApproved ? (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={replyTextMap[post.id] || ''}
                          onChange={(e) =>
                            setReplyTextMap({ ...replyTextMap, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddReply(post.id);
                            }
                          }}
                          placeholder="اكتب تعليقك أو إجابتك هنا واضغط إرسال..."
                          className={`flex-1 border rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500'
                              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                        <button
                          onClick={() => handleAddReply(post.id)}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-800/60 text-center text-xs text-slate-400">
                        {isMemberPending ? (
                          <span>طلب انضمامك قيد المراجعة لتتمكن من إضافة التعليقات ⏳</span>
                        ) : (
                          <button
                            onClick={() => setShowJoinModal(true)}
                            className="text-indigo-400 hover:underline font-bold"
                          >
                            انضم للمنتدى لتتمكن من الرد والتعليق ومناقشة الزملاء 💬
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div
            className={`text-center py-16 rounded-3xl border ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-400">لا توجد موضوعات مطابقة</h3>
            <p className="text-xs text-slate-500 mt-1">جرب تغيير التصنيف أو كتابة موضوع جديد في المنتدى.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: Create New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900 border-indigo-500/40 text-slate-100' : 'bg-white border-indigo-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                <span>إنشاء موضوع جديد في منتدى الطلاب</span>
              </h3>
              <button onClick={() => setShowNewPostModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">عنوان الموضوع أو السؤال *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="مثال: استفسار حول حل مسألة الفيزياء في التقييم الأسبوعي الثاني..."
                  className={`w-full border rounded-xl p-3 focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">قسم وتصنيف الموضوع</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className={`w-full border rounded-xl p-3 focus:border-indigo-500 cursor-pointer ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="نقاش عام وتجارب">نقاش عام وتجارب 📢</option>
                  <option value="أسئلة ومسائل صعبة">أسئلة ومسائل صعبة ❓</option>
                  <option value="ملخصات ومذكرات الطلاب">ملخصات ومذكرات الطلاب 📝</option>
                  <option value="نصائح المذاكرة وتنظيم الوقت">نصائح المذاكرة وتنظيم الوقت 💡</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">محتوى الموضوع أو شرح السؤال بالتفصيل *</label>
                <textarea
                  required
                  rows={5}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="اكتب تفاصيل سؤالك، خطوات حلك، أو الملخص الذي تود مشاركته مع زملائك..."
                  className={`w-full border rounded-xl p-3 focus:border-indigo-500 leading-relaxed ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-500/10 text-slate-400 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {isSubmittingPost ? 'جاري النشر...' : 'نشر الموضوع الآن 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Request Forum Membership & Username Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl relative ${
              isDark ? 'bg-slate-900 border-emerald-500/40 text-slate-100' : 'bg-white border-emerald-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                <span>طلب الانضمام لمنتدى ومجتمع الطلاب</span>
              </h3>
              <button onClick={() => setShowJoinModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              لحماية المنصة وضمان بيئة تعليمية راقية، يتطلب الانضمام للمنتدى إدخال بياناتك واسم مستخدم خاص بك، ويقوم المشرف أو المعلم بمراجعة الطلب والموافقة عليه فوراً.
            </p>

            <form onSubmit={handleSubmitJoin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className={`w-full border rounded-xl p-3 focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">رقم الهاتف المسجل *</label>
                <input
                  type="text"
                  required
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className={`w-full border rounded-xl p-3 focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">اسم المستخدم في المنتدى (Username) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-emerald-400 font-mono font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={joinUsername.replace(/^@/, '')}
                    onChange={(e) => setJoinUsername(e.target.value.trim().toLowerCase())}
                    placeholder="مثال: ahmed_bac2026"
                    className={`w-full border rounded-xl p-3 pl-8 focus:border-emerald-500 font-mono ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  سيظهر هذا الاسم تحت جميع مشاركاتك وتعليقاتك في المنتدى.
                </span>
              </div>

              <div>
                <label className="block font-semibold mb-1">الصف والشعبة الدراسية</label>
                <input
                  type="text"
                  value={joinGrade}
                  onChange={(e) => setJoinGrade(e.target.value)}
                  placeholder="مثال: تانية بكالوريا / علمي علوم"
                  className={`w-full border rounded-xl p-3 focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-500/10 text-slate-400 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJoin}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  {isSubmittingJoin ? 'جاري الإرسال...' : 'إرسال طلب الانضمام ✅'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Admin Review Pending Forum Members Modal */}
      {showAdminPendingModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900 border-amber-500/40 text-slate-100' : 'bg-white border-amber-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
                <span>طلبات الانضمام للمنتدى المعلقة ({pendingMembers.length})</span>
              </h3>
              <button onClick={() => setShowAdminPendingModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {pendingMembers.length > 0 ? (
              <div className="space-y-3">
                {pendingMembers.map((m, idx) => (
                  <div
                    key={`${m.phone}-${idx}`}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{m.name}</span>
                        <span className="text-xs font-mono text-indigo-400">{m.username || '@username'}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span className="font-mono" dir="ltr">{m.phone}</span>
                        <span>•</span>
                        <span>{m.grade}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveForumMember(m.phone, m.name)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                      >
                        موافقة وتفعيل ✅
                      </button>
                      <button
                        onClick={() => handleRejectForumMember(m.phone)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        رفض ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                لا توجد طلبات انضمام معلقة حالياً. جميع الطلاب معتمدون!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
