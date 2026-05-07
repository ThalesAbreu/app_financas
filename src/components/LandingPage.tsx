"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  PieChart,
  Download,
  Search,
  TrendingUp,
  ShieldCheck,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle2,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: PieChart,
    title: "Dashboard visual",
    description:
      "Gráfico de pizza mostrando suas despesas por categoria. Entenda onde seu dinheiro vai de verdade.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Wallet,
    title: "Controle completo",
    description:
      "Adicione, edite e exclua transações com facilidade. Suporte a receitas e despesas com categorias pré-definidas.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Search,
    title: "Filtros inteligentes",
    description:
      "Filtre por mês, categoria ou faça buscas por descrição. Encontre qualquer lançamento em segundos.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Download,
    title: "Exportação CSV",
    description:
      "Baixe suas transações do mês em formato CSV compatível com Excel com um único clique.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    icon: TrendingUp,
    title: "Resumo financeiro",
    description:
      "Cards com total de receitas, despesas e saldo do mês. Saiba sua situação financeira num relance.",
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: ShieldCheck,
    title: "Dados protegidos",
    description:
      "Autenticação segura com Supabase e políticas RLS. Somente você acessa seus dados financeiros.",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
];

const steps = [
  { number: "01", title: "Crie sua conta", description: "Cadastro rápido com e-mail e senha. Gratuito." },
  { number: "02", title: "Adicione transações", description: "Registre receitas e despesas com categoria e data." },
  { number: "03", title: "Visualize seus dados", description: "Acompanhe gráficos e resumos atualizados em tempo real." },
];

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <header className="border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">FinançasPRO</span>
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Alternar tema"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Cadastrar grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-blue-950/30 dark:via-gray-950 dark:to-gray-950" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1 rounded-full mb-6 border border-blue-100 dark:border-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Gratuito para usar
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Suas finanças,{" "}
            <span className="text-blue-600 dark:text-blue-400">sob controle.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Acompanhe receitas e despesas em um só lugar. Visualize gráficos por categoria, filtre por mês e exporte seus dados com facilidade.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-semibold shadow-lg shadow-blue-600/20">
                Começar agora — é grátis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base dark:border-gray-700 dark:text-gray-300">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Tudo que você precisa
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg">
              Funcionalidades pensadas para simplificar sua vida financeira.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Como funciona
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg">
              Comece a controlar suas finanças em menos de 2 minutos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gray-200 dark:bg-gray-800" />
                )}
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para organizar suas finanças?
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Crie sua conta agora e tenha controle total sobre seu dinheiro.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-10 h-12 text-base font-semibold shadow-lg"
            >
              Criar conta gratuita
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-gray-600 dark:text-gray-400">FinançasPRO</span>
          </div>
          <p>Controle financeiro simples e eficiente.</p>
        </div>
      </footer>
    </div>
  );
}
