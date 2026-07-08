# Como Adicionar Animações ao Avatar

## 🎯 Situação Atual


O avatar está configurado para usar animações FBX diretamente do Mixamo! Basta baixar e colocar na pasta.

## ✅ Passos Simples (3 minutos por animação)

### 1. Aceder ao Mixamo
1. Vá a [www.mixamo.com](https://www.mixamo.com/)
2. Faça login (grátis com conta Adobe)

### 2. Baixar Animações (Formato FBX)
Para cada animação:

1. **Pesquisar** o nome da animação (ver tabela abaixo)
2. **Clicar na animação** para preview
3. **Clicar em "Download"**
4. **Configurações de Download:**
   - Format: **FBX for Unity (.fbx)** ✅
   - Skin: **Without Skin** ✅
   - Frame Rate: **30**
   - Keyframe Reduction: **none**
5. **Download** - o ficheiro baixa como `.fbx`

### 3. Renomear e Guardar
1. Renomear o ficheiro conforme a tabela abaixo
2. Mover para `public/animations/`
3. **Pronto!** Não precisa converter nada.

## 📋 Tabela de Animações

| Nome do Ficheiro | Pesquisar no Mixamo | Categoria |
|-----------------|---------------------|-----------|
| `Bored.fbx` | "Bored" | Idle ⭐ |
| `Looking-Around.fbx` | "Looking Around" | Idle ⭐ |
| `Texting-While-Standing.fbx` | "Texting" | Idle |
| `Fight-Idle.fbx` | "Fighting Idle" | Idle |
| `Offensive-Idle.fbx` | "Offensive Idle" | Idle |
| `Looking.fbx` | "Looking" | Idle |
| `T-Pose.fbx` | "T-Pose" | Idle |
| `Standing-Magic-Attack.fbx` | "Standing Melee Attack" | Active |
| `Magic-Spell-Casting.fbx` | "Casting Spell 01" | Active |
| `Cross-Jumps.fbx` | "Jumping Jacks" | Active |
| `Jumping-Rope.fbx` | "Jumping Rope" | Active |
| `Searching-Files-High.fbx` | "Searching" | Active |

⭐ = Recomendado para começar

## 🚀 Quick Start (3 animações essenciais)

Para testar rapidamente, baixe apenas estas 3:

1. **Bored.fbx** - Idle padrão
2. **Looking-Around.fbx** - Quando o avatar "pensa"  
3. **Texting-While-Standing.fbx** - Quando responde

**Tempo total: ~5-10 minutos**

## 📂 Estrutura de Pastas

```
public/
└── animations/
    ├── Bored.fbx                      ⭐
    ├── Looking-Around.fbx             ⭐
    ├── Texting-While-Standing.fbx     ⭐
    ├── Fight-Idle.fbx
    ├── Offensive-Idle.fbx
    ├── Looking.fbx
    ├── T-Pose.fbx
    ├── Standing-Magic-Attack.fbx
    ├── Magic-Spell-Casting.fbx
    ├── Cross-Jumps.fbx
    ├── Jumping-Rope.fbx
    ├── Searching-Files-High.fbx
    └── README.md
```

## ✅ Verificar se Funciona

Após adicionar animações:

1. **Reiniciar** servidor (`npm run dev`)
2. Abrir http://localhost:3000
3. Ir ao **painel direito > Configurações**
4. **Selecionar** uma animação no dropdown
5. Ver **console do browser**:
   ```
   ✅ Successfully loaded FBX animation: Bored (150 tracks, 6.67s)
   🎬 Playing animation: Bored (6.67s)
   ```

## 🎯 Exemplo Passo-a-Passo (Animação "Bored")

1. Ir a mixamo.com
2. Pesquisar "Bored"
3. Clicar na animação
4. Download:
   - FBX for Unity ✅
   - Without Skin ✅
   - 30 FPS
5. Renomear para `Bored.fbx`
6. Mover para `public/animations/Bored.fbx`
7. Reiniciar servidor
8. Selecionar "Bored" no dropdown
9. **Funciona!** 🎉

## 💡 Dicas

- **Não precisa de todas!** 3-4 animações já dão um efeito excelente
- **Tamanho dos ficheiros**: ~100-500KB cada (muito leve)
- **Sem conversão**: FBX funciona diretamente
- **Cache**: Uma vez carregada, a animação fica em cache

## ⚠️ Atenção aos Nomes

Os nomes dos ficheiros devem ser **exatamente** como na tabela, incluindo:
- Maiúsculas/minúsculas
- Hífens no lugar de espaços
- Extensão `.fbx`

❌ Errado: `bored.fbx`, `Looking Around.fbx`, `Bored.FBX`
✅ Certo: `Bored.fbx`, `Looking-Around.fbx`

## 🔍 Troubleshooting

### "Animation file not found"
- Verificar nome do ficheiro
- Verificar pasta `public/animations/`
- Reiniciar servidor

### "No animations found in FBX"
- Descarregar novamente do Mixamo
- Confirmar "FBX for Unity"
- Confirmar "Without Skin"

### Animação não aparece no dropdown
- Ficheiro deve estar em `public/animations/`
- Nome deve corresponder à tabela
- Reiniciar servidor

## 🎨 Animações vs Qualidade

| Quantidade | Tempo | Resultado |
|------------|-------|-----------|
| 3 animações | 10 min | ⭐⭐⭐ Ótimo para começar |
| 6 animações | 20 min | ⭐⭐⭐⭐ Muito bom |
| 12 animações | 40 min | ⭐⭐⭐⭐⭐ Completo |

## 🚀 Próximo Nível (Opcional)

- Baixar mais animações do Mixamo (milhares disponíveis)
- Ajustar configurações (FPS, duração) no Mixamo antes de baixar
- Criar sequências combinando múltiplas animações
- Sincronizar animações com eventos do chat

## ❓ FAQ

**P: Preciso converter FBX para GLB?**
R: Não! Agora usamos FBX diretamente.

**P: Quanto espaço ocupam?**
R: ~100-500KB por animação. 12 animações = ~3-5MB total.

**P: Posso usar outras animações do Mixamo?**
R: Sim! Basta adicionar à configuração em `lib/vrm-animations.ts`.

**P: A aplicação funciona sem animações?**
R: Sim! As animações são opcionais.

---

**Tempo estimado**: 10 minutos para 3 animações essenciais ⚡
**Dificuldade**: Muito Fácil ⭐
**Resultado**: Avatar com animações profissionais! 🎬
