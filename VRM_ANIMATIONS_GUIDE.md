# VRM Avatar Animations Setup

## Overview
This application now supports animations from [opensourceavatars.com](https://www.opensourceavatars.com/) for VRM avatars.

## Available Animations

The following animations are available and can be selected from the Settings panel:

### Idle Animations (suitable for chat/standing)
- **T-Pose** - Default T-Pose
- **Bored** - Bored idle animation ⭐ Default
- **Fight Idle** - Combat ready stance
- **Looking** - Looking animation
- **Looking Around** - Looking around curiously
- **Offensive Idle** - Aggressive idle stance
- **Texting While Standing** - Texting on phone

### Active Animations (dynamic movements)
- **Cross Jumps** - Energetic cross jumps
- **Jumping Rope** - Jump rope animation
- **Magic Spell Casting** - Casting magic spell
- **Searching Files High** - Searching through files
- **Standing Magic Attack** - Magic attack animation

## How It Works

1. **Animation Library** (`lib/vrm-animations.ts`)
   - Manages loading and caching of animations
   - Supports both FBX (from Mixamo/opensourceavatars) and GLB formats
   - Applies animations to VRM models using Three.js AnimationMixer

2. **VRM Avatar Component** (`components/vrm-avatar.tsx`)
   - Loads VRM models using `@pixiv/three-vrm`
   - Dynamically loads external animations when selected
   - Smoothly transitions between animations with fade-in effect

3. **Animation Selector** (`components/animation-selector.tsx`)
   - UI component for choosing animations
   - Categorizes animations by type (idle/active)
   - Integrated into the Settings tab of the Right Panel

## Using Animations

### Via Settings Panel
1. Open the application
2. Navigate to the Right Panel
3. Click on the "Configurações" (Settings) tab
4. Use the "Avatar Animation" dropdown to select an animation
5. The avatar will smoothly transition to the new animation

### Programmatically
```typescript
import { VRMAvatar } from '@/components/vrm-avatar'

<VRMAvatar 
  avatarUrl="/avatars/placeholder.vrm"
  animationName="Bored"
  onAvatarLoaded={handleAvatarLoaded}
/>
```

## Animation Loading

### Current Implementation
The system attempts to load animations directly from opensourceavatars.com using their API:
```
https://www.opensourceavatars.com/api/animations/{AnimationName}.fbx
```

### CORS Considerations
If you encounter CORS issues when loading animations from opensourceavatars.com, you have two options:

#### Option 1: Use Local Pre-converted Animations
1. Download animations from [Mixamo](https://www.mixamo.com/) or [opensourceavatars.com](https://www.opensourceavatars.com/)
2. Convert FBX to GLB format using tools like:
   - [FBX2glTF](https://github.com/facebookincubator/FBX2glTF)
   - [Blender](https://www.blender.org/) (Import FBX → Export GLB)
   - Online converters like [gltf.report](https://gltf.report/)
3. Place converted files in `public/animations/` folder
4. Update the URLs in `lib/vrm-animations.ts` to point to local files

#### Option 2: Setup a Proxy API
Create a Next.js API route to proxy requests to opensourceavatars.com:

```typescript
// app/api/animations/[name]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const animationUrl = `https://www.opensourceavatars.com/api/animations/${params.name}.fbx`
  const response = await fetch(animationUrl)
  const buffer = await response.arrayBuffer()
  
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${params.name}.fbx"`,
    },
  })
}
```

Then update the animation URLs in `lib/vrm-animations.ts` to use `/api/animations/{name}.fbx`.

## Technical Details

### Dependencies
- `@pixiv/three-vrm` - VRM model loader
- `three` - 3D graphics library
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Helpers for React Three Fiber

### Animation Mixer
Animations are managed using THREE.AnimationMixer which:
- Handles smooth playback of keyframe animations
- Supports blending between animations
- Updates on every frame via React Three Fiber's `useFrame` hook

### Performance
- Animations are cached after first load
- VRM model updates occur once per frame
- Smooth 0.3s fade-in when switching animations

## Troubleshooting

### Animation not loading
1. Check browser console for CORS errors
2. Verify animation URL is accessible
3. Try using local GLB files instead of remote FBX

### Animation looks wrong
- Some Mixamo animations may need retargeting for specific VRM models
- Ensure VRM model has a proper skeleton/humanoid rig
- Try different animations to see if issue is model or animation-specific

### Performance issues
- Reduce animation complexity
- Check VRM model polygon count
- Ensure only one animation mixer per avatar

## Future Improvements

- [ ] Pre-download and bundle popular animations as GLB
- [ ] Add animation preview thumbnails
- [ ] Support custom animation uploads
- [ ] Animation blending for smooth transitions
- [ ] Sync animations with speech/lip-sync
- [ ] Animation speed controls
- [ ] Create animation playlists/sequences

## Resources

- [opensourceavatars.com](https://www.opensourceavatars.com/) - Free VRM avatars and animations
- [Mixamo](https://www.mixamo.com/) - Adobe's free animation library
- [VRM Specification](https://vrm.dev/en/) - Technical VRM format docs
- [Three.js Animation System](https://threejs.org/docs/#manual/en/introduction/Animation-system) - Three.js animation guide
