"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users, Search, Shield, UserCheck, UserX, Trash2, Edit2,
  MoreVertical, RefreshCw, Clock, Mail, ChevronDown,
} from "lucide-react"
import {
  User, adminGetUsers, adminUpdateUser, adminDeleteUser,
} from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminGetUsers()
      setUsers(data.users)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleActive = async (user: User) => {
    setActionLoading(user.id)
    try {
      await adminUpdateUser(user.id, { is_active: !user.is_active } as any)
      await fetchUsers()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangeRole = async (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin"
    setActionLoading(user.id)
    try {
      await adminUpdateUser(user.id, { role: newRole } as any)
      await fetchUsers()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Tens a certeza que queres remover ${user.name} (${user.email})?`)) return
    setActionLoading(user.id)
    try {
      await adminDeleteUser(user.id)
      await fetchUsers()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role })
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setActionLoading(editingUser.id)
    try {
      await adminUpdateUser(editingUser.id, editForm as any)
      setEditingUser(null)
      await fetchUsers()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Nunca"
    const d = new Date(dateStr)
    return d.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === "admin").length,
    inactive: users.filter((u) => !u.is_active).length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Gestão de Utilizadores
        </h1>
        <p className="text-muted-foreground mt-1">
          Gere as contas e permissões dos utilizadores da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<Users className="w-4 h-4" />}
          color="text-primary"
          bgColor="bg-primary/10 border-primary/20"
        />
        <StatCard
          label="Activos"
          value={stats.active}
          icon={<UserCheck className="w-4 h-4" />}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          icon={<Shield className="w-4 h-4" />}
          color="text-amber-400"
          bgColor="bg-amber-500/10 border-amber-500/20"
        />
        <StatCard
          label="Inactivos"
          value={stats.inactive}
          icon={<UserX className="w-4 h-4" />}
          color="text-red-400"
          bgColor="bg-red-500/10 border-red-500/20"
        />
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          className="gap-2 h-10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-card/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Utilizador
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Estado
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Último Login
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Criado
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Acções
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      A carregar...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhum utilizador encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-card/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className={
                          user.role === "admin"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : ""
                        }
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : null}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.is_active ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm">
                          {user.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.last_login)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEdit(user)}
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleToggleActive(user)}
                          disabled={actionLoading === user.id}
                          title={user.is_active ? "Desactivar" : "Activar"}
                        >
                          {user.is_active ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-amber-400"
                          onClick={() => handleChangeRole(user)}
                          disabled={actionLoading === user.id || user.id === currentUser?.id}
                          title={user.role === "admin" ? "Remover admin" : "Tornar admin"}
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDelete(user)}
                            disabled={actionLoading === user.id}
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border/30">
          {loading ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                A carregar...
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              Nenhum utilizador encontrado
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowMenu(showMenu === user.id ? null : user.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    {showMenu === user.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-card border border-border/50 shadow-xl z-50 py-1">
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-card/60 flex items-center gap-2"
                          onClick={() => { handleEdit(user); setShowMenu(null) }}
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-card/60 flex items-center gap-2"
                          onClick={() => { handleToggleActive(user); setShowMenu(null) }}
                        >
                          {user.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {user.is_active ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-card/60 flex items-center gap-2"
                          onClick={() => { handleChangeRole(user); setShowMenu(null) }}
                          disabled={user.id === currentUser?.id}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {user.role === "admin" ? "Remover admin" : "Tornar admin"}
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-card/60 flex items-center gap-2 text-red-400"
                            onClick={() => { handleDelete(user); setShowMenu(null) }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className={
                      user.role === "admin"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : ""
                    }
                  >
                    {user.role}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="text-muted-foreground">{user.is_active ? "Activo" : "Inactivo"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                    <Clock className="w-3 h-3" />
                    {formatDate(user.last_login)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-xl bg-card border border-border/50 p-6 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-semibold">Editar Utilizador</h2>
              <p className="text-sm text-muted-foreground">{editingUser.email}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={actionLoading === editingUser.id}
              >
                {actionLoading === editingUser.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  bgColor: string
}) {
  return (
    <div className={`rounded-xl border p-4 backdrop-blur-sm ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`${color}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}
