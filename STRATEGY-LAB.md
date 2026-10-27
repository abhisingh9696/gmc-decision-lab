# GMC Strategy Lab — Economics-Driven Analysis (28 Oct 2026, corrected)

All numbers from OUR verified engine (4-quarter roll-forward from official 2016 Q2 closing
balances). Elasticities NEGATIVE as in the engine (−2.1/−1.8/−1.3). Downside = demand growth
×0.85 + rival prices ×0.95. Scenario set = 36 cases: elasticity {−1, −2.1, −3.4} × market
{−10%, base, +10%} × rivals {flat, −5%} × internet {normal, cyber −30%} (the 2016 Q2 business
report's cybercrime warning). Minimax-regret ranked.
This is model-based decision support — NOT verified against the official GMC engine.

NOTE: an earlier version of this lab accidentally ran positive elasticities (demand rising
with price). Results below are the corrected, validated runs. Parity-pricing results are
unchanged (1^ε = 1 for any ε) — a useful internal consistency check.

---

## 1. Measured demand economics (empirical probes on our engine)

### Price elasticity (constant per product, same in all markets)
| Product | Elasticity ε | Meaning |
|---|---|---|
| P1 | **−2.10** | very elastic — price cuts never pay; premium risky |
| P2 | **−1.80** | elastic |
| P3 | **−1.30** | inelastic — **the pricing-power product** |

Q2 ACTUAL evidence: we priced rel 1.35 → EU P1 orders fell 967→385 (−60%), implying ε up to
−3.4 — the elasticity is NOT officially disclosed, so scenario ranges matter (Section 2).

### Advertising response (square-root diminishing returns, measured)
| EU P1 product ads | Orders | Δ vs base |
|---|---|---|
| €5k (ref) | 1,222 | — |
| €10k | 1,400 | +14.6% (€28/order) |
| €20k | 1,650 | +35% (€40/order) |
| €40k | 2,005 | +64% (€56/order) |

- Unit contribution EU P1 ≈ €166 → ads are "cheap" per order **but production is capacity-capped in every quarter (93–94% machine utilisation)** — extra orders cannot be produced. Demand levers only pay when capacity has slack.
- Support 10→15k: +22.5% EU P1 orders for €5k (strongest channel lever). Commission 7→9%: +13.4%. Agent #4 arrives Q4.

### Q4 seasonality is the game: **1.38** vs Q3 1.06, Q1 0.85, Q2 0.95
Q4 demand at default prices ≈ 4,474 orders vs ~3,300 producible — **scarcity rent available**.

### Opening state verified vs official Q2 (W132162.xls)
**564 finished units** already in warehouses (EU 198/132/112, NAFTA 50/39/33) — free Q3
supply. Engine opening matches the official sheet on cash, deposit, receivables, payables,
retained earnings, machines, efficiency, workers (19 assembly / 24 machinists available).

---

## 2. Scenario-robust ranking (36 cases, minimax regret)

| Strategy | Base net | Base IP | Mean regret | Max regret | Worst case | Profitable |
|---|---:|---:|---:|---:|---:|---:|
| **W3 Peak harvest deep + finance** | **€625,281** | **€5,309,934** | **€65,652** | **€227,224** | −€210,216 | 33/36 |
| W7 Premium + Q4 bump | €567,338 | €5,215,958 | €93,651 | €315,514 | −€360,080 | 31/36 |
| W5 Moderate premium | €546,398 | €5,128,823 | €104,171 | €225,251 | −€269,817 | 33/36 |
| W4 Peak harvest SOFT | €525,859 | €5,158,513 | €115,797 | €368,614 | **−€158,647** | 34/36 |
| W2 Elastic-hedge fortress | €387,651 | €4,973,178 | €190,417 | €508,215 | **−€44,566** | 35/36 |
| W1 Parity volume | €386,016 | €4,986,070 | €194,272 | €527,787 | −€78,226 | 35/36 |

Finance layer (share issue +400k in Q4 once SP > €1.000, dividends 40%/40%, final-quarter
90% payout) adds **+€164k IP at zero operating risk** (W1 vs W6 comparison).

By elasticity family (base market/rivals): LOW-elasticity world → premium strategies win
(W7 €795k, W5 €685k); MID (our engine) → W3 €625k; HIGH (Q2-shock world) → W4 €481k while
W7 collapses to €286k and W5 to €342k.

Earlier one-shot tournament (single downside case): baseline €307,090 net / IP €4,644,299;
extension+machines blocked by factory space 375 m² (−€181k downside); futures overbuy drag
(−€60k); premium materials destroy margin (€35,500); ads-everywhere €−1.02M at the capacity wall.

---

## 3. The three recommended strategies

### 🥇 PRIMARY — W3 "Peak Harvest Deep" (best profit, IP, revenue AND lowest regret)
- **Q3:** P1/P2 at official rivals (325/490 EU), P3 +8% (756/783/918) · deliveries ×1.07 · maintenance 25
- **Q4 (seasonality 1.38):** P1 +15%, P2 +25%, P3 +28% → EU [374, 613, 896] · NAFTA [385, 613, 928] · NET [431, 738, 999] · deliveries ×1.07 · **issue +€400k** · dividend 40%
- **Q1-17:** back to official prices, P3 kept at 756 · deliveries ×1.03 · dividend 40%
- **Q2-17:** deliveries ×1.05 · **dividend 90%** (endgame payout)
- Forecast: rev €5.97M · net €625k · final IP €5.31M · min cash €2.09M (stress-adj €1.46M) · downside IP €3.79M
- Quarterly (base): Q3 €1,544,884 rev / €165,729 net · Q4 €1,749,803 / €267,371 · Q1 €1,285,170 / €75,058 · Q2 €1,392,070 / €117,123

### 🛡️ ROBUST — W4 "Peak Harvest Soft" (best worst-case among upside plays)
Same structure, Q4 only +15/12/8% (EU [374, 549, 742]…), P3 +8% persistent.
Forecast: rev €5.90M · net €526k · IP €5.16M · worst case −€159k · 34/36 profitable.

### 🏰 FORTRESS — W2 "Elastic-hedge" (survives everything)
P1 −5% below rivals (309 EU) to buy share where demand is most elastic, P2 at parity (490),
P3 +8% premium (756) where it is least elastic. Worst case across all 36 scenarios: −€45k.
Forecast: rev €5.75M · net €388k · IP €4.97M.

All three keep: no capex, no premium materials, no futures overbuy, insurance plan 1,
internet ports 5 (0.1% failed visits), R&D 25/15/15 continuing (2016 Q1 narrative:
quality upgrading), NET inventory not stuffed (2016 Q2 cyber warning).

---

## 4. Economics principles demonstrated
1. **Peak-load pricing** — ration Q4's 1.38× demand by price, not by stockout (biggest lever)
2. **Lerner markup** — premium ∝ 1/(1−1/|ε|): P3 −1.3 → biggest markup; P1 −2.1 → hold price
3. **Shadow price of capacity** — ads/support/commission worthless while utilisation >90%
4. **Backwardation hedging** — futures (77,070) < spot (84,547) in theory; in-model payment/storage drag → don't overbuy
5. **IP endgame** — dividends/issue scored directly in Investment Performance; timing beats size; issue only legal when prior-period SP > €1.000 (€0.9833 at Q3 = blocked)
6. **Capacity expansion** — blocked by factory space 375 m² + 1-quarter staff lead times within this horizon
7. **Quality premium** — premium materials (+50% cost) destroy margin; stars only pay via price tolerance
8. **Regret minimisation** — with undisclosed elasticity, pick the strategy that wins on average miss, not the one that wins one assumed world
