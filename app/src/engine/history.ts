// Actual results from the 5 GMC history sheets (HstY15Q1 – HstY16Q1)
// Historical template company column; current team is Group 13 / Company 2.
// Plus the locked official 2016 Q2 management report (W132162.xls).

export interface HistoryQuarter {
  q: string;
  revenue: number; cogs: number; opProfit: number; admin: number;
  pbt: number; tax: number; netProfit: number; retained: number;
  cash: number; dividends: number;
  sharePrice: number; invPerf: number;
  machines: number; eff: number; visits: number;
  orders: number[]; sold: number[]; backlog: number[]; // [EU, Nafta, Net] totals
  currentAssets?: number; netAssets?: number; deposit?: number; // absent in pre-extraction history; present from Q2 official
}

import { SOURCE } from './source-data';
import { Q2_OFFICIAL } from './q2-official';
export const HISTORY: HistoryQuarter[] = SOURCE.history;
/** All published actuals: 5 history quarters + the locked official 2016 Q2 report. */
export const HISTORY_ACTUALS: HistoryQuarter[] = [...HISTORY, Q2_OFFICIAL];
