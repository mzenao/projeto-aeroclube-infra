import { onMounted, onUnmounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useRouter } from "vue-router";
export function useKeyboardShortcuts() {
  const app = useAppStore(),
    router = useRouter();
  function handler(e: KeyboardEvent) {
    if (e.key === "Escape") {
      app.ticketModalOpen = false;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      document.querySelector<HTMLInputElement>("#global-search")?.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
      e.preventDefault();
      app.ticketModalOpen = true;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      app.toggleSidebar();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
      e.preventDefault();
      router.push("/equipamentos?new=1");
    }
  }
  onMounted(() => window.addEventListener("keydown", handler));
  onUnmounted(() => window.removeEventListener("keydown", handler));
}
