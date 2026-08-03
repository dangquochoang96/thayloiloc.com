/**
 * ChatWidget — Floating chat popup
 * - Desktop: popup nhỏ góc phải
 * - Mobile: full screen overlay
 * - Firebase Realtime Database backend
 */
import "../styles/chat/chat.css";
import { chatService } from "../services/chat.service.js";
import { authService } from "../services/auth.service.js";

// ─── UTILS ──────────────────────────────────────────

function esc(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return p.length > 1
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name[0].toUpperCase();
}

function avHTML(name, url, size = 28) {
  if (url)
    return `<img src="${esc(url)}" alt="${esc(name)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;" loading="lazy">`;
  return `<div class="av-ph" style="width:${size}px;height:${size}px;border-radius:50%;">${initials(name)}</div>`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dDay = new Date(d);
  dDay.setHours(0, 0, 0, 0);
  const diff = (today - dDay) / 86400000;
  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Hôm qua";
  return d.toLocaleDateString("vi-VN");
}

// ─── WIDGET FACTORY ─────────────────────────────────

export function ChatWidget() {
  // Tránh tạo trùng
  if (document.getElementById("chat-widget-root")) return;

  const isMobile = () => window.innerWidth <= 640;
  let isOpen = false;
  let unsubscribers = [];
  let unsubFirebase = null; // Firebase unsubscribe function
  let typingUsers = {};
  let lastSenderId = null;
  let lastDateStr = null;
  let typingTimers = {};
  let typingTimer = null;
  let newMsgNotice = null;
  let unreadCount = 0;

  const user = authService.getCurrentUser();

  // ── ROOT WRAPPER ──
  const root = document.createElement("div");
  root.id = "chat-widget-root";

  // ── TOGGLE BUTTON ──
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "chat-widget-toggle";
  toggleBtn.title = "Chat cộng đồng";
  toggleBtn.setAttribute("aria-label", "Mở/đóng chat");
  toggleBtn.innerHTML = `
    <span class="toggle-icon icon-open"><i class="fas fa-comment-dots"></i></span>
    <span class="toggle-icon icon-close"><i class="fas fa-times"></i></span>
    <span class="toggle-text">Chat</span>
  `;

  // ── WIDGET POPUP ──
  const widget = document.createElement("div");
  widget.className = "chat-widget";
  widget.setAttribute("role", "dialog");
  widget.setAttribute("aria-label", "Phòng chat chung");

  widget.innerHTML = `
    <div class="cw-header">
      <div class="cw-header-icon">💬</div>
      <div class="cw-header-info">
        <h4>Chat Cộng Đồng</h4>
        <p>Thay Lõi Lọc</p>
      </div>
      <div class="cw-online" id="cw-online">
        <span class="cw-online-dot"></span>
        <span id="cw-online-num">1</span> online
      </div>
      <div class="cw-header-actions">
        <button class="cw-btn" id="cw-close-btn" title="Đóng chat" aria-label="Đóng">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
    </div>

    <div id="cw-body"></div>
  `;

  root.appendChild(toggleBtn);
  root.appendChild(widget);
  document.body.appendChild(root);

  const cwBody = widget.querySelector("#cw-body");
  const onlineNum = widget.querySelector("#cw-online-num");

  // ─── OPEN / CLOSE ──────────────────────────────────

  function open() {
    isOpen = true;
    widget.classList.add("is-open");
    toggleBtn.classList.add("is-open");
    if (isMobile()) {
      document.body.classList.add("chat-widget-open");
      toggleBtn.style.display = "none";
    }
    clearUnread();
    renderBody();
  }

  function close() {
    isOpen = false;
    widget.classList.remove("is-open");
    toggleBtn.classList.remove("is-open");
    document.body.classList.remove("chat-widget-open");
    if (isMobile()) {
      toggleBtn.style.display = "flex";
    }
    // Cleanup event listeners
    unsubscribers.forEach((fn) => fn());
    unsubscribers = [];
    // Cleanup Firebase listeners
    if (unsubFirebase) { unsubFirebase(); unsubFirebase = null; }
    // Set offline
    chatService.setOffline();
  }

  function toggle() {
    isOpen ? close() : open();
  }

  toggleBtn.addEventListener("click", toggle);
  widget.querySelector("#cw-close-btn").addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) close();
  });

  // ─── UNREAD COUNT ──────────────────────────────────

  function addUnread() {
    if (isOpen) return;
    unreadCount++;
    let badge = toggleBtn.querySelector(".chat-toggle-unread");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "chat-toggle-unread";
      toggleBtn.appendChild(badge);
    }
    badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
  }

  function clearUnread() {
    unreadCount = 0;
    const badge = toggleBtn.querySelector(".chat-toggle-unread");
    if (badge) badge.remove();
  }

  // ─── RENDER BODY ───────────────────────────────────

  function renderBody() {
    cwBody.innerHTML = "";
    cwBody.style.cssText = "flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;";

    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      // ── NOT LOGGED IN ──
      cwBody.innerHTML = `
        <div class="cw-login-wall">
          <div class="cw-wall-icon">💬</div>
          <h4>Tham gia chat cộng đồng</h4>
          <p>Đăng nhập để nhắn tin với mọi người</p>
          <button class="cw-login-btn" id="cw-go-login">Đăng nhập ngay</button>
        </div>`;
      cwBody.querySelector("#cw-go-login").onclick = () => {
        close();
        window.location.hash = "/login";
      };
      return;
    }

    // ── CHAT ROOM ──
    cwBody.innerHTML = `
      <div class="cw-messages" id="cw-messages">
        <div class="cw-loading" id="cw-loading">
          <div class="cw-loading-dots">
            <div class="cw-typing-dot"></div>
            <div class="cw-typing-dot"></div>
            <div class="cw-typing-dot"></div>
          </div>
          <span>Đang tải tin nhắn...</span>
        </div>
      </div>
      <div class="cw-typing" id="cw-typing"></div>
      <div class="cw-input-area">
        <div class="cw-input-wrap">
          <textarea
            class="cw-input"
            id="cw-input"
            placeholder="Nhắn tin cho cộng đồng..."
            rows="1"
            autocomplete="off"
          ></textarea>
        </div>
        <button class="cw-send-btn" id="cw-send" disabled>
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    `;

    const msgArea   = cwBody.querySelector("#cw-messages");
    const typingBar = cwBody.querySelector("#cw-typing");
    const input     = cwBody.querySelector("#cw-input");
    const sendBtn   = cwBody.querySelector("#cw-send");

    // Reset render state
    lastSenderId = null;
    lastDateStr  = null;

    // ── SET ONLINE ──
    chatService.setOnline();

    // ── SUBSCRIBE TO FIREBASE ──
    chatService.subscribe().then((unsub) => {
      unsubFirebase = unsub;
    });

    // ── MESSAGES LOADED (lịch sử) ──
    const unsubLoaded = chatService.on("messages_loaded", (msgs) => {
      const loading = msgArea.querySelector("#cw-loading");
      if (loading) loading.remove();

      if (msgs.length === 0) {
        msgArea.innerHTML = `
          <div class="cw-system-msg">
            <span>👋 Hãy là người đầu tiên nhắn tin!</span>
          </div>`;
      } else {
        const frag = document.createDocumentFragment();
        msgs.forEach((m) => appendToFrag(frag, m, currentUser.id));
        msgArea.appendChild(frag);
        setTimeout(() => scrollBottom(msgArea, true), 50);
      }
      renderOnline();
    });
    unsubscribers.push(unsubLoaded);

    // ── NEW MESSAGE (realtime) ──
    const unsubMsg = chatService.on("new_message", (msg) => {
      if (!isOpen) { addUnread(); return; }

      // Xóa placeholder "Hãy là người đầu tiên"
      const placeholder = msgArea.querySelector(".cw-system-msg");
      if (placeholder) placeholder.remove();

      const frag = document.createDocumentFragment();
      appendToFrag(frag, msg, currentUser.id);
      msgArea.appendChild(frag);

      const atBottom =
        msgArea.scrollHeight - msgArea.scrollTop - msgArea.clientHeight < 140;

      if (atBottom || String(msg.senderId) === String(currentUser.id)) {
        scrollBottom(msgArea, false);
      } else {
        showNewMsgNotice();
      }
    });
    unsubscribers.push(unsubMsg);

    // ── TYPING ──
    const unsubTyping = chatService.on("typing", (data) => {
      if (String(data.userId) === String(currentUser.id)) return;
      if (data.isTyping) {
        clearTimeout(typingTimers[data.userId]);
        typingUsers[data.userId] = data.userName;
        typingTimers[data.userId] = setTimeout(() => {
          delete typingUsers[data.userId];
          renderTyping(typingBar);
        }, 3500);
      } else {
        clearTimeout(typingTimers[data.userId]);
        delete typingUsers[data.userId];
      }
      renderTyping(typingBar);
    });
    unsubscribers.push(unsubTyping);

    // ── ONLINE STATUS ──
    const unsubStatus = chatService.on("user_status", () => renderOnline());
    unsubscribers.push(unsubStatus);

    // ── INPUT HANDLERS ──
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 100) + "px";
      sendBtn.disabled = !input.value.trim();
      chatService.sendTyping(true);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => chatService.sendTyping(false), 2500);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        doSend(currentUser, input, sendBtn);
      }
    });

    sendBtn.addEventListener("click", () => doSend(currentUser, input, sendBtn));

    // ── SCROLL to hide notice ──
    msgArea.addEventListener("scroll", () => {
      const atBottom =
        msgArea.scrollHeight - msgArea.scrollTop - msgArea.clientHeight < 30;
      if (atBottom && newMsgNotice) {
        newMsgNotice.remove();
        newMsgNotice = null;
      }
    });

    // ── FOCUS input ──
    setTimeout(() => input.focus(), 100);

    // ── NEW MSG NOTICE ──
    function showNewMsgNotice() {
      if (newMsgNotice) return;
      newMsgNotice = document.createElement("button");
      newMsgNotice.className = "cw-new-msg-notice";
      newMsgNotice.innerHTML = `<i class="fas fa-arrow-down"></i> Có tin nhắn mới`;
      newMsgNotice.onclick = () => {
        scrollBottom(msgArea, false);
        if (newMsgNotice) { newMsgNotice.remove(); newMsgNotice = null; }
      };
      widget.style.position = "relative";
      widget.appendChild(newMsgNotice);
    }
  }

  // ─── SEND ─────────────────────────────────────────

  async function doSend(currentUser, input, sendBtn) {
    const text = input.value.trim();
    if (!text) return;

    sendBtn.disabled = true;
    input.value = "";
    input.style.height = "auto";
    chatService.sendTyping(false);
    clearTimeout(typingTimer);

    try {
      await chatService.sendMessage(text);
    } catch (e) {
      console.error("[Chat] send error:", e);
      // Khôi phục input nếu gửi lỗi
      input.value = text;
      sendBtn.disabled = false;
    }
  }

  // ─── APPEND MESSAGE ───────────────────────────────

  function appendToFrag(target, msg, myId) {
    const isMine  = String(msg.senderId) === String(myId);
    const dateStr = fmtDate(msg.createdAt);

    if (dateStr !== lastDateStr) {
      const divEl = document.createElement("div");
      divEl.className = "cw-date-divider";
      divEl.innerHTML = `<span>${dateStr}</span>`;
      target.appendChild(divEl);
      lastDateStr  = dateStr;
      lastSenderId = null;
    }

    const isConsec = lastSenderId === msg.senderId;
    lastSenderId = msg.senderId;

    const el = document.createElement("div");
    el.className = `cw-msg ${isMine ? "mine" : "theirs"}${isConsec ? " consecutive" : ""}`;

    el.innerHTML = `
      <div class="cw-avatar">${avHTML(msg.senderName, msg.senderAvatar, 28)}</div>
      <div class="cw-msg-group">
        ${!isConsec ? `<div class="cw-sender">${esc(msg.senderName)}</div>` : ""}
        <div class="cw-bubble">${esc(msg.content)}</div>
        <div class="cw-msg-time">${fmtTime(msg.createdAt)}</div>
      </div>
    `;

    target.appendChild(el);
  }

  // ─── TYPING ───────────────────────────────────────

  function renderTyping(typingBar) {
    if (!typingBar) return;
    const who = Object.values(typingUsers);
    if (who.length === 0) {
      typingBar.innerHTML = "";
      return;
    }
    const names = who.slice(0, 2).join(", ") + (who.length > 2 ? "..." : "");
    typingBar.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;animation:cwMsgIn .2s ease;">
        <div class="cw-typing-dots">
          <div class="cw-typing-dot"></div>
          <div class="cw-typing-dot"></div>
          <div class="cw-typing-dot"></div>
        </div>
        <span class="cw-typing-who">${esc(names)} đang nhập...</span>
      </div>`;
  }

  // ─── ONLINE ───────────────────────────────────────

  function renderOnline() {
    const all = chatService.getOnlineUsers();
    if (onlineNum) onlineNum.textContent = Math.max(all.length, 1);
  }

  // ─── SCROLL ───────────────────────────────────────

  function scrollBottom(el, instant) {
    if (!el) return;
    if (instant) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }

  // ─── GLOBAL: badge khi nhận tin lúc chat đóng ─────
  const globalMsg = chatService.on("new_message", () => {
    if (!isOpen) addUnread();
    renderOnline();
  });

  const pingInterval = setInterval(renderOnline, 30000);

  // ─── CLEANUP on body remove ───────────────────────
  const obs = new MutationObserver(() => {
    if (!document.contains(root)) {
      unsubscribers.forEach((fn) => fn());
      if (unsubFirebase) unsubFirebase();
      globalMsg();
      clearInterval(pingInterval);
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true });

  // ─── INITIAL ONLINE RENDER ────────────────────────
  renderOnline();
}
