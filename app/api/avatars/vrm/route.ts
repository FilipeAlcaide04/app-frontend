/**
 * GET /api/avatars/vrm
 * Retorna o URL do avatar VRM do utilizador
 */

export async function GET(request: Request) {
  try {
    // Por agora, retorna o placeholder
    // No futuro, vai buscar da BD baseado no user/bot
    return Response.json({
      success: true,
      url: '/avatars/placeholder.vrm',
      fileName: 'VIPE_Hero.vrm',
      description: 'Avatar placeholder - Por agora, todos usam este'
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
