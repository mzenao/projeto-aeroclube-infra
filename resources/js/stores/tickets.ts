import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { TicketService } from "@/services";
import { storage } from "@/adapters/storage";
import type { Ticket } from "@/types";
export const useTicketStore = defineStore("tickets", () => {
  const items = ref(TicketService.list());
  const query = ref("");
  const status = ref("Todos");
  const priority = ref("Todas");
  const filtered = computed(() =>
    items.value.filter(
      (t) =>
        (!query.value ||
          `${t.protocol} ${t.title} ${t.requester}`
            .toLowerCase()
            .includes(query.value.toLowerCase())) &&
        (status.value === "Todos" || t.status === status.value) &&
        (priority.value === "Todas" || t.priority === priority.value),
    ),
  );
  function create(
    data: Omit<Ticket, "id" | "protocol" | "openedAt" | "updatedAt">,
  ) {
    const ticket: Ticket = {
      ...data,
      id: Math.max(0, ...items.value.map((t) => t.id)) + 1,
      protocol: `TI-${String(249 + items.value.length).padStart(4, "0")}`,
      openedAt: "Agora",
      updatedAt: "Agora",
    };
    TicketService.create(ticket);
    items.value = TicketService.list();
    return ticket;
  }
  function update(id: number, patch: Partial<Ticket>) {
    TicketService.update(id, patch);
    items.value = TicketService.list();
  }
  function remove(id: number) {
    items.value = items.value.filter((t) => t.id !== id);
    storage.set("tickets", items.value);
  }
  return { items, query, status, priority, filtered, create, update, remove };
});
