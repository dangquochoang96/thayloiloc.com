import "../styles/components/bottom-nav.css";

export function BottomNav() {
  const nav = document.createElement("nav");
  nav.className = "bottom-nav-mobile";
  nav.id = "global-bottom-nav";

  const links = [
    { href: "#/", icon: "fas fa-house", label: "Trang chủ", patterns: ["#/", ""] },
    { href: "#/services-quotation", icon: "fas fa-toolbox", label: "Dịch vụ", patterns: ["#/services-quotation", "#/services-quotation-detail"] },
    { href: "#/services", icon: "fas fa-wrench", label: "Thiết bị", patterns: ["#/services", "#/product-filter-history", "#/filter-history-detail"] },
    { href: "#/booking-history", icon: "fas fa-clock-rotate-left", label: "Hoạt động", patterns: ["#/booking-history", "#/booking", "#/booking-detail"] },
    { href: "#/profile", icon: "fas fa-user", label: "Cá nhân", patterns: ["#/profile", "#/login", "#/register"] },
  ];

  const updateActiveLink = () => {
    const rawHash = window.location.hash || "#/";
    const currentPath = rawHash.split("?")[0].trim() || "#/";

    nav.querySelectorAll(".bottom-nav-item").forEach((item) => {
      const targetHref = item.getAttribute("href");
      const linkConfig = links.find((l) => l.href === targetHref);

      if (!linkConfig) return;

      const isMatch = linkConfig.patterns.some((p) => {
        if (!p || p === "#/") return currentPath === "#/" || currentPath === "";
        return currentPath === p || currentPath.startsWith(p + "/");
      });

      if (isMatch) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  };

  nav.innerHTML = links
    .map(
      (l) => `
    <a href="${l.href}" class="bottom-nav-item">
      <i class="${l.icon}"></i>
      <span>${l.label}</span>
    </a>
  `
    )
    .join("");

  window.addEventListener("hashchange", updateActiveLink);
  setTimeout(updateActiveLink, 0);

  return nav;
}
