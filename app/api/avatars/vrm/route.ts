import { readdir } from "fs/promises"
import path from "path"

export const runtime = "nodejs"

function labelFromFileName(fileName: string) {
  return fileName
    .replace(/\.vrm$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export async function GET(request: Request) {
  try {
    const avatarsDir = path.join(process.cwd(), "public", "avatars")
    const files = await readdir(avatarsDir)
    const avatars = files
      .filter((fileName) => fileName.toLowerCase().endsWith(".vrm"))
      .sort((a, b) => {
        if (a === "placeholder.vrm") return -1
        if (b === "placeholder.vrm") return 1
        return a.localeCompare(b)
      })
      .map((fileName) => ({
        fileName,
        name: labelFromFileName(fileName),
        url: `/avatars/${fileName}`,
        type: "vrm",
      }))

    const selected = avatars[0]

    return Response.json({
      success: true,
      url: selected?.url ?? "/avatars/placeholder.vrm",
      fileName: selected?.fileName ?? "placeholder.vrm",
      description: "Avatars disponíveis em public/avatars",
      avatars,
    })
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch avatar' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/avatars/vrm
 * Upload de novo avatar VRM
 * Por agora: confirmação, futuramente: guarda em BD e bucket
 */

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validação
    if (!file.name.endsWith('.vrm')) {
      return Response.json(
        { success: false, error: 'Only .vrm files are allowed' },
        { status: 400 }
      )
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return Response.json(
        { success: false, error: 'File too large (max 50MB)' },
        { status: 413 }
      )
    }

    // Por agora, apenas confirmamos recepção
    // No futuro: guardar em BD e bucket S3/similar
    return Response.json({
      success: true,
      message: 'Avatar upload received',
      fileName: file.name,
      fileSize: file.size,
      note: 'Para uso em produção: guardar em BD e bucket de files'
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return Response.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}
