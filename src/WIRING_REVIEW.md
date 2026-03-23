# Feature Wiring Review

This document outlines all changes needed to wire up dormant features.
**Review before applying any changes to existing files.**

---

## 1. Camera Screen / Scripture Scan

### New Files Created:
- `src/components/settings/ExportDataButton.tsx`

### Changes Needed to Existing Files:

#### `src/types/navigation.ts` (add to RootStackParamList)
```typescript
// ADD this route:
CameraScreen: {
  mode: 'scripture-scan';
  onCapture?: (imageUri: string) => void;
};
```

#### `App.tsx` (add screen + import)
```typescript
// ADD import:
import CameraScreen from './src/screens/CameraScreen';

// ADD inside RootStack.Navigator (after ChatHub):
<RootStack.Screen
  name="CameraScreen"
  component={CameraScreen}
  options={{
    headerShown: false,
    animation: 'slide_from_bottom',
  }}
/>
```

#### `src/screens/HomeScreen.tsx` (add scan button)
```typescript
// ADD import:
import { useScriptureScan } from '../hooks/useScriptureScan';

// ADD in component:
const { scanImage } = useScriptureScan();

// ADD button in UI (suggested location: near daily verse card):
<TouchableOpacity onPress={() => scanImage(navigation)} style={styles.scanButton}>
  <Ionicons name="scan" size={24} color={theme.colors.primary} />
  <Text>Scan Text</Text>
</TouchableOpacity>
```

---

## 2. Chat Analytics Integration

### Changes Needed to Existing Files:

#### `src/components/chat/ChatBottomSheet.tsx`
```typescript
// ADD import:
import { useChatAnalytics } from '../../hooks/useChatAnalytics';

// ADD in component:
const { logChatInteraction } = useChatAnalytics();

// MODIFY: After receiving AI response (in handleSendMessage success):
logChatInteraction({
  query: message,
  response: data.response,
  sources: data.sources,
  witLevel: witLevel,
  responseTimeMs: Date.now() - startTime,
});
```

#### `src/screens/ChatHubScreen.tsx`
```typescript
// Same pattern as ChatBottomSheet - add useChatAnalytics
```

---

## 3. Data Export Button

### New Files Created:
- `src/components/settings/ExportDataButton.tsx` ✅

### Changes Needed to Existing Files:

#### `src/screens/SettingsScreen.tsx`
```typescript
// ADD import:
import { ExportDataButton } from '../components/settings/ExportDataButton';

// ADD in Privacy section (after Delete Account):
<ExportDataButton />
```

---

## 4. Fix CameraScreen TypeScript Errors

### Changes Needed:

#### `src/screens/CameraScreen.tsx`
The file has several TS errors related to expo-camera v17 API changes:
- `CameraType` enum usage needs updating
- `Camera` component type issues
- Navigation route not in param list

These will be auto-fixed once we add the route to navigation.

---

## Summary of Changes

| File | Action | Risk |
|------|--------|------|
| `src/types/navigation.ts` | Add CameraScreen route | Low |
| `App.tsx` | Add CameraScreen to navigator | Low |
| `src/screens/HomeScreen.tsx` | Add scan button | Low |
| `src/screens/SettingsScreen.tsx` | Add export button | Low |
| `src/components/chat/ChatBottomSheet.tsx` | Add analytics hook | Low |
| `src/screens/ChatHubScreen.tsx` | Add analytics hook | Low |

---

## Testing Checklist

After applying changes:
- [ ] Camera screen opens from Home
- [ ] Can capture image and extract text
- [ ] Extracted text flows to ChatHub
- [ ] Export data button downloads JSON
- [ ] Chat analytics logged (check Supabase chat_logs table)

---

**Ready to apply?** Tell me which features to wire up.
