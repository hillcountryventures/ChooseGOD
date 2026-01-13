# Text Wrapping - Quick Reference Guide

## The Problem
Text in React Native components can truncate if not properly configured:

```typescript
// ❌ BAD - Will truncate after 2 lines
<Text numberOfLines={2} style={styles.content}>
  {longDevotionalText}
</Text>

// Result: "This is a very long devotional text that will be cut..."
```

## The Solution

### Option 1: Use AppText Component (Recommended)
```typescript
import { AppText, AppParagraph } from '../components/AppText';

// ✅ GOOD - Full text with wrapping
<AppText style={styles.content}>
  {longDevotionalText}
</AppText>

// ✅ GOOD - Paragraph with optimal line spacing
<AppParagraph style={styles.devotionalBody}>
  {devotionalContent}
</AppParagraph>

// ✅ GOOD - Optional line limiting when needed
<AppText maxLines={3} style={styles.preview}>
  {previewText}
</AppText>
```

### Option 2: Fix Existing Text Components

#### Step 1: Remove numberOfLines (or set to 0)
```typescript
// ❌ Before
<Text numberOfLines={4} style={styles.text}>
  {content}
</Text>

// ✅ After
<Text style={styles.text}>
  {content}
</Text>
```

#### Step 2: Add flexWrap to styles
```typescript
// ❌ Before
const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
});

// ✅ After
const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    flexWrap: 'wrap', // 👈 Add this
  },
});
```

## When to Keep numberOfLines

Use `numberOfLines` **only** for:

1. **List previews** - Show snippet in a list, expand on tap
2. **Fixed-height cards** - Design requires consistent height
3. **Badges/chips** - Small UI elements with space constraints

```typescript
// ✅ OK - Preview in a list
<TouchableOpacity onPress={showFullContent}>
  <Text numberOfLines={3} style={styles.preview}>
    {longText}
  </Text>
  <Text style={styles.readMore}>Read more →</Text>
</TouchableOpacity>

// ✅ OK - Fixed badge
<View style={styles.badge}>
  <Text numberOfLines={1}>{categoryName}</Text>
</View>
```

## Common Patterns

### Pattern 1: Verse Card (Full Display)
```typescript
function VerseCard({ verse }: { verse: string }) {
  return (
    <View style={styles.card}>
      <AppParagraph style={styles.verseText}>
        "{verse}"
      </AppParagraph>
    </View>
  );
}

const styles = StyleSheet.create({
  verseText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 28,
    // flexWrap: 'wrap' is automatic with AppParagraph
  },
});
```

### Pattern 2: Reflection Questions (Full Display)
```typescript
function ReflectionQuestions({ questions }: Props) {
  return (
    <View>
      {questions.map((q, i) => (
        <View key={i} style={styles.questionItem}>
          <Text style={styles.number}>{i + 1}</Text>
          <AppText style={styles.questionText}>{q}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  questionItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  number: {
    fontWeight: 'bold',
    width: 24,
  },
  questionText: {
    flex: 1, // 👈 Important for wrapping in flex layout
    lineHeight: 22,
  },
});
```

### Pattern 3: TextInput (Expandable)
```typescript
function JournalEntry() {
  const [text, setText] = useState('');

  return (
    <TextInput
      style={styles.input}
      multiline // 👈 Important for wrapping
      textAlignVertical="top" // 👈 Align to top
      placeholder="Write your thoughts..."
      value={text}
      onChangeText={setText}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 100, // Start height
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
    textAlignVertical: 'top',
    // React Native handles wrapping for multiline inputs
  },
});
```

### Pattern 4: ScrollView Container
```typescript
function DevotionalScreen() {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <AppParagraph>{longDevotionalContent}</AppParagraph>
      {/* More content */}
    </ScrollView>
  );
}
```

## Checklist for Adding New Text

When adding new text content:

- [ ] Is this a full-content view or a preview?
- [ ] If full-content, use `AppText` or remove `numberOfLines`
- [ ] Add `flexWrap: 'wrap'` to text styles
- [ ] Use `flex: 1` in parent if text should fill available space
- [ ] Wrap screen in `ScrollView` if content might overflow
- [ ] Test with long text (e.g., Psalm 119)
- [ ] Test on small screens (iPhone SE)

## Style Properties for Text Wrapping

```typescript
const textStyles = {
  // Core wrapping properties
  flexWrap: 'wrap',           // Allow text to wrap
  numberOfLines: 0,           // Unlimited lines (or omit)

  // Layout properties
  flex: 1,                    // Fill parent width

  // Readability properties
  lineHeight: fontSize * 1.5, // 1.4-1.6x recommended
  letterSpacing: 0.5,         // Optional, improves readability

  // Optional constraints
  maxWidth: 600,              // Limit line length for readability
};
```

## Testing

### Test Cases
1. **Short text** - "Hello"
2. **Medium text** - A full verse (John 3:16)
3. **Long text** - Psalm 119 (longest chapter)
4. **Special chars** - Quotation marks, em dashes, apostrophes

### Test Devices
- iPhone SE (small screen)
- iPhone 14 Pro (medium screen)
- iPad (large screen)
- Android emulator

### Test Commands
```bash
# Test on iOS
npx expo start --ios

# Test on Android
npx expo start --android

# Check for TypeScript errors
npx tsc --noEmit
```

## Common Mistakes

### Mistake 1: Forgetting flex: 1
```typescript
// ❌ BAD - Text won't wrap in flex row
<View style={{ flexDirection: 'row' }}>
  <Text>{number}</Text>
  <Text style={{ flexWrap: 'wrap' }}>{longText}</Text>
</View>

// ✅ GOOD - Text wraps properly
<View style={{ flexDirection: 'row' }}>
  <Text>{number}</Text>
  <Text style={{ flex: 1, flexWrap: 'wrap' }}>{longText}</Text>
</View>
```

### Mistake 2: Fixed height containers
```typescript
// ❌ BAD - Container clips text
<View style={{ height: 100 }}>
  <Text>{longText}</Text>
</View>

// ✅ GOOD - Container expands
<View style={{ minHeight: 100 }}>
  <Text>{longText}</Text>
</View>

// ✅ GOOD - ScrollView for overflow
<ScrollView style={{ maxHeight: 200 }}>
  <Text>{longText}</Text>
</ScrollView>
```

### Mistake 3: Forgetting multiline on TextInput
```typescript
// ❌ BAD - Single line input
<TextInput value={text} />

// ✅ GOOD - Multiline input
<TextInput
  multiline
  textAlignVertical="top"
  value={text}
/>
```

## Resources

- **React Native Text Docs**: https://reactnative.dev/docs/text
- **React Native StyleSheet**: https://reactnative.dev/docs/stylesheet
- **Flexbox Guide**: https://reactnative.dev/docs/flexbox

## Philosophy

> "We are not God, only helping others find HIM"

All text in the app should be fully accessible, especially Scripture and devotional content. Never truncate God's Word arbitrarily—let it flow naturally and completely.

---

**Need help?** Check [TEXT_TRUNCATION_FIX_SUMMARY.md](./TEXT_TRUNCATION_FIX_SUMMARY.md) for implementation details.
