# Variant Differences - A/B Testing

This document outlines the specific differences between Variant A and Variant B for A/B testing purposes.

## 🎯 Testing Hypothesis

**Goal:** Determine which landing page design and copy leads to higher conversion rates (CTA clicks).

## 📊 Variant Comparison

| Element | Variant A | Variant B |
|---------|-----------|-----------|
| **Main Headline** | "Plan your VFR routes in seconds" | "Your flight plan, simplified" |
| **Subheading** | "Learn how to do it in this short video" | "Watch this quick tutorial and start planning" |
| **Font Family** | Inter (professional, clean) | Poppins (modern, friendly) |
| **Video Format** | 9:16 aspect ratio (phone-like) | 9:16 aspect ratio (phone-like) |
| **Video Behavior** | Autoplay, muted, looping | Autoplay, muted, looping |
| **Video Style** | Rounded corners (3xl), centered | Rounded corners (3xl), centered |
| **CTA Button Text** | "Start Planning Your Flight" | "Get Started Now" |
| **CTA Button Color** | White with blue text | Emerald green with white text |
| **CTA Button Style** | `from-white to-blue-50` | `from-emerald-500 to-emerald-600` |
| **Dev Port** | 3001 | 3002 |
| **Variant ID** | `A` | `B` |

## 🔍 Key Differences Explained

### Variant A - Professional & Detailed
- **Tone:** More specific and action-oriented
- **Headline Focus:** Emphasizes speed ("in seconds")
- **Font:** Inter - Clean, professional, technical feel
- **CTA:** Longer, more descriptive ("Start Planning Your Flight")
- **Design:** Traditional, professional (blue/white button)
- **Typography:** Tighter letter spacing, more compact
- **Psychology:** Appeals to users who want clarity, detail, and professionalism

### Variant B - Modern & Direct
- **Tone:** Minimal and straightforward
- **Headline Focus:** Emphasizes simplicity ("simplified")
- **Font:** Poppins - Rounded, friendly, approachable feel
- **CTA:** Shorter, more urgent ("Get Started Now")
- **Design:** Modern, vibrant (green gradient button)
- **Typography:** Rounder letterforms, more playful
- **Psychology:** Appeals to users who want quick action and modern aesthetics

## 📈 What to Measure

### Primary Metric
- **Conversion Rate:** Percentage of visitors who click the CTA button

### Secondary Metrics
- **Time on Page:** Which variant keeps users engaged longer?
- **Video Completion Rate:** Which encourages more video views?
- **Bounce Rate:** Which has lower bounce rate?
- **Mobile vs Desktop:** Performance differences by device

## 🎨 Visual Differences

### Typography

**Variant A (Inter):**
- Geometric, neutral sans-serif
- Excellent readability at all sizes
- Professional, technical feel
- Popular in SaaS and tech products
- Letter spacing: Default (compact)

**Variant B (Poppins):**
- Geometric with rounded terminals
- Friendly, approachable personality
- Modern, trendy feel
- Popular in consumer-facing apps
- Letter spacing: Slightly wider (airy)

### Color Psychology

**Variant A (Blue/White):**
- Blue = Trust, professionalism, aviation
- White = Clean, simple, clear
- Appropriate for: Conservative users, professionals, pilots

**Variant B (Green):**
- Green = Action, go, growth, positive
- Creates strong visual contrast with blue background
- Appropriate for: Action-oriented users, quick decision makers

### Video Presentation

**Both Variants (Common):**
- Portrait orientation (9:16) - phone screen format
- Autoplay on load (muted for user experience)
- Continuous loop (no manual interaction required)
- Rounded corners (rounded-3xl) for modern feel
- Maximum width: 320px (phone-like appearance)
- Centered positioning
- Clean shadow and subtle border
- No overlay buttons or controls
- Plays directly on page background

## 💡 Testing Recommendations

### Minimum Sample Size
- At least 1,000 visitors per variant
- Or 100 conversions per variant
- Whichever comes first

### Duration
- Run test for at least 1-2 weeks
- Include weekdays and weekends
- Capture different traffic patterns

### Statistical Significance
- Aim for 95% confidence level
- Use A/B test calculator to determine winner
- Don't call it early - let data accumulate

## 📝 Expected Outcomes

### Possible Scenarios

**If Variant A Wins:**
- Users prefer detailed, specific copy
- Traditional aviation colors resonate better
- Descriptive CTAs perform better

**If Variant B Wins:**
- Users prefer simple, direct messaging
- Action colors (green) drive more clicks
- Short CTAs are more effective

**If Results are Similar:**
- Test was inconclusive
- May need more dramatic differences
- Consider testing other elements

## 🔄 Next Steps After Testing

### If Variant A Wins
1. Implement Variant A design across all landing pages
2. Test variations of Variant A (different headlines, etc.)
3. Consider A/A testing to validate results

### If Variant B Wins
1. Implement Variant B design across all landing pages
2. Test variations of Variant B (different CTAs, etc.)
3. Explore other "action-oriented" design elements

### Further Testing Ideas
- Test video position (top vs middle)
- Test with/without video
- Test different headlines
- Test button shapes (rounded vs square)
- Test page length (short vs long)
- Test social proof elements

## 🛠️ How to Create New Variants

If you want to test additional variants (C, D, etc.):

1. **Copy a variant:**
   ```bash
   cp -r variant-b variant-c
   ```

2. **Update configuration:**
   - Edit `package.json`: Change name and port
   - Edit `.env.local`: Set `NEXT_PUBLIC_VARIANT=C`

3. **Modify the landing page:**
   - Edit `src/components/MobileLandingPage.tsx`
   - Change headline, copy, colors, or layout

4. **Document changes:**
   - Update this file with new variant details
   - Add comparison data

## 📚 Resources

- [A/B Testing Calculator](https://www.optimizely.com/sample-size-calculator/)
- [Statistical Significance Calculator](https://abtestguide.com/calc/)
- [Conversion Rate Optimization Guide](https://cxl.com/conversion-rate-optimization/)

---

**Remember:** Always let tests run to completion. Making changes mid-test invalidates results!
