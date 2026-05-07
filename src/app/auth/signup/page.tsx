"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, TrendingUp, Mail, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error("Erro ao criar conta", { description: error.message });
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  async function handleResend() {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });

    if (error) {
      toast.error("Não foi possível reenviar", { description: error.message });
    } else {
      toast.success("E-mail reenviado!", { description: "Verifique sua caixa de entrada." });
    }
    setResending(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FinançasPRO</h1>
        </div>

        {done ? (
          <Card className="shadow-lg border-0">
            <CardContent className="pt-8 pb-8 text-center space-y-5">
              <div className="flex justify-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                  <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conta criada!</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Enviamos um link de confirmação para:
                </p>
                <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm break-all">
                  {email}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                  📧 Próximo passo:
                </p>
                <ol className="text-sm text-amber-700 dark:text-amber-500 space-y-1 list-decimal list-inside">
                  <li>Abra seu e-mail (<span className="font-medium">{email}</span>)</li>
                  <li>Clique no link &quot;Confirmar cadastro&quot;</li>
                  <li>Volte aqui e faça login</li>
                </ol>
                <p className="text-xs text-amber-600 dark:text-amber-600 mt-2">
                  Não encontrou? Verifique a pasta de spam ou lixo eletrônico.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link href="/auth/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Ir para o login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full"
                >
                  {resending
                    ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Reenviando...</>
                    : "Reenviar e-mail de confirmação"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Criar conta gratuita</CardTitle>
              <CardDescription>Comece a controlar suas finanças hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar conta
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Entrar
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
