import "./styles/main.css";
import "./utils/navigation.js"; // Import global navigation functions
import { Router } from "./utils/router.js";
import { ensureFontAwesome } from "./utils/icons.js";
import { HomePage } from "./pages/HomePage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { PromoRegisterPage } from "./pages/PromoRegisterPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { BookingPage } from "./pages/BookingPage.js";
import { BookingHistoryPage } from "./pages/BookingHistoryPage.js";
import { BookingDetailPage } from "./pages/BookingDetailPage.js";
import { ProductFilterHistoryPage } from "./pages/ProductFilterHistoryPage.js";
import { FilterHistoryDetailPage } from "./pages/FilterHistoryDetailPage.js";
import { ServicesPage } from "./pages/ServicesPage.js";
import { TrainingContentPage } from "./pages/TrainingContentPage.js";
import { CheckProcessPage } from "./pages/CheckProcessPage.js";
import { MaintenanceProcessPage } from "./pages/MaintenanceProcessPage.js";
import { FilterReplacementPage } from "./pages/FilterReplacementPage.js";
import { NewsPage } from "./pages/NewsPage.js";
import { NewsDetailPage } from "./pages/NewsDetailPage.js";
import { VideoPage } from "./pages/VideoPage.js";
import { HotlinePage } from "./pages/HotlinePage.js";
import { TechnicianDetailPage } from "./pages/TechnicianDetailPage.js";
import { ContactPage } from "./pages/ContactPage.js";
import { QnAPage } from "./pages/QnAPage.js";
import { QnADetailPage } from "./pages/QnADetailPage.js";
import { RentWaterPurifierPage } from "./pages/RentWaterPurifierPage.js";
import { BookingRentPage } from "./pages/BookingRentPage.js";
import { LapdatPage } from "./pages/Lapdat.js";
import { ServiceQuotationPage } from "./pages/ServiceQuotationPage.js";
import { ServiceDetailPage } from "./pages/ServiceDetailPage.js";
import { FeedbackPage } from "./pages/FeedbackPage.js";
import { FloatingButton } from "./components/FloatingButton.js";
import { ChatWidget } from "./components/ChatWidget.js";
import { BottomNav } from "./components/BottomNav.js";

const routes = {
  "/": {
    render: HomePage,
  },
  "/login": {
    render: LoginPage,
  },
  "/register": {
    render: RegisterPage,
  },
  "/feedback": {
    render: FeedbackPage,
  },
  "/promo-register/:staffId": {
    render: PromoRegisterPage,
  },
  "/profile": {
    render: ProfilePage,
  },
  "/services": {
    render: ServicesPage,
  },
  "/services-quotation": {
    render: ServiceQuotationPage,
  },
  "/services-quotation-detail": {
    render: ServiceDetailPage,
  },
  "/services-quotation-detail/:id": {
    render: ServiceDetailPage,
  },
  "/news": {
    render: NewsPage,
  },
  "/news/:id": {
    render: NewsDetailPage,
  },
  "/video": {
    render: VideoPage,
  },
  "/booking": {
    render: BookingPage,
  },
  "/booking-history": {
    render: BookingHistoryPage,
  },
  "/booking-detail": {
    render: BookingDetailPage,
  },
  "/product-filter-history": {
    render: ProductFilterHistoryPage,
  },
  "/product-filter-history/:id": {
    render: ProductFilterHistoryPage,
  },
  "/filter-history-detail": {
    render: FilterHistoryDetailPage,
  },
  "/training-content": {
    render: TrainingContentPage,
  },
  "/check-process": {
    render: CheckProcessPage,
  },
  "/maintenance-process": {
    render: MaintenanceProcessPage,
  },
  "/filter-replacement": {
    render: FilterReplacementPage,
  },
  "/lapdat": {
    render: LapdatPage,
  },
  "/hotline": {
    render: HotlinePage,
  },
  "/technician-detail": {
    render: TechnicianDetailPage,
  },
  "/technician-detail/:id": {
    render: TechnicianDetailPage,
  },
  "/contact": {
    render: ContactPage,
  },
  "/qna": {
    render: QnAPage,
  },
  "/qna/:id": {
    render: QnADetailPage,
  },
  "/rent-water-purifier": {
    render: RentWaterPurifierPage,
  },
  "/bookingrent": {
    render: BookingRentPage,
  },
  "*": {
    render: () => {
      const el = document.createElement("div");
      el.innerHTML =
        '<h1 style="text-align:center; padding: 2rem;">404 - Page Not Found</h1>';
      return el;
    },
  },
};

// Ensure Font Awesome is loaded before starting the router
ensureFontAwesome()
  .then(() => {
    
    // Add floating button to the body once
    const existingFloatingButton = document.querySelector(".floating-buttons");
    if (!existingFloatingButton) {
      const floatingButton = FloatingButton();
      document.body.appendChild(floatingButton);
    }

    // Add chat widget (floating popup)
    if (!document.getElementById("chat-widget-root")) {
      ChatWidget();
    }

    // Add global bottom mobile navigation
    if (!document.getElementById("global-bottom-nav")) {
      document.body.appendChild(BottomNav());
    }

    new Router(routes);
  })
  .catch((error) => {
    console.warn("Font Awesome failed to load, continuing anyway:", error);

    // Add floating button to the body once
    const existingFloatingButton = document.querySelector(".floating-buttons");
    if (!existingFloatingButton) {
      const floatingButton = FloatingButton();
      document.body.appendChild(floatingButton);
    }

    // Add chat widget (floating popup)
    if (!document.getElementById("chat-widget-root")) {
      ChatWidget();
    }

    // Add global bottom mobile navigation
    if (!document.getElementById("global-bottom-nav")) {
      document.body.appendChild(BottomNav());
    }

    new Router(routes);
  });
