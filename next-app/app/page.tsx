"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

const studentsUrl = "https://6afe30fd3a0e70bc8d532e7a.mockapi.io/students"

type Student = {
  id: string
  name: string
  email: string
}

function isStudent(value: unknown): value is Student {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "email" in value &&
    typeof value.email === "string"
  )
}

function isStudentList(value: unknown): value is Student[] {
  return Array.isArray(value) && value.every(isStudent)
}

export default function Page() {
  const [students, setStudents] = useState<Student[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [editingName, setEditingName] = useState("")
  const [editingEmail, setEditingEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function list() {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(studentsUrl)

      if (!response.ok) {
        throw new Error(`Falha a carregar estudantes (HTTP ${response.status}).`)
      }

      const data: unknown = await response.json()
      if (!isStudentList(data)) {
        throw new Error("A resposta da API não contém uma lista válida de estudantes.")
      }

      setStudents(data)
    } catch (error) {
      setStudents(null)
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao carregar os estudantes.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function createStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(studentsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      if (!response.ok) {
        throw new Error(`Falha ao cadastrar estudante (HTTP ${response.status}).`)
      }

      const data: unknown = await response.json()
      if (!isStudent(data)) {
        throw new Error("A resposta da API não contém um estudante válido.")
      }

      setStudents((currentStudents) =>
        currentStudents ? [...currentStudents, data] : currentStudents,
      )
      setName("")
      setEmail("")
      setSuccess("Estudante cadastrado com sucesso.")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao cadastrar o estudante.",
      )
    } finally {
      setIsCreating(false)
    }
  }

  async function deleteStudent(student: Student) {
    if (!window.confirm(`Tem certeza que deseja excluir ${student.name}?`)) {
      return
    }

    setDeletingStudentId(student.id)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(
        `${studentsUrl}/${encodeURIComponent(student.id)}`,
        { method: "DELETE" },
      )

      if (!response.ok) {
        throw new Error(`Falha ao excluir estudante (HTTP ${response.status}).`)
      }

      setStudents((currentStudents) =>
        currentStudents
          ? currentStudents.filter(
              (currentStudent) => currentStudent.id !== student.id,
            )
          : currentStudents,
      )
      setSuccess("Estudante excluído com sucesso.")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao excluir o estudante.",
      )
    } finally {
      setDeletingStudentId(null)
    }
  }

  function startEditing(student: Student) {
    setEditingStudentId(student.id)
    setEditingName(student.name)
    setEditingEmail(student.email)
    setError(null)
    setSuccess(null)
  }

  function cancelEditing() {
    setEditingStudentId(null)
    setEditingName("")
    setEditingEmail("")
  }

  async function updateStudent(
    event: React.FormEvent<HTMLFormElement>,
    student: Student,
  ) {
    event.preventDefault()
    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(
        `${studentsUrl}/${encodeURIComponent(student.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingName.trim(),
            email: editingEmail.trim(),
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Falha ao atualizar estudante (HTTP ${response.status}).`)
      }

      const data: unknown = await response.json()
      if (!isStudent(data) || data.id !== student.id) {
        throw new Error("A resposta da API não contém um estudante válido.")
      }

      setStudents((currentStudents) =>
        currentStudents?.map((currentStudent) =>
          currentStudent.id === student.id ? data : currentStudent,
        ) ?? currentStudents,
      )
      cancelEditing()
      setSuccess("Estudante atualizado com sucesso.")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao atualizar o estudante.",
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 px-6 py-12">
      <section className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Cadastrar estudante</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados para adicionar um novo estudante.
          </p>
        </div>
        <form className="space-y-4" onSubmit={createStudent}>
          <div className="space-y-2">
            <label htmlFor="student-name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="student-name"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="student-email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="student-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Cadastrando..." : "Cadastrar estudante"}
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-sm text-primary">
            {success}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Estudantes</h2>
          <Button
            onClick={list}
            disabled={
              isLoading || editingStudentId !== null || deletingStudentId !== null
            }
            variant="outline"
          >
            {isLoading ? "Carregando..." : "Listar estudantes"}
          </Button>
        </div>
        {students && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">E-mail</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t">
                    <td className="px-4 py-3">
                      {editingStudentId === student.id ? (
                        <>
                          <label
                            htmlFor={`student-name-${student.id}`}
                            className="sr-only"
                          >
                            Nome de {student.name}
                          </label>
                          <input
                            id={`student-name-${student.id}`}
                            form={`student-edit-${student.id}`}
                            required
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            className="h-9 w-full min-w-32 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </>
                      ) : (
                        student.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingStudentId === student.id ? (
                        <>
                          <label
                            htmlFor={`student-email-${student.id}`}
                            className="sr-only"
                          >
                            E-mail de {student.name}
                          </label>
                          <input
                            id={`student-email-${student.id}`}
                            form={`student-edit-${student.id}`}
                            type="email"
                            required
                            value={editingEmail}
                            onChange={(event) => setEditingEmail(event.target.value)}
                            className="h-9 w-full min-w-40 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </>
                      ) : (
                        student.email
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingStudentId === student.id ? (
                        <form
                          id={`student-edit-${student.id}`}
                          onSubmit={(event) => updateStudent(event, student)}
                          className="flex justify-end gap-2"
                        >
                          <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? "Salvando..." : "Salvar"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={cancelEditing}
                          >
                            Cancelar
                          </Button>
                        </form>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              editingStudentId !== null ||
                              deletingStudentId !== null
                            }
                            onClick={() => startEditing(student)}
                            aria-label={`Editar ${student.name}`}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={
                              deletingStudentId !== null ||
                              editingStudentId !== null
                            }
                            onClick={() => deleteStudent(student)}
                            aria-label={`Excluir ${student.name}`}
                          >
                            {deletingStudentId === student.id
                              ? "Excluindo..."
                              : "Excluir"}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Nenhum estudante cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
