# 🔧 Troubleshooting: Animação FBX não aparece

## ✅ Mudanças Feitas

Adicionei suporte para `placeholder.fbx` e logs de debug detalhados!

## 🔍 Como Ver o Que Está Acontecendo

### 1. Abrir Console do Browser
- **Chrome/Edge**: F12 → aba "Console"
- **Firefox**: F12 → aba "Console"

### 2. Recarregar a Página
Pressionar `Ctrl+R` ou `F5`

### 3. Verificar Mensagens

Deves ver mensagens assim:

#### ✅ Se Tudo Estiver OK:
```
🎭 Loading VRM model from: /avatars/placeholder.vrm
✅ VRM loaded successfully!
   - Bones: 56
   - Has expressions: Yes
✅ Animation mixer created
📦 No embedded animations in VRM file

🎬 ===== LOADING ANIMATION: Placeholder =====
📁 Animation config found:
   - Name: Placeholder
   - URL: /animations/placeholder.fbx
   - Category: idle
   - Mixamo: Any
📥 Loading animation: Placeholder from /animations/placeholder.fbx
📊 Loading Placeholder: 25%
📊 Loading Placeholder: 50%
📊 Loading Placeholder: 75%
✅ Successfully loaded FBX animation: Placeholder (150 tracks, 6.67s)
✅ Animation clip loaded:
   - Name: Placeholder
   - Duration: 6.67s
   - Tracks: 150
🎬 Playing animation: Placeholder (6.67s)
✅ Animation applied and playing!
🎬 ===== ANIMATION LOADING COMPLETE =====
```

#### ❌ Se o Arquivo Não Existir:
```
🎭 Loading VRM model from: /avatars/placeholder.vrm
✅ VRM loaded successfully!
✅ Animation mixer created
📦 No embedded animations in VRM file

🎬 ===== LOADING ANIMATION: Placeholder =====
📁 Animation config found:
   - Name: Placeholder
   - URL: /animations/placeholder.fbx
   - Category: idle
📥 Loading animation: Placeholder from /animations/placeholder.fbx
❌ Error loading FBX animation from /animations/placeholder.fbx: [Error details]
💡 Make sure the file exists at: public/animations/placeholder.fbx
⚠️  Animation file not found: /animations/placeholder.fbx
💡 To add this animation:
   1. Go to https://www.mixamo.com/
   2. Search for "Any"
   3. Download as FBX (Unity, Without Skin, 30fps)
   4. Save as: public/animations/placeholder.fbx
```

## 📁 Verificar Estrutura de Pastas

```
app-frontend/
├── public/
│   ├── animations/
│   │   └── placeholder.fbx  ← O arquivo DEVE estar aqui
│   └── avatars/
│       └── placeholder.vrm
```

### Verificar no Terminal:
```powershell
# No terminal, dentro de app-frontend:
ls public\animations\

# Deve mostrar:
# placeholder.fbx
```

## 🎯 Checklist Completo

- [ ] Arquivo se chama exatamente `placeholder.fbx` (minúsculas)
- [ ] Arquivo está em `public/animations/`
- [ ] Servidor foi reiniciado após adicionar o arquivo (`Ctrl+C` depois `npm run dev`)
- [ ] Console do browser mostra as mensagens de carregamento
- [ ] Selecionaste "Placeholder" no dropdown de animações

## 🔄 Passo a Passo para Testar

### 1. Verificar o Arquivo
```powershell
# Verificar se existe
Test-Path "public\animations\placeholder.fbx"
# Deve retornar: True

# Ver tamanho do arquivo
(Get-Item "public\animations\placeholder.fbx").Length / 1KB
# Deve mostrar algo entre 100-1000 KB
```

### 2. Reiniciar Servidor
```powershell
# Parar servidor: Ctrl+C
# Iniciar novamente:
npm run dev
```

### 3. Abrir Browser
```
http://localhost:3000
```

### 4. Abrir Console (F12)
Verificar mensagens

### 5. Selecionar Animação
- Ir ao **painel direito**
- Clicar em **"Configurações"**
- No dropdown **"Avatar Animation"**, selecionar **"Placeholder"**

### 6. Ver Resultado
- Avatar deve começar a animar
- Console deve mostrar mensagens de sucesso

## ⚠️ Problemas Comuns

### Problema 1: "Animation file not found"
**Causa**: Arquivo não está no lugar certo
**Solução**:
```powershell
# Mover arquivo para o lugar certo
Move-Item .\placeholder.fbx public\animations\
```

### Problema 2: Nome errado
**Causa**: Arquivo tem nome diferente
**Solução**:
```powershell
# Renomear
Rename-Item public\animations\Placeholder.fbx placeholder.fbx
# ou
Rename-Item public\animations\PLACEHOLDER.FBX placeholder.fbx
```

### Problema 3: Não aparece no dropdown
**Causa**: Servidor não foi reiniciado
**Solução**: `Ctrl+C` e `npm run dev`

### Problema 4: Avatar não se move
**Causas possíveis**:
1. FBX corrupto - baixar novamente do Mixamo
2. FBX tem "Skin" - deve ser "Without Skin"
3. Formato errado - deve ser "FBX for Unity"

**Solução**: Baixar novamente do Mixamo com configurações corretas:
- Format: **FBX for Unity**
- Skin: **Without Skin** ✅
- Frame Rate: **30**

### Problema 5: Console vazio
**Causa**: Console pode estar filtrado
**Solução**: Limpar filtros no console do browser

## 📝 Copiar e Colar no Chat

Se continuares com problemas, copia TODAS as mensagens do console que começam com 🎭 ou 🎬 e cola aqui que eu ajudo!

Exemplo do que copiar:
```
🎭 Loading VRM model from: /avatars/placeholder.vrm
✅ VRM loaded successfully!
🎬 ===== LOADING ANIMATION: Placeholder =====
...todas as mensagens...
🎬 ===== ANIMATION LOADING COMPLETE =====
```

## 🎉 Quando Funcionar

Vais ver:
- ✅ Avatar a mexer-se conforme a animação
- ✅ Movimentos suaves
- ✅ Loop contínuo
- ✅ Sem erros no console

## 💡 Dica Extra

Para ver animação a mudar em tempo real:
1. Deixa placeholder.fbx a tocar
2. Vai ao Mixamo e baixa outra animação (ex: "Bored")
3. Salva como `Bored.fbx` em `public/animations/`
4. No dropdown, muda de "Placeholder" para "Bored"
5. A animação deve mudar suavemente!
