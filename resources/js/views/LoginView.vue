<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Eye, EyeOff, ShieldCheck } from "lucide-vue-next";
import logoUrl from "../../../assets/icon.png";
import { storage } from "@/adapters/storage";
const router = useRouter(),
  auth = useAuthStore();
const email = ref(storage.get("rememberEmail", "admin@aeroti.local")),
  password = ref("admin123"),
  remember = ref(true),
  show = ref(false),
  error = ref("");
async function submit() {
  error.value = "";
  if (!email.value || !password.value) {
    error.value = "Preencha o e-mail e a senha.";
    return;
  }
  try {
    await auth.login(email.value, password.value, remember.value);
    router.push("/");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Não foi possível entrar.";
  }
}
</script>
<template>
  <div class="flex min-h-screen min-w-[1000px] bg-slate-100 dark:bg-slate-900">
    <section
      class="relative flex w-[44%] flex-col justify-between overflow-hidden bg-[#12233f] p-12 text-white"
    >
      <div
        class="absolute -bottom-32 -right-24 size-[420px] rounded-full border-[60px] border-white/[.025]"
      />
      <img :src="logoUrl" alt="Aeroclube Juiz de Fora" class="w-64 object-contain"/>
      <div class="relative max-w-md">
        <ShieldCheck class="mb-6 size-10 text-blue-400" />
        <h1 class="text-3xl font-semibold leading-tight">
          Tecnologia organizada para manter o aeroclube em operação.
        </h1>
        <p class="mt-5 text-sm leading-6 text-slate-300">
          Gestão integrada de suporte, ativos, manutenção e infraestrutura em um
          ambiente seguro e centralizado.
        </p>
        <div class="mt-8 flex gap-7 text-xs text-slate-400">
          <span>● Ambiente interno</span><span>● Dados locais</span
          ><span>● Acesso controlado</span>
        </div>
      </div>
      <div class="text-xs text-slate-500">
        Uso exclusivo por funcionários autorizados
      </div>
    </section>
    <section class="flex flex-1 items-center justify-center p-10">
      <form class="w-[390px]" @submit.prevent="submit">
        <div class="mb-8">
          <h2 class="text-2xl font-bold">Bem-vindo ao AeroTI</h2>
          <p class="mt-2 text-sm text-slate-500">
            Gestão de Infraestrutura e Suporte
          </p>
        </div>
        <div
          v-if="error"
          class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {{ error }}
        </div>
        <label class="label">E-mail</label
        ><input
          v-model="email"
          class="field mb-4"
          type="email"
          autocomplete="username"
        /><label class="label">Senha</label>
        <div class="relative">
          <input
            v-model="password"
            class="field pr-10"
            :type="show ? 'text' : 'password'"
            autocomplete="current-password"
          /><button
            type="button"
            class="absolute right-3 top-2.5 text-slate-400"
            @click="show = !show"
          >
            <EyeOff v-if="show" class="size-4" /><Eye v-else class="size-4" />
          </button>
        </div>
        <div class="my-4 flex justify-between text-xs">
          <label class="flex items-center gap-2"
            ><input v-model="remember" type="checkbox" />Lembrar-me</label
          ><button type="button" class="text-blue-600">
            Esqueci minha senha
          </button>
        </div>
        <button class="btn btn-primary h-10 w-full" :disabled="auth.loading">
          {{ auth.loading ? "Entrando..." : "Entrar" }}
        </button>
        <div
          class="mt-5 rounded-md bg-slate-50 p-3 text-center text-[11px] text-slate-500 dark:bg-slate-800"
        >
          <b>Credenciais de demonstração</b><br />admin@aeroti.local · admin123
        </div>
        <div class="mt-8 text-center text-[11px] text-slate-400">
          AeroTI versão 0.1.0 · Protótipo local
        </div>
      </form>
    </section>
  </div>
</template>
