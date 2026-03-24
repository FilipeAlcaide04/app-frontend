"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Save,
  Mail,
  Lock,
  Bell,
  Palette,
  LogOut,
  Trash2,
  ArrowRight,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold mb-6">Perfil</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <Input placeholder="Seu nome" defaultValue="João Silva" className="text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  placeholder="seu@email.com"
                  type="email"
                  defaultValue="joao@example.com"
                  className="text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  placeholder="Conta um pouco sobre ti..."
                  defaultValue="Entusiasta de IA e desenvolvimento de software"
                  className="w-full px-4 py-3 rounded-lg glass-subtle border border-white/10 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={4}
                />
              </div>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Guardar Alterações
              </Button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold mb-6">Segurança</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all group">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">Alterar Palavra-passe</p>
                    <p className="text-xs text-muted-foreground/70">Última alteração há 3 meses</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all group">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">Autenticação de Dois Fatores</p>
                    <p className="text-xs text-muted-foreground/70">Desativado</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all group">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">Sessões Ativas</p>
                    <p className="text-xs text-muted-foreground/70">2 dispositivos conectados</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold mb-6">Notificações</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                <div>
                  <p className="font-medium text-sm">Alertas de Agente</p>
                  <p className="text-xs text-muted-foreground/70">Notificações sobre desempenho dos agentes</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                <div>
                  <p className="font-medium text-sm">Atualizações do Sistema</p>
                  <p className="text-xs text-muted-foreground/70">Novas versões e features</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded" />
                <div>
                  <p className="font-medium text-sm">Newsletters</p>
                  <p className="text-xs text-muted-foreground/70">Dicas e melhores práticas</p>
                </div>
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold mb-6">Aparência</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm mb-3">Tema</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-primary/20 border-2 border-primary text-primary font-medium">
                    Escuro
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                    Claro
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                    Sistema
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold mb-6">Conta</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <LogOut className="w-4 h-4" />
                Terminar Sessão
              </Button>
              <button className="w-full px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-medium flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Eliminar Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
