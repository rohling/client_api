"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

type Student = {
  id: string
  name: string
  email: string
}

function isStudentList(value: unknown): value is Student[] {
  return (
    Array.isArray(value) &&
    value.every(
      (student) =>
        typeof student === "object" &&
        student !== null &&
        "id" in student &&
        typeof student.id === "string" &&
        "name" in student &&
        typeof student.name === "string" &&
        "email" in student &&
        typeof student.email === "string",
    )
  )
}

export default function Page() {
  const [students, setStudents] = useState<Student[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function list() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        "https://6afbaa37892984c4494a0059.mockapi.io/students",
      )

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

  return (
    <div>
      <Button onClick={list} disabled={isLoading}>
        {isLoading ? "Carregando..." : "Listar"}
      </Button>
      {error && <p role="alert" className="mt-4">{error}</p>}
      {students && (
        <table className="mt-4 border-collapse border">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-left">Nome</th>
              <th className="border px-4 py-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="border px-4 py-2">{student.name}</td>
                <td className="border px-4 py-2">{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
