"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Save,
  Lock,
  LogOut,
  Trash2,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { updateProfile, changePassword, logout } from "@/lib/auth"

function FeedbackMsg({ msg }: { msg: { type: "ok" | "err"; text: string } }) {
  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md ${
      msg.type === "ok"
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        : "bg-red-500/10 text-red-400 border border-red-500/20"
    }`}>
      {msg.type === "ok" ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
      {msg.text}
    </div>
  )
}

export default function SettingsPage() {
  const { user, loading: authLoading, refresh } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passSaving, setPassSaving] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const isOAuth = !!user?.oauth_provider
  const provider = user?.oauth_provider ?? null

  const handleSaveProfile = async () => {
    setProfileMsg(null)
    setProfileSaving(true)
    try {
      const updates: { name?: string; email?: string } = {}
      if (name !== user?.name) updates.name = name
      if (!isOAuth && email !== user?.email) updates.email = email
      if (Object.keys(updates).length === 0) {
        setProfileMsg({ type: "ok", text: "Sem alterações." })
        setProfileSaving(false)
        return
      }
      await updateProfile(updates)
      await refresh()
      setProfileMsg({ type: "ok", text: "Perfil atualizado." })
    } catch (err: any) {
      setProfileMsg({ type: "err", text: err?.message || "Erro ao guardar." })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPassMsg(null)
    if (newPass.length < 8) {
      setPassMsg({ type: "err", text: "A nova password deve ter pelo menos 8 caracteres." })
      return
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: "err", text: "As passwords não coincidem." })
      return
    }
    setPassSaving(true)
    try {
      await changePassword(currentPass, newPass)
      setCurrentPass("")
      setNewPass("")
      setConfirmPass("")
      setPassMsg({ type: "ok", text: "Password alterada." })
    } catch (err: any) {
      setPassMsg({ type: "err", text: err?.message || "Erro ao alterar password." })
    } finally {
      setPassSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gere o teu perfil e conta</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <section className="rounded-lg border border-border/60 bg-card">
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
              Perfil
            </h2>
            {provider && (
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                <Shield className="w-3 h-3 inline mr-1" />
                {provider === "google" ? "Google" : "GitHub"}
              </span>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  disabled={isOAuth}
                  className="h-9 text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {profileMsg && <FeedbackMsg msg={profileMsg} />}

            <Button onClick={handleSaveProfile} disabled={profileSaving} size="sm" className="gap-1.5 h-8">
              {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Guardar
            </Button>
          </div>
        </section>

        {/* Password */}
        {!isOAuth && (
          <section className="rounded-lg border border-border/60 bg-card">
            <div className="px-5 py-4 border-b border-border/40">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </h2>
            </div>

            <div className="p-5 space-y-4 max-w-sm">
              <div className="relative">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Atual</label>
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-[1.85rem] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nova password</label>
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-[1.85rem] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirmar</label>
                <Input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {passMsg && <FeedbackMsg msg={passMsg} />}

              <Button
                onClick={handleChangePassword}
                disabled={passSaving || !currentPass || !newPass || !confirmPass}
                size="sm"
                variant="outline"
                className="gap-1.5 h-8"
              >
                {passSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Alterar password
              </Button>
            </div>
          </section>
        )}

        {/* OAuth info */}
        {isOAuth && (
          <section className="rounded-lg border border-border/60 bg-card">
            <div className="px-5 py-4 border-b border-border/40">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Segurança
              </h2>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                A tua conta está ligada ao <span className="text-foreground font-medium">{provider === "google" ? "Google" : "GitHub"}</span>.
                A autenticação é gerida pelo provider externo.
              </p>
            </div>
          </section>
        )}

        {/* Account */}
        <section className="rounded-lg border border-border/60 bg-card">
          <div className="px-5 py-4 border-b border-border/40">
            <h2 className="text-sm font-medium">Conta</h2>
          </div>
          <div className="p-5 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="w-3.5 h-3.5" />
              Terminar sessão
            </Button>
            <button className="w-full px-3 py-2 h-9 rounded-md border border-red-500/20 text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors text-xs font-medium flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar conta
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
