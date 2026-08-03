import "../styles/chat/chat.css";
import { chatService } from "../services/chat.service.js";
import { authService } from "../services/auth.service.js";

// ─── UTILS ──────────────────────────────────────────────────

function escapeHtml(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name[0].toUpperCase();
}

function avatarHTML(name, url, size = 34) {
  const s = `width:${size}px;height:${size}px;border-radius:50%;`;
  if (url) return `<img src="${escapeHtml(url)}" alt="${escapeHtml(name)}" style="${s}object-fit:cover;" loading="lazy">`;
  return `<div class="av-placeholder" style="${s}">${getInitials(name)}</div>`;
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateDivider(ts) {
  const d = new Date(ts);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msgDay = new Date(d);
  msgDay.setHours(0, 0, 0, 0);
  const diff = (today - msgDay) / 86400000;
  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── MAIN PAGE ───────────────────────────────────────────────

export function ChatPage() {
  const page = document.createElement("div");
  page.className = "chat-page";

  const user = authService.getCurrentUser();

  // ── NOT LOGGED IN ──
  if (!user) {
    page.innerHTML = `
      <div class="chat-login-wall">
        <div class="wall-icon">💬</div>
        <h3>Tham gia phòng chat chung</h3>
        <p>Đăng nhập để nhắn tin với mọi người trong cộng đồng Thay Lõi Lọc</p>
        <button class="login-btn" id="go-login">Đăng nhập ngay</button>
      </div>`;
    page.querySelector("#go-login").onclick = () => (window.location.hash = "/login");
    return page;
  }

  // ── STATE ──
  let unsubscribers = [];
  let typingTimer = null;
  let typingUsers = {}; // { userId: { name, timer } }
  let lastSenderId = null;
  let lastDateStr = null;
  let lastSeenCount = 0; // messages user has already seen

  // ── RENDER SKELETON ──
  page.innerHTML = `
    <div class="chat-layout">

      <!-- CHAT ROOM -->
      <div class="chat-room">
        <div class="chat-room-header">
          <div class="chat-room-icon">💬</div>
          <div class="chat-room-title">
            <h3>Phòng Chat Chung</h3>
            <p>Thay Lõi Lọc Community</p>
          </div>
          <div class="online-count-badge" id="online-count">
            <span class="online-dot-live"></span>
            <span id="online-number">1</span> online
          </div>
        </div>

        <div class="chat-messages-area" id="chat-messages"></div>

        <div class="chat-typing-bar" id="chat-typing-bar"></div>

        <div class="chat-input-area">
          <div class="chat-input-wrap">
            <textarea
              class="chat-input"
              id="chat-input"
              placeholder="Nhắn tin tới cộng đồng..."
              rows="1"
            ></textarea>
          </div>
          <button class="chat-send-btn" id="chat-send-btn" disabled title="Gửi (Enter)">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <!-- SIDEBAR: ONLINE -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h4><i class="fas fa-users"></i> Đang online</h4>
        </div>
        <div class="sidebar-users-list" id="online-users-list"></div>
      </div>

    </div>
  `;

  const messagesArea = page.querySelector("#chat-messages");
  const typingBar    = page.querySelector("#chat-typing-bar");
  const input        = page.querySelector("#chat-input");
  const sendBtn      = page.querySelector("#chat-send-btn");
  const onlineNumber = page.querySelector("#online-number");
  const onlineList   = page.querySelector("#online-users-list");

  // ── LOAD HISTORY ──
  function loadHistory() {
    const msgs = chatService.getMessages();
    lastSeenCount = msgs.length;

    if (msgs.length === 0) {
      messagesArea.innerHTML = `
        <div class="chat-system-msg">
          <span>👋 Chào mừng đến phòng chat chung! Hãy bắt đầu cuộc trò chuyện.</span>
        </div>`;
      lastSenderId = null;
      lastDateStr = null;
      return;
    }

    lastSenderId = null;
    lastDateStr = null;

    const fragment = document.createDocumentFragment();
    msgs.forEach((msg) => {
      appendMsgToFragment(fragment, msg);
    });
    messagesArea.appendChild(fragment);
    scrollToBottom(true);
  }

  // ── APPEND A MESSAGE TO A FRAGMENT OR ELEMENT ──
  function appendMsgToFragment(target, msg) {
    const isMine = msg.senderId === user.id;
    const dateStr = formatDateDivider(msg.createdAt);

    // Date divider
    if (dateStr !== lastDateStr) {
      const div = document.createElement("div");
      div.className = "chat-date-divider";
      div.innerHTML = `<span>${dateStr}</span>`;
      target.appendChild(div);
      lastDateStr = dateStr;
      lastSenderId = null; // reset consecutive on date break
    }

    // Consecutive (same sender back-to-back)
    const isConsecutive = lastSenderId === msg.senderId;
    lastSenderId = msg.senderId;

    const el = document.createElement("div");
    el.className = `chat-msg ${isMine ? "mine" : "theirs"}${isConsecutive ? " consecutive" : ""}`;
    el.dataset.msgId = msg.id;

    el.innerHTML = `
      <div class="msg-avatar">
        ${avatarHTML(msg.senderName, msg.senderAvatar, 34)}
      </div>
      <div class="msg-group">
        ${!isConsecutive ? `<div class="msg-sender-name">${escapeHtml(msg.senderName)}</div>` : ""}
        <div class="msg-bubble">${escapeHtml(msg.content)}</div>
        <div class="msg-foot">
          <span class="msg-time">${formatTime(msg.createdAt)}</span>
        </div>
      </div>
    `;

    target.appendChild(el);
  }

  // ── APPEND ONE NEW MESSAGE ──
  function appendNewMessage(msg) {
    const fragment = document.createDocumentFragment();
    appendMsgToFragment(fragment, msg);
    messagesArea.appendChild(fragment);

    const isNearBottom =
      messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight < 140;
    if (isNearBottom || msg.senderId === user.id) {
      scrollToBottom(false);
    } else {
      showNewMsgNotice();
    }
  }

  function scrollToBottom(instant) {
    if (instant) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    } else {
      messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: "smooth" });
    }
  }

  // "Có tin nhắn mới ↓" banner
  let noticeBanner = null;
  function showNewMsgNotice() {
    if (noticeBanner) return;
    noticeBanner = document.createElement("button");
    noticeBanner.className = "new-msg-notice";
    noticeBanner.style.cssText = `
      position:absolute; bottom:80px; left:50%; transform:translateX(-50%);
      background:linear-gradient(135deg,#6366f1,#4f46e5); color:white;
      border:none; border-radius:20px; padding:7px 18px; font-size:0.82rem;
      font-weight:600; cursor:pointer; box-shadow:0 4px 16px rgba(99,102,241,.4);
      z-index:10; white-space:nowrap; animation:msgSlideIn .2s ease;
    `;
    noticeBanner.innerHTML = `<i class="fas fa-arrow-down"></i> Có tin nhắn mới`;
    noticeBanner.onclick = () => {
      scrollToBottom(false);
      removeNotice();
    };
    const chatRoom = page.querySelector(".chat-room");
    chatRoom.style.position = "relative";
    chatRoom.appendChild(noticeBanner);
  }

  function removeNotice() {
    if (noticeBanner) {
      noticeBanner.remove();
      noticeBanner = null;
    }
  }

  messagesArea.addEventListener("scroll", () => {
    const atBottom =
      messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight < 30;
    if (atBottom) removeNotice();
  });

  // ── TYPING INDICATOR ──
  function renderTyping() {
    const who = Object.values(typingUsers);
    if (who.length === 0) {
      typingBar.innerHTML = "";
      return;
    }
    const names = who.map((w) => w.name).join(", ");
    typingBar.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
        <span class="typing-who">${escapeHtml(names)} đang nhập...</span>
      </div>`;
  }

  // ── ONLINE USERS ──
  function renderOnlineUsers() {
    const all = chatService.getOnlineUsers();
    onlineNumber.textContent = all.length;

    if (all.length === 0) {
      onlineList.innerHTML = `<div class="sidebar-empty">Chưa có ai online</div>`;
      return;
    }

    onlineList.innerHTML = all
      .map((u) => {
        const isMe = u.id === user.id;
        return `
        <div class="sidebar-user-item">
          <div class="sidebar-user-av" style="position:relative;">
            ${avatarHTML(u.name, u.avatar, 34)}
            <span class="sidebar-online-dot"></span>
          </div>
          <div>
            <div class="sidebar-user-name">${escapeHtml(u.name)}</div>
            ${isMe ? `<div class="sidebar-you-badge">Bạn</div>` : ""}
          </div>
        </div>`;
      })
      .join("");
  }

  // ── SEND MESSAGE ──
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    try {
      chatService.sendMessage(text);
    } catch (e) {
      console.error(e);
    }
    input.value = "";
    input.style.height = "auto";
    sendBtn.disabled = true;
    chatService.sendTyping(false);
    clearTimeout(typingTimer);
  }

  // ── INPUT EVENTS ──
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
    sendBtn.disabled = !input.value.trim();

    chatService.sendTyping(true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => chatService.sendTyping(false), 2500);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // ── REALTIME SUBSCRIPTIONS ──
  unsubscribers.push(
    chatService.on("new_message", (msg) => {
      appendNewMessage(msg);
      lastSeenCount++;
    })
  );

  unsubscribers.push(
    chatService.on("typing", (data) => {
      if (data.userId === user.id) return;
      if (data.isTyping) {
        // Clear existing timer for this user
        if (typingUsers[data.userId]?.timer) {
          clearTimeout(typingUsers[data.userId].timer);
        }
        typingUsers[data.userId] = {
          name: data.userName,
          timer: setTimeout(() => {
            delete typingUsers[data.userId];
            renderTyping();
          }, 3500),
        };
      } else {
        if (typingUsers[data.userId]?.timer) {
          clearTimeout(typingUsers[data.userId].timer);
        }
        delete typingUsers[data.userId];
      }
      renderTyping();
    })
  );

  unsubscribers.push(
    chatService.on("user_status", () => {
      renderOnlineUsers();
    })
  );

  // ── INIT ──
  loadHistory();
  renderOnlineUsers();

  // Ping online status periodically
  const onlinePing = setInterval(() => {
    chatService._syncCurrentUser && chatService._syncCurrentUser();
    renderOnlineUsers();
  }, 30000);

  // ── CLEANUP when page removed from DOM ──
  const obs = new MutationObserver(() => {
    if (!document.contains(page)) {
      unsubscribers.forEach((fn) => fn());
      clearTimeout(typingTimer);
      clearInterval(onlinePing);
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return page;
}
