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
  const pending=ref(false),month=ref(false);
  const filtered = computed(() =>
    items.value.filter(
      (t) =>
        (!query.value ||
            `${t.protocol} ${t.title} ${t.requester} ${t.equipment}`
            .toLowerCase()
            .includes(query.value.toLowerCase())) &&
        (status.value === "Todos" || t.status === status.value) &&
        (priority.value === "Todas" || t.priority === priority.value) &&
        (!pending.value || !['Resolvido','Cancelado'].includes(t.status)) &&
        (!month.value || (!!t.resolvedAt && new Date(t.resolvedAt).getMonth()===new Date().getMonth() && new Date(t.resolvedAt).getFullYear()===new Date().getFullYear())),
    ),
  );
  function create(
    data: Omit<Ticket, "id" | "protocol" | "openedAt" | "updatedAt">,
  ) {
    const ticket: Ticket = {
      ...data,
      ...TicketService.nextIdentity(),
      openedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{id:crypto.randomUUID(),author:storage.get<{name:string}>('session',{name:'Equipe de TI'}).name,description:`Chamado criado via ${data.channel}`,at:new Date().toISOString()}],
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
    TicketService.remove(id);
    items.value = TicketService.list();
  }
  return { items, query, status, priority, pending, month, filtered, create, update, remove };
});
