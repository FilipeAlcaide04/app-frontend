# VRM Avatar Setup & Animations

This project now includes a fully functional VRM Avatar component with:
1. **Procedural Idle Animation**: Breathing and slight sway (fixes the static T-pose automatically).
2. **Lip Sync Simulation**: Mouth moves when the bot "speaks".
3. **Expression Testing**: Debug buttons to test facial expressions (AA, IH, OU, Blink).

## How it works

The `VRMAvatar` component (`components/vrm-avatar.tsx`) handles loading and animating the avatar.

### 1. Default Animation (Idle)
Instead of requiring an external `.fbx` file immediately, we use `Math.sin()` in the render loop to rotate the spine and chest bones. This creates a natural breathing effect.

### 2. Lip Sync
The `useVRMLipSync` hook listens for text and animates the `vrm.expressionManager` presets (`aa`, `ih`, `ou`, etc.) randomly for the duration of the text.

### 3. Adding Real Animations (Mixamo/FBX)
To use real animations (like "Walking", "Dancing") instead of the procedural idle:

1. Download an animation from Mixamo (select "Y Bot" or similar).
2. Save it as `.fbx`.
3. Place it in `public/animations/`.
4. Uncomment the `FBXLoader` section in `components/vrm-avatar.tsx`.

## Project Integration

The avatar is integrated into `components/center-panel.tsx`, which connects the `ChatInterface` output to the avatar's lip sync.

## Customizing

- **Avatar**: Replace `public/avatars/placeholder.vrm` with your own.
- **Expressions**: Adjust `handleExpression` in `vrm-avatar.tsx`.
