"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Database, Edit2, FileText, Link2, RefreshCw, Save, Search, Shield,
  Trash2, UserCheck, Users, UserX, X,
} from "lucide-react"
import {
  User, PromptTemplate, AdminDbResource,
  adminDeleteUser, adminGetDbResources, adminGetDbRows, adminGetPrompts,
  adminGetUsers, adminUpdateDbRow, adminUpdatePrompt, adminUpdateUser,
} from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"

type Tab = "users" | "prompts" | "database"

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const [tab, setTab] = useState<Tab>("prompts")

  const [users, setUsers] = useState<User[]>([])
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [resources, setResources] = useState<AdminDbResource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editUserForm, setEditUserForm] = useState({ name: "", email: "", role: "user" })

  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)
  const [promptForm, setPromptForm] = useState({
    key: "",
    name: "",
    category: "",
    description: "",
    template: "",
    language: "pt-PT",
    version: 1,
    variables: "",
    is_active: true,
  })

  const [selectedResource, setSelectedResource] = useState("prompt_templates")
  const [dbRows, setDbRows] = useState<Record<string, any>[]>([])
  const [dbMeta, setDbMeta] = useState<{ editable_fields: string[]; total: number; summary: string }>({
    editable_fields: [],
    total: 0,
    summary: "",
  })
  const [dbSearch, setDbSearch] = useState("")
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null)
  const [rowJson, setRowJson] = useState("")

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [usersData, promptsData, resourcesData] = await Promise.all([
        adminGetUsers(),
        adminGetPrompts(),
        adminGetDbResources(),
      ])
      setUsers(usersData.users)
      setPrompts(promptsData.prompts)
      setResources(resourcesData.resources)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRows = useCallback(async () => {
    const data = await adminGetDbRows(selectedResource, { q: dbSearch, limit: 50 })
    setDbRows(data.rows)
    setDbMeta({
      editable_fields: data.editable_fields,
      total: data.total,
      summary: data.summary,
    })
  }, [selectedResource, dbSearch])

  useEffect(() => {
    fetchAll().catch(console.error)
  }, [fetchAll])

  useEffect(() => {
    fetchRows().catch(console.error)
  }, [fetchRows])

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const filteredPrompts = prompts.filter((p) =>
    `${p.key} ${p.name} ${p.category} ${p.description ?? ""}`.toLowerCase().includes(search.toLowerCase())
  )

  const stats = useMemo(() => ({
    users: users.length,
    prompts: prompts.length,
    resources: resources.length,
    editableRows: resources.reduce((sum, r) => sum + r.count, 0),
  }), [users, prompts, resources])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Nunca"
    return new Date(dateStr).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditUserForm({ name: user.name, email: user.email, role: user.role })
  }

  const handleSaveUser = async () => {
    if (!editingUser) return
    setActionLoading(editingUser.id)
    try {
      await adminUpdateUser(editingUser.id, editUserForm as Partial<User>)
      setEditingUser(null)
      await fetchAll()
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Remover ${user.name} (${user.email})?`)) return
    await adminDeleteUser(user.id)
    await fetchAll()
  }

  const handleEditPrompt = (prompt: PromptTemplate) => {
    setEditingPrompt(prompt)
    setPromptForm({
      key: prompt.key,
      name: prompt.name,
      category: prompt.category,
      description: prompt.description ?? "",
      template: prompt.template,
      language: prompt.language,
      version: prompt.version,
      variables: (prompt.variables || []).join(", "),
      is_active: prompt.is_active,
    })
  }

  const handleSavePrompt = async () => {
    if (!editingPrompt) return
    setActionLoading(editingPrompt.id)
    try {
      await adminUpdatePrompt(editingPrompt.id, {
        ...promptForm,
        version: Number(promptForm.version) || 1,
        variables: promptForm.variables.split(",").map((v) => v.trim()).filter(Boolean),
      })
      setEditingPrompt(null)
      await fetchAll()
      await fetchRows()
    } finally {
      setActionLoading(null)
    }
  }

  const startEditRow = (row: Record<string, any>) => {
    setEditingRow(row)
    const editable = Object.fromEntries(
      dbMeta.editable_fields.map((field) => [field, row[field] ?? null])
    )
    setRowJson(JSON.stringify(editable, null, 2))
  }

  const saveRow = async () => {
    if (!editingRow) return
    let updates: Record<string, any>
    try {
      updates = JSON.parse(rowJson)
    } catch {
      alert("JSON inválido")
      return
    }
    setActionLoading(editingRow.id)
    try {
      await adminUpdateDbRow(selectedResource, editingRow.id, updates)
      setEditingRow(null)
      await fetchRows()
      if (selectedResource === "prompt_templates") await fetchAll()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1">
            Edita prompts, vê onde estão ligadas e gere dados relevantes da base de dados.
          </p>
        </div>
        <Button variant="outline" onClick={fetchAll} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Utilizadores" value={stats.users} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Prompts" value={stats.prompts} icon={<FileText className="w-4 h-4" />} />
        <StatCard label="Recursos editáveis" value={stats.resources} icon={<Database className="w-4 h-4" />} />
        <StatCard label="Registos visíveis" value={stats.editableRows} icon={<Shield className="w-4 h-4" />} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TabButton active={tab === "prompts"} onClick={() => setTab("prompts")} icon={<FileText className="w-4 h-4" />}>
          Prompts
        </TabButton>
        <TabButton active={tab === "database"} onClick={() => setTab("database")} icon={<Database className="w-4 h-4" />}>
          Base de dados
        </TabButton>
        <TabButton active={tab === "users"} onClick={() => setTab("users")} icon={<Users className="w-4 h-4" />}>
          Utilizadores
        </TabButton>
      </div>

      {(tab === "users" || tab === "prompts") && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder={tab === "prompts" ? "Pesquisar prompts por key, categoria ou descrição..." : "Pesquisar utilizadores..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {tab === "prompts" && (
        <div className="grid gap-4">
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="rounded-xl border border-border/50 bg-card/35 backdrop-blur-sm p-4 space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{prompt.name}</h2>
                    <Badge variant="secondary">{prompt.key}</Badge>
                    <Badge className={prompt.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}>
                      {prompt.is_active ? "activo" : "inactivo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Categoria: {prompt.category} · Idioma: {prompt.language} · v{prompt.version} · Actualizado: {formatDate(prompt.updated_at)}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleEditPrompt(prompt)} className="gap-2">
                  <Edit2 className="w-3.5 h-3.5" /> Editar prompt
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(prompt.linked_to || []).map((link) => (
                  <Badge key={link} variant="outline" className="gap-1 text-xs">
                    <Link2 className="w-3 h-3" /> {link}
                  </Badge>
                ))}
              </div>
              <pre className="max-h-36 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                {prompt.template.slice(0, 900)}{prompt.template.length > 900 ? "\n..." : ""}
              </pre>
            </div>
          ))}
        </div>
      )}

      {tab === "database" && (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="rounded-xl border border-border/50 bg-card/35 p-3 space-y-2 h-fit">
            {resources.map((resource) => (
              <button
                key={resource.key}
                onClick={() => setSelectedResource(resource.key)}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  selectedResource === resource.key ? "bg-primary/15 text-primary" : "hover:bg-card/70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{resource.label}</span>
                  <Badge variant="secondary">{resource.count}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.summary}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-border/50 bg-card/35 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold">{resources.find((r) => r.key === selectedResource)?.label}</h2>
                  <p className="text-sm text-muted-foreground">{dbMeta.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dbMeta.total} registos · campos editáveis: {dbMeta.editable_fields.join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Pesquisar..." value={dbSearch} onChange={(e) => setDbSearch(e.target.value)} />
                  <Button variant="outline" onClick={fetchRows}><Search className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/35 overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Registo</th>
                    <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Resumo</th>
                    <th className="text-right px-4 py-3 text-xs uppercase text-muted-foreground">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {dbRows.map((row) => (
                    <tr key={row.id} className="hover:bg-card/40">
                      <td className="px-4 py-3 align-top">
                        <code className="text-xs">{row.id}</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          {row.created_at ? `Criado: ${formatDate(row.created_at)}` : ""}
                          {row.updated_at ? ` · Editado: ${formatDate(row.updated_at)}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <RowPreview row={row} />
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <Button size="sm" variant="outline" onClick={() => startEditRow(row)} className="gap-2">
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="rounded-xl border border-border/50 bg-card/35 overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Utilizador</th>
                <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Último login</th>
                <th className="text-right px-4 py-3 text-xs uppercase text-muted-foreground">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-card/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3"><Badge>{user.role}</Badge></td>
                  <td className="px-4 py-3 text-sm">{user.is_active ? "Activo" : "Inactivo"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(user.last_login)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}><Edit2 className="w-4 h-4" /></Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => adminUpdateUser(user.id, { is_active: !user.is_active } as Partial<User>).then(fetchAll)}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)} className="hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingPrompt && (
        <Modal title="Editar prompt" subtitle={editingPrompt.key} onClose={() => setEditingPrompt(null)}>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Key"><Input value={promptForm.key} onChange={(e) => setPromptForm({ ...promptForm, key: e.target.value })} /></Field>
            <Field label="Nome"><Input value={promptForm.name} onChange={(e) => setPromptForm({ ...promptForm, name: e.target.value })} /></Field>
            <Field label="Categoria"><Input value={promptForm.category} onChange={(e) => setPromptForm({ ...promptForm, category: e.target.value })} /></Field>
            <Field label="Idioma"><Input value={promptForm.language} onChange={(e) => setPromptForm({ ...promptForm, language: e.target.value })} /></Field>
            <Field label="Versão"><Input type="number" value={promptForm.version} onChange={(e) => setPromptForm({ ...promptForm, version: Number(e.target.value) })} /></Field>
            <Field label="Variáveis"><Input value={promptForm.variables} onChange={(e) => setPromptForm({ ...promptForm, variables: e.target.value })} /></Field>
          </div>
          <Field label="Descrição"><Input value={promptForm.description} onChange={(e) => setPromptForm({ ...promptForm, description: e.target.value })} /></Field>
          <Field label="Template">
            <Textarea value={promptForm.template} onChange={(e) => setPromptForm({ ...promptForm, template: e.target.value })} className="min-h-[420px] font-mono text-xs" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={promptForm.is_active} onChange={(e) => setPromptForm({ ...promptForm, is_active: e.target.checked })} />
            Activa
          </label>
          <ModalActions onCancel={() => setEditingPrompt(null)} onSave={handleSavePrompt} loading={actionLoading === editingPrompt.id} />
        </Modal>
      )}

      {editingUser && (
        <Modal title="Editar utilizador" subtitle={editingUser.email} onClose={() => setEditingUser(null)}>
          <Field label="Nome"><Input value={editUserForm.name} onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })} /></Field>
          <Field label="Email"><Input value={editUserForm.email} onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })} /></Field>
          <Field label="Role">
            <select value={editUserForm.role} onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <ModalActions onCancel={() => setEditingUser(null)} onSave={handleSaveUser} loading={actionLoading === editingUser.id} />
        </Modal>
      )}

      {editingRow && (
        <Modal title={`Editar ${selectedResource}`} subtitle={editingRow.id} onClose={() => setEditingRow(null)}>
          <p className="text-sm text-muted-foreground">
            Edita apenas os campos relevantes abaixo. JSON inválido ou campos não permitidos são rejeitados/ignorados pelo backend.
          </p>
          <Textarea value={rowJson} onChange={(e) => setRowJson(e.target.value)} className="min-h-[520px] font-mono text-xs" />
          <ModalActions onCancel={() => setEditingRow(null)} onSave={saveRow} loading={actionLoading === editingRow.id} />
        </Modal>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/35 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between text-primary">{icon}</div>
      <p className="text-2xl font-bold mt-3">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Button variant={active ? "default" : "outline"} onClick={onClick} className="gap-2">
      {icon}
      {children}
    </Button>
  )
}

function RowPreview({ row }: { row: Record<string, any> }) {
  const preferred = ["key", "name", "title", "content", "template", "summary", "query", "final_response", "current_mood", "primary_emotion"]
  const items = preferred
    .filter((key) => row[key] !== undefined && row[key] !== null && row[key] !== "")
    .slice(0, 4)

  return (
    <div className="space-y-1">
      {items.map((key) => (
        <p key={key} className="text-sm">
          <span className="text-muted-foreground">{key}: </span>
          <span>{typeof row[key] === "object" ? JSON.stringify(row[key]).slice(0, 180) : String(row[key]).slice(0, 240)}</span>
        </p>
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground">{JSON.stringify(row).slice(0, 240)}</p>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function Modal({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-auto rounded-xl bg-card border border-border/50 p-6 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ onCancel, onSave, loading }: { onCancel: () => void; onSave: () => void; loading: boolean }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={onCancel}>Cancelar</Button>
      <Button onClick={onSave} disabled={loading} className="gap-2">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar
      </Button>
    </div>
  )
}
