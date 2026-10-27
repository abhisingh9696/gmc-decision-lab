// Official 2016 Q2 actual results — transcribed from the management report W132162.xls
// (Group 13, Company 2). Every value verified against the named cell of the official file.
// This is the locked actual that follows the 5 history quarters (HstY15Q1 → HstY16Q1).
import type { HistoryQuarter } from './history';

export interface OfficialQuarter extends HistoryQuarter {
  currentAssets: number;   // FS R20 — €2,916,654 at 2016 Q2
  totalAssets: number;     // FS R21
  netAssets: number;       // FS R30
  deposit: number;         // FS X32 — term deposit inside the cash balance
  source: string;
}

export const Q2_OFFICIAL: OfficialQuarter = {
  q: '2016 Q2',
  revenue: 860997,          // FS L8
  cogs: 384741,             // FS L19
  opProfit: 59614,          // FS L24
  admin: 389872,            // FS F24
  pbt: 62489,               // FS L27
  tax: 0,                   // FS L28
  netProfit: 62489,         // FS L29
  retained: 18573,          // FS L35
  cash: 2201507,            // FS X31 cash balance incl. deposit (bank 1,051,507 + deposit 1,150,000)
  deposit: 1150000,         // FS X32
  dividends: 0,             // FS L32
  currentAssets: 2916654,   // FS R20
  totalAssets: 4260754,     // FS R21
  netAssets: 4018573,       // FS R30
  sharePrice: 0.9833,       // GI G35 (98.33 cents)
  invPerf: 3933200,         // GI G39
  machines: 4,              // RP G21
  eff: 93.3,                // RP G27
  visits: 9132,             // RP G43
  // RP rows 17/18/19 (orders) and 22/23/24 (sold), summed U/W/Y = EU/Nafta/Internet totals;
  // backlog rows 27/28 all zero (internet shortfall is lost demand, not backlogged).
  orders: [838, 121, 375],
  sold: [840, 121, 331],
  backlog: [0, 0, 0],
  source: 'W132162.xls — official 2016 Q2 management report',
};
