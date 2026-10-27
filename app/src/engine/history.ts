// Actual results from the 5 GMC history sheets (HstY15Q1 – HstY16Q1)
// Historical template company column; current team is Group 13 / Company 2.

export interface HistoryQuarter {
  q: string;
  revenue: number; cogs: number; opProfit: number; admin: number;
  pbt: number; tax: number; netProfit: number; retained: number;
  cash: number; dividends: number;
  sharePrice: number; invPerf: number;
  machines: number; eff: number; visits: number;
  orders: number[]; sold: number[]; backlog: number[]; // [EU, Nafta, Net] totals
}

import { SOURCE } from './source-data';
export const HISTORY: HistoryQuarter[] = SOURCE.history;
