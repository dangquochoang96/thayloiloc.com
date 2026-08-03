/**
 * Chat Service — Firebase Realtime Database
 * Realtime chat giữa tất cả người dùng qua Google Firebase
 */
import { db } from "./firebase.js";
import {
  ref,
  push,
  set,
  remove,
  get,
  query,
  orderByChild,
  limitToLast,
  startAfter,
  onChildAdded,
  onValue,
  onDisconnect,
} from "firebase/database";

const MAX_MESSAGES = 200;
const MESSAGES_REF  = "chat/messages";
const TYPING_REF    = "chat/typing";
const ONLINE_REF    = "chat/online";

class ChatService {
  constructor() {
    this.listeners     = {};
    this.currentUser   = null;
    this._messages     = [];
    this._onlineUsers  = {};
    this._unsubscribers = [];
    this._typingTimer  = null;
    this._syncCurrentUser();
  }

  // ─── USER ──────────────────────────────────────────────

  _syncCurrentUser() {
    try {
      const raw = localStorage.getItem("user_info");
      if (!raw) return;
      this.currentUser = JSON.parse(raw);
    } catch {}
  }

  getCurrentUser() {
    this._syncCurrentUser();
    return this.currentUser;
  }

  // ─── EVENTS ─────────────────────────────────────────────

  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
    return () => {
      this.listeners[event] = this.listeners[event].filter((x) => x !== cb);
    };
  }

  _emit(event, data) {
    (this.listeners[event] || []).forEach((cb) => {
      try { cb(data); } catch {}
    });
  }

  // ─── SUBSCRIBE (gọi khi mở chat) ───────────────────────

  /**
   * Tải lịch sử + lắng nghe tin nhắn mới
   * Trả về: unsubscribe function
   */
  async subscribe() {
    this._messages = [];

    // 1. Tải tin nhắn cũ
    try {
      const initQ = query(
        ref(db, MESSAGES_REF),
        orderByChild("createdAt"),
        limitToLast(MAX_MESSAGES)
      );
      const snap = await get(initQ);
      const msgs = [];
      snap.forEach((child) => {
        const m = child.val();
        if (m) msgs.push(m);
      });
      this._messages = msgs;
      this._emit("messages_loaded", msgs);
    } catch (e) {
      console.error("[Chat] load history error:", e);
      this._emit("messages_loaded", []);
    }

    // 2. Lắng nghe tin nhắn MỚI (createdAt > hiện tại)
    const since = Date.now() - 1000; // buffer 1s
    const newQ = query(
      ref(db, MESSAGES_REF),
      orderByChild("createdAt"),
      startAfter(since)
    );
    const newMsgUnsub = onChildAdded(newQ, (snap) => {
      const msg = snap.val();
      if (!msg) return;
      // Tránh trùng với lịch sử
      if (this._messages.find((m) => m.id === msg.id)) return;
      this._messages.push(msg);
      this._emit("new_message", msg);
    });

    // 3. Lắng nghe typing
    const typingUnsub = onValue(ref(db, TYPING_REF), (snap) => {
      const typing = snap.val() || {};
      const myId = String(this.currentUser?.id || "");
      Object.entries(typing).forEach(([userId, data]) => {
        if (userId === myId) return;
        this._emit("typing", {
          userId,
          userName: data.userName || "Người dùng",
          isTyping: true,
        });
      });
    });

    // 4. Lắng nghe online users
    const onlineUnsub = onValue(ref(db, ONLINE_REF), (snap) => {
      this._onlineUsers = snap.val() || {};
      this._emit("user_status", this._onlineUsers);
    });

    this._unsubscribers = [newMsgUnsub, typingUnsub, onlineUnsub];

    return () => {
      this._unsubscribers.forEach((fn) => fn && fn());
      this._unsubscribers = [];
      this._messages = [];
    };
  }

  // ─── SEND MESSAGE ────────────────────────────────────────

  async sendMessage(content) {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Chưa đăng nhập");
    if (!content?.trim()) throw new Error("Tin nhắn trống");

    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      senderId:     String(user.id),
      senderName:   user.name || user.fullName || user.username || user.ten || "Người dùng",
      senderPhone:  user.phone || "",
      senderAvatar: user.avatar || null,
      content:      content.trim(),
      createdAt:    Date.now(),
    };

    await push(ref(db, MESSAGES_REF), msg);
    return msg;
  }

  // ─── TYPING ──────────────────────────────────────────────

  async sendTyping(isTyping) {
    const user = this.getCurrentUser();
    if (!user?.id) return;

    const typingRef = ref(db, `${TYPING_REF}/${user.id}`);
    if (isTyping) {
      await set(typingRef, {
        userName:  user.name || user.fullName || user.ten || "Người dùng",
        timestamp: Date.now(),
      });
      clearTimeout(this._typingTimer);
      this._typingTimer = setTimeout(() => remove(typingRef), 3000);
    } else {
      clearTimeout(this._typingTimer);
      await remove(typingRef);
    }
  }

  // ─── ONLINE PRESENCE ─────────────────────────────────────

  async setOnline() {
    const user = this.getCurrentUser();
    if (!user?.id) return;

    const userRef = ref(db, `${ONLINE_REF}/${user.id}`);
    await set(userRef, {
      id:       String(user.id),
      name:     user.name || user.fullName || user.username || user.ten || "Người dùng",
      isOnline: true,
      lastSeen: Date.now(),
    });
    // Tự xóa khi mất kết nối
    onDisconnect(userRef).remove();
  }

  async setOffline() {
    const user = this.getCurrentUser();
    if (!user?.id) return;
    await remove(ref(db, `${ONLINE_REF}/${user.id}`));
  }

  getOnlineUsers() {
    return Object.values(this._onlineUsers);
  }

  getMessages() {
    return [...this._messages];
  }

  // ─── ADMIN ───────────────────────────────────────────────

  clearMessages() {
    set(ref(db, MESSAGES_REF), null);
  }

  destroy() {
    this._unsubscribers.forEach((fn) => fn && fn());
    this._unsubscribers = [];
    this.setOffline();
    this.listeners = {};
  }
}

export const chatService = new ChatService();
