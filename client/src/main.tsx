import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const appTitle = import.meta.env.VITE_APP_TITLE || "Promptwise";
const appLogo =
	import.meta.env.VITE_APP_LOGO ||
	"https://placehold.co/128x128/E1E7EF/1F2937?text=App";

document.title = appTitle;

if (appLogo) {
	const setIcon = (rel: "icon" | "apple-touch-icon") => {
		let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;

		if (!link) {
			link = document.createElement("link");
			link.rel = rel;
			document.head.appendChild(link);
		}

		link.href = appLogo;
	};

	setIcon("icon");
	setIcon("apple-touch-icon");
}

const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const analyticsWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;

if (analyticsEndpoint && analyticsWebsiteId) {
	const script = document.createElement("script");
	script.defer = true;
	script.src = `${analyticsEndpoint.replace(/\/$/, "")}/umami`;
	script.dataset.websiteId = analyticsWebsiteId;
	document.body.appendChild(script);
}

createRoot(document.getElementById("root")!).render(<App />);
