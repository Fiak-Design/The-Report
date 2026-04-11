# The Report — Scoring Algorithm Specification
### Version 2 — Confirmed & Final

> This document defines the complete scoring logic for The Report surf forecast app.
> Every spot produces a **Total Score (0–100)** from three additive category scores,
> gated by a tide multiplier. This spec is the source of truth for all scoring implementation in Swift.

---

## 1. Scoring Formula

Tide does **not** add points — it multiplies the total. This means:
- A perfect tide on a flat day scores low (swell/wind scores are low; 1.0× of low = still low).
- A great swell on the wrong tide scores low (high score × 0.15 = gutted).
- A great swell on a perfect tide scores high (high score × 1.0 = full value preserved).

```
baseScore = (sizeScore × 0.44) + (swellScore × 0.33) + (windScore × 0.22)

totalScore = clamp(baseScore × tideMultiplier, 0, 100)
```

### Display labels

| Score | Label |
|---|---|
| 90–100 | 🔥 Firing |
| 80–89 | ✅ Good |
| 50–79 | ⚠️ Marginal |
| 1–49 | ❌ Off |
| 0 | — Flat |

Colors are defined by the Figma design system — use named constants in Swift, not hardcoded hex values.

---

## 2. Size Score (0–100)

### 2a. Buoy conversion

NDBC 44098 reports significant wave height in **meters**. Convert to face height in feet:
```
faceHeightFt = buoyHeightMeters × 3.281 × 1.4
```

### 2b. Human-to-feet reference

| Descriptor | Feet |
|---|---|
| Ankle | 0.5–1.0 |
| Knee | 1.0–2.0 |
| Waist | 2.0–3.0 |
| Chest | 3.0–4.0 |
| Shoulder | 4.0–5.0 |
| Head High | 5.0–6.0 |
| Overhead | 6.0–7.5 |
| 1.5× Overhead | 7.5–9.0 |
| Double Overhead | 9.0–12.0 |

### 2c. Spot size ranges

| Spot | Min (ft) | Max (ft) | Notes |
|---|---|---|---|
| Triangle | 0 | ∞ | "Any" — always 100 |
| SouthSide | 6.0 | ∞ | Needs real size |
| Boars Head Point | 4.0 | ∞ | Shoulder high minimum |
| AHUUO's | 5.0 | 12.0 | Head–Double overhead |
| The Wall | 1.5 | 4.0 | "Friends & Family" — small fun waves |
| Pcove | 2.0 | ∞ | Waist high minimum |
| Low-Tide Freaks | 6.0 | ∞ | Needs serious size |
| Freaks | 5.0 | 8.0 | Head high to overhead |
| Costello's | 5.0 | 12.0 | Head high to double overhead |
| Fox Hill | 5.0 | 10.0 | Head high to 3–4ft overhead |
| Lynkies | 6.0 | ∞ | Bigger = better — NH big wave spot |
| Rye Rocks | 2.0 | ∞ | Works at almost any size |
| Adrian's | 2.0 | 6.0 | Waist to head high |
| Sawyers | 4.0 | 6.0 | Shoulder to head high |
| Jenness | 2.0 | 6.0 | Waist to head high |
| Straws | 4.0 | 9.0 | Shoulder to 1.5× overhead |
| Lucky's | 5.0 | ∞ | Head high minimum |
| Picnic Tables | 3.0 | 12.0 | Chest to double overhead |
| Odiorne Point | 4.0 | ∞ | 4ft minimum |

### 2d. Scoring logic

```swift
func sizeScore(heightFt: Double, spot: Spot) -> Double {
    // "Any" size — Triangle
    if spot.sizeMinFt == 0 && spot.sizeMaxFt == .infinity { return 100 }

    // Within ideal range
    if heightFt >= spot.sizeMinFt && heightFt <= spot.sizeMaxFt { return 100 }

    // Below minimum
    if heightFt < spot.sizeMinFt {
        let deficit = spot.sizeMinFt - heightFt
        return max(0, 100 - (deficit * 28))
    }

    // Above maximum (two-sided spots only)
    let overage = heightFt - spot.sizeMaxFt
    return max(0, 100 - (overage * 20))
}

// Lynkies special case — bigger is always better
func lynkiesSizeScore(heightFt: Double) -> Double {
    guard heightFt >= 6.0 else {
        return max(0, 100 - ((6.0 - heightFt) * 28))
    }
    return min(100, 70 + ((heightFt - 6.0) * 6))
}
```

---

## 3. Swell Quality Score (0–100)

```
swellScore = (directionScore × 0.45) + (periodScore × 0.40) + (energyScore × 0.15)
```

### 3a. Swell Direction Match (0–100)

Score the angular difference between current swell direction and the spot's nearest ideal direction (8-point compass):

| Angular difference | Score |
|---|---|
| 0° — exact | 100 |
| 22.5° | 80 |
| 45° | 55 |
| 67.5° | 30 |
| 90°+ | 0 |

**Spot ideal swell directions:**

| Spot | Directions |
|---|---|
| Triangle | SE, E |
| SouthSide | SE, E, NE |
| Boars Head Point | SE, E, NE |
| AHUUO's | SE, E, NE |
| The Wall | SE, E, NE |
| Pcove | SE, E, NE |
| Low-Tide Freaks | SE, E, NE |
| Freaks | SE, E, NE |
| Costello's | S, SE, E, NE, N |
| Fox Hill | S, SE, NE |
| Lynkies | S, SE, NE |
| Rye Rocks | S, SE, NE |
| Adrian's | S, SE, NE |
| Sawyers | S, SE, NE |
| Jenness | S, SE, NE |
| Straws | S, SE, NE |
| Lucky's | S, SE, NE |
| Picnic Tables | S, SE, NE |
| Odiorne Point | E, SE |

### 3b. Period Quality (0–100)

| Period (sec) | Score | Label |
|---|---|---|
| 16s+ | 100 | Elite groundswell |
| 14–16s | 90 | Strong groundswell |
| 12–14s | 75 | Good groundswell |
| 10–12s | 55 | Moderate |
| 8–10s | 35 | Borderline |
| 6–8s | 15 | Wind swell |
| < 6s | 0 | Choppy |

### 3c. Wave Energy Bonus (0–100)

```swift
let energyProxy = faceHeightFt * periodSeconds

func energyScore(_ proxy: Double) -> Double {
    switch proxy {
    case 80...:   return 100
    case 60..<80: return 80
    case 40..<60: return 60
    case 20..<40: return 35
    default:      return 10
    }
}
```

---

## 4. Wind Score (0–100)

```swift
windScore = clamp(directionScore + speedModifier, 0, 100)
```

### 4a. Direction score

Same angular difference logic as swell direction (8-point compass, nearest ideal direction).

| Angular difference | Score |
|---|---|
| 0° | 100 |
| 22.5° | 80 |
| 45° | 55 |
| 67.5° | 30 |
| 90°+ | 10 |

### 4b. Speed modifier

| Wind Speed | Modifier |
|---|---|
| 0–5 mph (calm) | +8 |
| 6–12 mph | 0 |
| 13–20 mph | −10 |
| 21–30 mph | −22 |
| 30+ mph | −40 |

### 4c. Spot ideal wind directions

| Spot | Directions |
|---|---|
| Triangle | SW |
| SouthSide | N, NE |
| Boars Head Point | SW, W, NW |
| AHUUO's | SW, S |
| The Wall | W, NW |
| Pcove | W, NW |
| Low-Tide Freaks | N, NE, NW |
| Freaks | SW, W, NW, N |
| Costello's | SW, W, NW |
| Fox Hill | W, NW |
| Lynkies | SW, W, NW |
| Rye Rocks | SW, W, N, NW |
| Adrian's | S, SW, W, SE |
| Sawyers | S, SW, W |
| Jenness | W |
| Straws | N, NW, W |
| Lucky's | SW, W, NW |
| Picnic Tables | SW, W, NW |
| Odiorne Point | W, NW |

---

## 5. Tide Multiplier (0.15–1.0)

Tide multiplies the base score — it cannot inflate a flat day but can gut a good one.

### 5a. Multiplier values

| Tide state vs. window | Multiplier |
|---|---|
| Perfectly within window | 1.0 |
| Within 30min of edge | 0.85 |
| 30–60min outside window | 0.60 |
| 60–90min outside window | 0.35 |
| 90min+ outside window | 0.15 |

**Push bonus:** For directional windows (incoming/outgoing), add +0.05 if tide is moving the correct direction (max 1.0).

### 5b. Spot tide windows

| Spot | Window |
|---|---|
| Triangle | Mid-High incoming — 2hr (1–3hr before high) |
| SouthSide | High Tide ±1.5hr |
| Boars Head Point | High Tide ±1.5hr |
| AHUUO's | High Tide ±1.5hr |
| The Wall | Low to Almost High — everything except ±30min of high |
| Pcove | Mid to Low — lower 40% of tidal range |
| Low-Tide Freaks | Low Tide ±1.5hr |
| Freaks | High Tide ±1.5hr |
| Costello's | Mid-High incoming — 4hr (1–5hr before high) |
| Fox Hill | High Tide ±1.5hr |
| Lynkies | Low Tide ±1.5hr |
| Rye Rocks | Mid Tide — 4.5hr window (middle 60% of range) |
| Adrian's | Low Tide ±1hr |
| Sawyers | High Tide ±1hr |
| Jenness | Any — always 1.0 |
| Straws | Mid Tide — 3hr window |
| Lucky's | High Tide ±1.5hr |
| Picnic Tables | High Tide ±1.5hr |
| Odiorne Point | Mid-High incoming — 2hr (1–3hr before high) |

---

## 6. Local Knowledge Warnings

Surface on Spot Detail screen. No effect on scoring.

| Spot | Warning |
|---|---|
| SouthSide | ⚠️ Be careful getting OUT of the water |
| AHUUO's | ⚠️ Don't get caught inside |
| Pcove | ⚠️ Heavy and hard |
| Low-Tide Freaks | ⚠️ Steep drop |
| Adrian's | ⚠️ Good luck |
| Picnic Tables | ⚠️ Don't get killed |
| Lynkies | ⚠️ NH's premier big wave spot |

---

## 7. Spot Order (South → North)

| # | Spot |
|---|---|
| 1 | Triangle |
| 2 | SouthSide |
| 3 | Boars Head Point |
| 4 | AHUUO's |
| 5 | The Wall |
| 6 | Pcove |
| 7 | Low-Tide Freaks |
| 8 | Freaks |
| 9 | Costello's |
| 10 | Fox Hill |
| 11 | Lynkies |
| 12 | Rye Rocks |
| 13 | Adrian's |
| 14 | Sawyers |
| 15 | Jenness |
| 16 | Straws |
| 17 | Lucky's |
| 18 | Picnic Tables |
| 19 | Odiorne Point |

---

## 8. Data Sources

| Data | Source | Endpoint | Refresh |
|---|---|---|---|
| Swell height, period, direction | NOAA NDBC Buoy 44098 | `https://www.ndbc.noaa.gov/data/realtime2/44098.txt` | Every 30 min |
| Wind speed & direction | Open-Meteo API | `https://api.open-meteo.com/v1/forecast?latitude=42.99&longitude=-70.74&hourly=windspeed_10m,winddirection_10m,windgusts_10m&wind_speed_unit=mph&forecast_days=5&timezone=America/New_York` | Hourly |
| Tide height & predictions | NOAA Tides & Currents | `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=8429489&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json` | Daily pre-fetch |
