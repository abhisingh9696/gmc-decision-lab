// src/engine/model-options.ts
function resolveModel(x = {}) {
  const r = { inventoryValuation: "manual-standard", demandElasticityScale: 1, dividendSentimentWeight: 2, parityWeeksFactor: 1, ...x };
  if (!["manual-standard", "cost-pool"].includes(r.inventoryValuation) || !Number.isFinite(r.demandElasticityScale) || r.demandElasticityScale < 0.25 || r.demandElasticityScale > 3 || !Number.isFinite(r.dividendSentimentWeight) || r.dividendSentimentWeight < 0 || r.dividendSentimentWeight > 4 || !Number.isFinite(r.parityWeeksFactor) || r.parityWeeksFactor < 0 || r.parityWeeksFactor > 1) throw Error("Invalid model assumptions");
  return r;
}

// src/engine/source-data.ts
var SOURCE = { "files": [{ "file": "HstY15Q1.Xls", "sha256": "158c158a8a7c2c9423e7717dcc965ea1c2d67576aa3127fe53335e99a6f043c5", "sheets": [{ "name": "Your decisions", "rows": 47, "columns": 24, "populated": 210 }, { "name": "Resources and products", "rows": 51, "columns": 26, "populated": 273 }, { "name": "Financial statements", "rows": 46, "columns": 25, "populated": 211 }, { "name": "Group information", "rows": 114, "columns": 17, "populated": 519 }, { "name": "W", "rows": 861, "columns": 2, "populated": 863 }] }, { "file": "HstY15Q2(1).Xls", "sha256": "79bde101cebd8e8e46599625bcb70ea275138825cd5a4a8d7c5f785b78cef250", "sheets": [{ "name": "Your decisions", "rows": 47, "columns": 24, "populated": 210 }, { "name": "Resources and products", "rows": 51, "columns": 26, "populated": 273 }, { "name": "Financial statements", "rows": 46, "columns": 25, "populated": 211 }, { "name": "Group information", "rows": 114, "columns": 17, "populated": 519 }, { "name": "W", "rows": 861, "columns": 2, "populated": 863 }] }, { "file": "HstY15Q3(1).Xls", "sha256": "e85f70bfddc38c1ac3445c759a884322ffd6a141421946a58a259428e6f16369", "sheets": [{ "name": "Your decisions", "rows": 47, "columns": 24, "populated": 210 }, { "name": "Resources and products", "rows": 51, "columns": 26, "populated": 273 }, { "name": "Financial statements", "rows": 46, "columns": 25, "populated": 211 }, { "name": "Group information", "rows": 114, "columns": 17, "populated": 519 }, { "name": "W", "rows": 861, "columns": 2, "populated": 862 }] }, { "file": "HstY15Q4(1).Xls", "sha256": "eaaa1cd56a4b2e1c550f4a035ff0dbf063853ff3823cfe4ec82a77b34c0c4615", "sheets": [{ "name": "Your decisions", "rows": 47, "columns": 24, "populated": 210 }, { "name": "Resources and products", "rows": 51, "columns": 26, "populated": 273 }, { "name": "Financial statements", "rows": 46, "columns": 25, "populated": 211 }, { "name": "Group information", "rows": 114, "columns": 17, "populated": 519 }, { "name": "W", "rows": 861, "columns": 2, "populated": 864 }] }, { "file": "HstY16Q1(3).Xls", "sha256": "f13cbee573a5641b8aca8b8612e948e2fafa685d38f26c9065baa41f5cc14fbb", "sheets": [{ "name": "Your decisions", "rows": 47, "columns": 24, "populated": 210 }, { "name": "Resources and products", "rows": 51, "columns": 26, "populated": 273 }, { "name": "Financial statements", "rows": 46, "columns": 25, "populated": 211 }, { "name": "Group information", "rows": 114, "columns": 17, "populated": 519 }, { "name": "W", "rows": 861, "columns": 2, "populated": 863 }] }], "history": [{ "q": "2015 Q1", "revenue": 0, "cogs": 14573, "opProfit": -248763, "admin": 219190, "pbt": -239763, "tax": 0, "netProfit": -239763, "retained": -239763, "cash": 2833842, "dividends": 0, "sharePrice": 0.9131, "invPerf": 3652400, "machines": 2, "eff": 100, "visits": 0, "orders": [0, 0, 0], "sold": [0, 0, 0], "backlog": [0, 0, 0] }, { "q": "2015 Q2", "revenue": 489810, "cogs": 267205, "opProfit": -90902, "admin": 283883, "pbt": -84150, "tax": 0, "netProfit": -84150, "retained": -323913, "cash": 19e5, "dividends": 0, "sharePrice": 0.9745, "invPerf": 3898e3, "machines": 4, "eff": 99, "visits": 0, "orders": [1186, 0, 0], "sold": [1186, 0, 0], "backlog": [0, 0, 0] }, { "q": "2015 Q3", "revenue": 920610, "cogs": 485137, "opProfit": 62826, "admin": 343763, "pbt": 68076, "tax": 0, "netProfit": 68076, "retained": -255837, "cash": 1697541, "dividends": 0, "sharePrice": 1.0291, "invPerf": 4116400, "machines": 4, "eff": 98.2, "visits": 0, "orders": [2282, 0, 0], "sold": [2282, 0, 0], "backlog": [0, 0, 0] }, { "q": "2015 Q4", "revenue": 1228210, "cogs": 704934, "opProfit": 104274, "admin": 413468, "pbt": 108586, "tax": 0, "netProfit": 108586, "retained": -147251, "cash": 1695144, "dividends": 0, "sharePrice": 1.0497, "invPerf": 4198800, "machines": 4, "eff": 96.7, "visits": 4999, "orders": [2573, 390, 0], "sold": [2566, 384, 0], "backlog": [3, 3, 0] }, { "q": "2016 Q1", "revenue": 1314236, "cogs": 750076, "opProfit": 100460, "admin": 438377, "pbt": 103335, "tax": 0, "netProfit": 103335, "retained": -43916, "cash": 1976635, "dividends": 0, "sharePrice": 1.0801, "invPerf": 4320400, "machines": 4, "eff": 95.1, "visits": 6897, "orders": [1975, 373, 492], "sold": [1953, 373, 480], "backlog": [11, 1, 0] }], "opening": { "machineValue": 1070870, "buildingValue": 25e4, "materialsValue": 93582, "finishedGoodsValue": 23568, "receivables": 818125, "payables": 326696, "taxDue": 0, "termLoanAmt": 0, "shareCapital": 4e6, "sharePremium": 0, "retainedEarnings": -43916, "termDepositAmt": 115e4, "borrowingPower": 1542e3, "overdraftLimit": 618e3, "overdraft": 0, "cash": 826635, "taxableCarryforward": -43916, "machines": 4, "machineEfficiency": 95.1, "assemblyWorkers": 21, "machinists": 27, "factoryArea": 500, "landUnused": 300, "materialsStock": 1720, "agentsEU": 3, "distNafta": 1, "distNet": 1, "ports": 5, "sharePrice": 1.0801, "priorWage": 1200, "productStocks": [[110, 0, 0], [13, 9, 0], [12, 0, 8]], "backlog": [[0, 5, 6], [0, 0, 1], [0, 0, 0]], "componentWipUnits": [0, 0, 0] }, "sourceDecisions": { "advProd": [[5, 5, 10], [5, 5, 5], [5, 5, 5]], "prices": [[325, 490, 700], [335, 490, 725], [375, 590, 850]], "deliveries": [[1e3, 625, 325], [150, 150, 75], [250, 150, 100]], "advCorp": [10, 5, 10], "takeImprovement": [false, true, false], "rd": [25, 15, 15], "assemblyTimes": [115, 165, 325], "premium": [0, 0, 0], "subcontract": [0, 0, 0], "agentsEU": { "want": 3, "support": 10, "commission": 7 }, "distNafta": { "want": 1, "support": 8, "commission": 6 }, "distNet": { "support": 9, "commission": 5 }, "matSpot": 5, "matM3": 0, "matM6": 0, "maintenance": 20, "shift": 2, "ports": 5, "webDev": 15, "hire": 4, "train": 0, "wage": 1200, "mgmtBudget": 70, "trainingDays": 0, "shares": 0, "dividend": 0, "termLoan": 0, "termDeposit": 0, "machinesBuy": 0, "machinesSell": 0, "factoryExt": 0, "insurance": 1, "infoMarket": false, "infoCompetitors": true }, "context": { "exchangeRate": 0.9, "baseRate": 1, "buildingCostPerSqm": 500, "matPriceSpotUSD": 71919, "matPrice3mUSD": 67977, "matPrice6mUSD": 67171, "quoteMin": [124, 204, 314], "quoteMax": [157, 269, 411], "preciseRatings": [1.7, 2.63, 1.68], "referenceOrders": [[967, 634, 374], [157, 141, 75], [238, 162, 92]], "europeJourneyKm": 1381, "businessReport": "Upgrading the quality of goods to offset the advances of the opposition has become good management strategy.", "gdp": [4615, 5160, 5720], "unemployment": [9.7, 5.5] }, "mappings": [{ "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "L8", "target": "history.revenue", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "L19", "target": "history.cogs", "raw": 14573, "value": 14573, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "L24", "target": "history.opProfit", "raw": -248763, "value": -248763, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "F24", "target": "history.admin", "raw": 219190, "value": 219190, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "L27", "target": "history.pbt", "raw": -239763, "value": -239763, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "L28", "target": "history.tax", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "L29", "target": "history.netProfit", "raw": -239763, "value": -239763, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "L35", "target": "history.retained", "raw": -239763, "value": -239763, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "R19", "target": "history.cash", "raw": 2833842, "value": 2833842, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Financial statements", "cell": "L32", "target": "history.dividends", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Group information", "cell": "G35", "target": "history.sharePrice", "raw": 91.31, "value": 0.9131, "conversion": "explicit normalization" }, { "file": "HstY15Q1.Xls", "sheet": "Group information", "cell": "G39", "target": "history.invPerf", "raw": 3652400, "value": 3652400, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "G21", "target": "history.machines", "raw": 2, "value": 2, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "G27", "target": "history.eff", "raw": "100.0", "value": 100, "conversion": "explicit normalization" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "G43", "target": "history.visits", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "U17", "target": "history.orders[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "W17", "target": "history.orders[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "Y17", "target": "history.orders[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "U18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "W18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "Y18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "U19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "W19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "Y19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "U22", "target": "history.sold[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "W22", "target": "history.sold[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "Y22", "target": "history.sold[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "U23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "W23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "Y23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "U24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "W24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "Y24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "U27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "W27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "Y27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "U28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "W28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q1.Xls", "sheet": "Resources and products", "cell": "Y28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "L8", "target": "history.revenue", "raw": 489810, "value": 489810, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "L19", "target": "history.cogs", "raw": 267205, "value": 267205, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "L24", "target": "history.opProfit", "raw": -90902, "value": -90902, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "F24", "target": "history.admin", "raw": 283883, "value": 283883, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "L27", "target": "history.pbt", "raw": -84150, "value": -84150, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "L28", "target": "history.tax", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "L29", "target": "history.netProfit", "raw": -84150, "value": -84150, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "L35", "target": "history.retained", "raw": -323913, "value": -323913, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "R19", "target": "history.cash", "raw": 19e5, "value": 19e5, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Financial statements", "cell": "L32", "target": "history.dividends", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Group information", "cell": "G35", "target": "history.sharePrice", "raw": 97.45, "value": 0.9745, "conversion": "explicit normalization" }, { "file": "HstY15Q2(1).Xls", "sheet": "Group information", "cell": "G39", "target": "history.invPerf", "raw": 3898e3, "value": 3898e3, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "G21", "target": "history.machines", "raw": 4, "value": 4, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "G27", "target": "history.eff", "raw": " 99.0", "value": 99, "conversion": "explicit normalization" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "G43", "target": "history.visits", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "U17", "target": "history.orders[0]", "raw": 594, "value": 594, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "W17", "target": "history.orders[0]", "raw": 368, "value": 368, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "Y17", "target": "history.orders[0]", "raw": 224, "value": 224, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "U18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "W18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "Y18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "U19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "W19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "Y19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "U22", "target": "history.sold[0]", "raw": 594, "value": 594, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "W22", "target": "history.sold[0]", "raw": 368, "value": 368, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "Y22", "target": "history.sold[0]", "raw": 224, "value": 224, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "U23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "W23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "Y23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "U24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "W24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "Y24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "U27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "W27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "Y27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "U28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "W28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q2(1).Xls", "sheet": "Resources and products", "cell": "Y28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "L8", "target": "history.revenue", "raw": 920610, "value": 920610, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "L19", "target": "history.cogs", "raw": 485137, "value": 485137, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "L24", "target": "history.opProfit", "raw": 62826, "value": 62826, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "F24", "target": "history.admin", "raw": 343763, "value": 343763, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "L27", "target": "history.pbt", "raw": 68076, "value": 68076, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "L28", "target": "history.tax", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "L29", "target": "history.netProfit", "raw": 68076, "value": 68076, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "L35", "target": "history.retained", "raw": -255837, "value": -255837, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "R19", "target": "history.cash", "raw": 1697541, "value": 1697541, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Financial statements", "cell": "L32", "target": "history.dividends", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Group information", "cell": "G35", "target": "history.sharePrice", "raw": 102.91, "value": 1.0291, "conversion": "explicit normalization" }, { "file": "HstY15Q3(1).Xls", "sheet": "Group information", "cell": "G39", "target": "history.invPerf", "raw": 4116400, "value": 4116400, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "G21", "target": "history.machines", "raw": 4, "value": 4, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "G27", "target": "history.eff", "raw": " 98.2", "value": 98.2, "conversion": "explicit normalization" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "G43", "target": "history.visits", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "U17", "target": "history.orders[0]", "raw": 1210, "value": 1210, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "W17", "target": "history.orders[0]", "raw": 684, "value": 684, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "Y17", "target": "history.orders[0]", "raw": 388, "value": 388, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "U18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "W18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "Y18", "target": "history.orders[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "U19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "W19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "Y19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "U22", "target": "history.sold[0]", "raw": 1210, "value": 1210, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "W22", "target": "history.sold[0]", "raw": 684, "value": 684, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "Y22", "target": "history.sold[0]", "raw": 388, "value": 388, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "U23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "W23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "Y23", "target": "history.sold[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "U24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "W24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "Y24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "U27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "W27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "Y27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "U28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "W28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q3(1).Xls", "sheet": "Resources and products", "cell": "Y28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "L8", "target": "history.revenue", "raw": 1228210, "value": 1228210, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "L19", "target": "history.cogs", "raw": 704934, "value": 704934, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "L24", "target": "history.opProfit", "raw": 104274, "value": 104274, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "F24", "target": "history.admin", "raw": 413468, "value": 413468, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "L27", "target": "history.pbt", "raw": 108586, "value": 108586, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "L28", "target": "history.tax", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "L29", "target": "history.netProfit", "raw": 108586, "value": 108586, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "L35", "target": "history.retained", "raw": -147251, "value": -147251, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "R19", "target": "history.cash", "raw": 1695144, "value": 1695144, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Financial statements", "cell": "L32", "target": "history.dividends", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Group information", "cell": "G35", "target": "history.sharePrice", "raw": 104.97, "value": 1.0497, "conversion": "explicit normalization" }, { "file": "HstY15Q4(1).Xls", "sheet": "Group information", "cell": "G39", "target": "history.invPerf", "raw": 4198800, "value": 4198800, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "G21", "target": "history.machines", "raw": 4, "value": 4, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "G27", "target": "history.eff", "raw": " 96.7", "value": 96.7, "conversion": "explicit normalization" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "G43", "target": "history.visits", "raw": 4999, "value": 4999, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "U17", "target": "history.orders[0]", "raw": 1319, "value": 1319, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "W17", "target": "history.orders[0]", "raw": 805, "value": 805, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "Y17", "target": "history.orders[0]", "raw": 449, "value": 449, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "U18", "target": "history.orders[1]", "raw": 180, "value": 180, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "W18", "target": "history.orders[1]", "raw": 137, "value": 137, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "Y18", "target": "history.orders[1]", "raw": 73, "value": 73, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "U19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "W19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "Y19", "target": "history.orders[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "U22", "target": "history.sold[0]", "raw": 1319, "value": 1319, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "W22", "target": "history.sold[0]", "raw": 798, "value": 798, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "Y22", "target": "history.sold[0]", "raw": 449, "value": 449, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "U23", "target": "history.sold[1]", "raw": 180, "value": 180, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "W23", "target": "history.sold[1]", "raw": 137, "value": 137, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "Y23", "target": "history.sold[1]", "raw": 67, "value": 67, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "U24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "W24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "Y24", "target": "history.sold[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "U27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "W27", "target": "history.backlog[0]", "raw": 3, "value": 3, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "Y27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "U28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "W28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY15Q4(1).Xls", "sheet": "Resources and products", "cell": "Y28", "target": "history.backlog[1]", "raw": 3, "value": 3, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "L8", "target": "history.revenue", "raw": 1314236, "value": 1314236, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "L19", "target": "history.cogs", "raw": 750076, "value": 750076, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "L24", "target": "history.opProfit", "raw": 100460, "value": 100460, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "F24", "target": "history.admin", "raw": 438377, "value": 438377, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "L27", "target": "history.pbt", "raw": 103335, "value": 103335, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "L28", "target": "history.tax", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "L29", "target": "history.netProfit", "raw": 103335, "value": 103335, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "L35", "target": "history.retained", "raw": -43916, "value": -43916, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R19", "target": "history.cash", "raw": 1976635, "value": 1976635, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "L32", "target": "history.dividends", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "G35", "target": "history.sharePrice", "raw": 108.01, "value": 1.0801, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "G39", "target": "history.invPerf", "raw": 4320400, "value": 4320400, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G21", "target": "history.machines", "raw": 4, "value": 4, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G27", "target": "history.eff", "raw": " 95.1", "value": 95.1, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G43", "target": "history.visits", "raw": 6897, "value": 6897, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U17", "target": "history.orders[0]", "raw": 967, "value": 967, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W17", "target": "history.orders[0]", "raw": 634, "value": 634, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y17", "target": "history.orders[0]", "raw": 374, "value": 374, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U18", "target": "history.orders[1]", "raw": 157, "value": 157, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W18", "target": "history.orders[1]", "raw": 141, "value": 141, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y18", "target": "history.orders[1]", "raw": 75, "value": 75, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U19", "target": "history.orders[2]", "raw": 238, "value": 238, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W19", "target": "history.orders[2]", "raw": 162, "value": 162, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y19", "target": "history.orders[2]", "raw": 92, "value": 92, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U22", "target": "history.sold[0]", "raw": 967, "value": 967, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W22", "target": "history.sold[0]", "raw": 625, "value": 625, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y22", "target": "history.sold[0]", "raw": 361, "value": 361, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U23", "target": "history.sold[1]", "raw": 157, "value": 157, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W23", "target": "history.sold[1]", "raw": 141, "value": 141, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y23", "target": "history.sold[1]", "raw": 75, "value": 75, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U24", "target": "history.sold[2]", "raw": 238, "value": 238, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W24", "target": "history.sold[2]", "raw": 150, "value": 150, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y24", "target": "history.sold[2]", "raw": 92, "value": 92, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U27", "target": "history.backlog[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W27", "target": "history.backlog[0]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y27", "target": "history.backlog[0]", "raw": 6, "value": 6, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W28", "target": "history.backlog[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y28", "target": "history.backlog[1]", "raw": 1, "value": 1, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R11", "target": "opening.machineValue", "raw": 1070870, "value": 1070870, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R10", "target": "opening.buildingValue", "raw": 25e4, "value": 25e4, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R17", "target": "opening.materialsValue", "raw": 93582, "value": 93582, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R15", "target": "opening.finishedGoodsValue", "raw": 23568, "value": 23568, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R18", "target": "opening.receivables", "raw": 818125, "value": 818125, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R25", "target": "opening.payables", "raw": 326696, "value": 326696, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R24", "target": "opening.taxDue", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R28", "target": "opening.termLoanAmt", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R33", "target": "opening.shareCapital", "raw": 4e6, "value": 4e6, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R34", "target": "opening.sharePremium", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R35", "target": "opening.retainedEarnings", "raw": -43916, "value": -43916, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "X32", "target": "opening.termDepositAmt", "raw": 115e4, "value": 115e4, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "X35", "target": "opening.borrowingPower", "raw": 1542e3, "value": 1542e3, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "X34", "target": "opening.overdraftLimit", "raw": 618e3, "value": 618e3, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R26", "target": "opening.overdraft", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "R19", "target": "opening.totalCash", "raw": 1976635, "value": 1976635, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Financial statements", "cell": "F29", "target": "opening.taxableCarryforward", "raw": -43916, "value": -43916, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G21", "target": "opening.machines", "raw": 4, "value": 4, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G27", "target": "opening.machineEfficiency", "raw": " 95.1", "value": 95.1, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "N12", "target": "opening.assemblyWorkers", "raw": 21, "value": 21, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "O12", "target": "opening.machinists", "raw": 27, "value": 27, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G10", "target": "opening.factoryArea", "raw": 500, "value": 500, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G9", "target": "opening.landUnused", "raw": 300, "value": 300, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G35", "target": "opening.materialsStock", "raw": 1720, "value": 1720, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "M30", "target": "opening.agentsEU", "raw": 3, "value": 3, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "N30", "target": "opening.distNafta", "raw": 1, "value": 1, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "O30", "target": "opening.distNet", "raw": 1, "value": 1, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "G42", "target": "opening.ports", "raw": 5, "value": 5, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "G35", "target": "opening.sharePrice", "raw": 108.01, "value": 1.0801, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P25", "target": "opening.priorWage", "raw": 12, "value": 1200, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U31", "target": "opening.productStocks[0][0]", "raw": 110, "value": 110, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W31", "target": "opening.productStocks[0][1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y31", "target": "opening.productStocks[0][2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U32", "target": "opening.productStocks[1][0]", "raw": 13, "value": 13, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W32", "target": "opening.productStocks[1][1]", "raw": 9, "value": 9, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y32", "target": "opening.productStocks[1][2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U33", "target": "opening.productStocks[2][0]", "raw": 12, "value": 12, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W33", "target": "opening.productStocks[2][1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y33", "target": "opening.productStocks[2][2]", "raw": 8, "value": 8, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U27", "target": "opening.backlog[0][0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W27", "target": "opening.backlog[0][1]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y27", "target": "opening.backlog[0][2]", "raw": 6, "value": 6, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U28", "target": "opening.backlog[1][0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W28", "target": "opening.backlog[1][1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y28", "target": "opening.backlog[1][2]", "raw": 1, "value": 1, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U44", "target": "opening.componentWipUnits", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W44", "target": "opening.componentWipUnits", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y44", "target": "opening.componentWipUnits", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F14", "target": "decisions.advProd[0][0]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H14", "target": "decisions.advProd[0][1]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J14", "target": "decisions.advProd[0][2]", "raw": 10, "value": 10, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F15", "target": "decisions.advProd[1][0]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H15", "target": "decisions.advProd[1][1]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J15", "target": "decisions.advProd[1][2]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F16", "target": "decisions.advProd[2][0]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H16", "target": "decisions.advProd[2][1]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J16", "target": "decisions.advProd[2][2]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F19", "target": "decisions.prices[0][0]", "raw": 325, "value": 325, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H19", "target": "decisions.prices[0][1]", "raw": 490, "value": 490, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J19", "target": "decisions.prices[0][2]", "raw": 700, "value": 700, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F20", "target": "decisions.prices[1][0]", "raw": 335, "value": 335, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H20", "target": "decisions.prices[1][1]", "raw": 490, "value": 490, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J20", "target": "decisions.prices[1][2]", "raw": 725, "value": 725, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F21", "target": "decisions.prices[2][0]", "raw": 375, "value": 375, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H21", "target": "decisions.prices[2][1]", "raw": 590, "value": 590, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J21", "target": "decisions.prices[2][2]", "raw": 850, "value": 850, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F24", "target": "decisions.deliveries[0][0]", "raw": 1e3, "value": 1e3, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H24", "target": "decisions.deliveries[0][1]", "raw": 625, "value": 625, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J24", "target": "decisions.deliveries[0][2]", "raw": 325, "value": 325, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F25", "target": "decisions.deliveries[1][0]", "raw": 150, "value": 150, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H25", "target": "decisions.deliveries[1][1]", "raw": 150, "value": 150, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J25", "target": "decisions.deliveries[1][2]", "raw": 75, "value": 75, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F26", "target": "decisions.deliveries[2][0]", "raw": 250, "value": 250, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H26", "target": "decisions.deliveries[2][1]", "raw": 150, "value": 150, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J26", "target": "decisions.deliveries[2][2]", "raw": 100, "value": 100, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "E14", "target": "decisions.advCorp[0]", "raw": 10, "value": 10, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "E15", "target": "decisions.advCorp[1]", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "E16", "target": "decisions.advCorp[2]", "raw": 10, "value": 10, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F29", "target": "decisions.takeImprovement[0]", "raw": 0, "value": false, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H29", "target": "decisions.takeImprovement[1]", "raw": 1, "value": true, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J29", "target": "decisions.takeImprovement[2]", "raw": 0, "value": false, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F30", "target": "decisions.rd[0]", "raw": 25, "value": 25, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H30", "target": "decisions.rd[1]", "raw": 15, "value": 15, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J30", "target": "decisions.rd[2]", "raw": 15, "value": 15, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F31", "target": "decisions.assemblyTimes[0]", "raw": 115, "value": 115, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H31", "target": "decisions.assemblyTimes[1]", "raw": 165, "value": 165, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J31", "target": "decisions.assemblyTimes[2]", "raw": 325, "value": 325, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F32", "target": "decisions.premium[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H32", "target": "decisions.premium[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J32", "target": "decisions.premium[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "F35", "target": "decisions.subcontract[0]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "H35", "target": "decisions.subcontract[1]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "J35", "target": "decisions.subcontract[2]", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P14", "target": "decisions.agentsEU.want", "raw": 3, "value": 3, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "T14", "target": "decisions.agentsEU.support", "raw": 10, "value": 10, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W14", "target": "decisions.agentsEU.commission", "raw": 7, "value": 7, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P15", "target": "decisions.distNafta.want", "raw": 1, "value": 1, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "T15", "target": "decisions.distNafta.support", "raw": 8, "value": 8, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W15", "target": "decisions.distNafta.commission", "raw": 6, "value": 6, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "T16", "target": "decisions.distNet.support", "raw": 9, "value": 9, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W16", "target": "decisions.distNet.commission", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P19", "target": "decisions.matSpot", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "T19", "target": "decisions.matM3", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W19", "target": "decisions.matM6", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P20", "target": "decisions.maintenance", "raw": 20, "value": 20, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W20", "target": "decisions.shift", "raw": 2, "value": 2, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P21", "target": "decisions.ports", "raw": 5, "value": 5, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W21", "target": "decisions.webDev", "raw": 15, "value": 15, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P24", "target": "decisions.hire", "raw": 4, "value": 4, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W24", "target": "decisions.train", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P25", "target": "decisions.wage", "raw": 12, "value": 1200, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P26", "target": "decisions.mgmtBudget", "raw": 70, "value": 70, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W26", "target": "decisions.trainingDays", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P29", "target": "decisions.shares", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W29", "target": "decisions.dividend", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P30", "target": "decisions.termLoan", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W30", "target": "decisions.termDeposit", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P31", "target": "decisions.machinesBuy", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W31", "target": "decisions.machinesSell", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P32", "target": "decisions.factoryExt", "raw": 0, "value": 0, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W32", "target": "decisions.insurance", "raw": 1, "value": 1, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "P35", "target": "decisions.infoMarket", "raw": 0, "value": false, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Your decisions", "cell": "W35", "target": "decisions.infoCompetitors", "raw": 1, "value": true, "conversion": "explicit normalization" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "L10", "target": "parameters.exchangeRate", "raw": 0.9, "value": 0.9, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "G10", "target": "parameters.baseRate", "raw": 1, "value": 1, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "G13", "target": "parameters.buildingCostPerSqm", "raw": 500, "value": 500, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "G20", "target": "parameters.matPriceSpotUSD", "raw": 71919, "value": 71919, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "H20", "target": "parameters.matPrice3mUSD", "raw": 67977, "value": 67977, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "I20", "target": "parameters.matPrice6mUSD", "raw": 67171, "value": 67171, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "G16", "target": "parameters.subcontractQuoteRef.min", "raw": 124, "value": 124, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "H16", "target": "parameters.subcontractQuoteRef.min", "raw": 204, "value": 204, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "I16", "target": "parameters.subcontractQuoteRef.min", "raw": 314, "value": 314, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "G17", "target": "parameters.subcontractQuoteRef.max", "raw": 157, "value": 157, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "H17", "target": "parameters.subcontractQuoteRef.max", "raw": 269, "value": 269, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Group information", "cell": "I17", "target": "parameters.subcontractQuoteRef.max", "raw": 411, "value": 411, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U17", "target": "parameters.referenceOrders[0][0]", "raw": 967, "value": 967, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W17", "target": "parameters.referenceOrders[0][1]", "raw": 634, "value": 634, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y17", "target": "parameters.referenceOrders[0][2]", "raw": 374, "value": 374, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U18", "target": "parameters.referenceOrders[1][0]", "raw": 157, "value": 157, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W18", "target": "parameters.referenceOrders[1][1]", "raw": 141, "value": 141, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y18", "target": "parameters.referenceOrders[1][2]", "raw": 75, "value": 75, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "U19", "target": "parameters.referenceOrders[2][0]", "raw": 238, "value": 238, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "W19", "target": "parameters.referenceOrders[2][1]", "raw": 162, "value": 162, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "Y19", "target": "parameters.referenceOrders[2][2]", "raw": 92, "value": 92, "conversion": "none" }, { "file": "HstY16Q1(3).Xls", "sheet": "Resources and products", "cell": "M36", "target": "parameters.europeJourneyKm", "raw": 1381, "value": 1381, "conversion": "none" }], "counts": { "label-or-context": 2232, "historical-observation-retained": 2976, "formatting-placeholder": 537, "mapped-runtime-or-history": 320, "raw-helper-retained": 4315 }, "populatedCells": 10380, "coverageMeaning": "Mapped cells feed the runtime starting state, actual history, decisions or parameters. Other cells are preserved, not silently treated as forecast drivers. W is an undocumented duplicate/helper stream; precise ratings are retained as context, not substituted for rounded public star ratings." };

// src/engine/params.ts
var P = {
  // Table 5 — manufacturing
  machTimeMin: [60, 75, 120],
  // per unit
  minAssemblyMin: [100, 150, 300],
  materialContent: [1, 2, 3],
  // material units per product unit
  // Table 7 — machine hours per quarter per machine by shift level
  shiftMachHours: { 1: 576, 2: 1068, 3: 1602 },
  unskilledPerMachine: { 1: 4, 2: 8, 3: 12 },
  // Table 16/17 — worker hours & pay
  // Assembly is single-shift with AUTOMATIC overtime (more.htm):
  // 420 basic + up to 84 Saturday + up to 72 Sunday hours per worker per quarter.
  assemblyBasicHours: 420,
  assemblySaturdayHours: 84,
  assemblySundayHours: 72,
  assemblyAttendance: 0.97,
  // 3% absence allowance
  saturdayPremium: 1.5,
  // Saturday overtime paid at 1.5×
  sundayPremium: 2,
  // Sunday overtime paid at 2×
  unskilledWageRatio: 0.65,
  // of skilled rate
  shiftPremium: { 1: 0, 2: 1 / 3, 3: 2 / 3 },
  minWageCents: 900,
  // Table 18 — plant
  machineCost: 3e5,
  machineDepreciation: 0.025,
  // per quarter
  decommissionCharge: 6e4,
  // Table 6 — maintenance
  maintContractRate: 85,
  // €/hour
  maintBreakdownRate: 175,
  // Table 10 — production costs
  supervisionPerShift: 12500,
  overheadPerMachine: 3500,
  machineRunningPerHour: 8,
  planningPerUnit: 1,
  inspectionPerUnit: 1,
  // Table 8/9 — scrap & guarantee
  scrapValue: [40, 80, 120],
  guaranteeFee: [60, 150, 250],
  // Table 11/12 — distribution
  containerCap: [500, 250, 125],
  transportPerDay: 650,
  europeJourneyKm: SOURCE.context.europeJourneyKm,
  // whole reported journey, including return
  kmPerDay: 400,
  naftaContainerCrossing: 8e3,
  naftaPortKm: 250,
  netAgentKm: 150,
  // Table 13 — purchasing & warehousing
  purchasingAdmin: 7500,
  unplannedPremium: 0.1,
  // spot +10%
  premiumMaterialsPremium: 0.5,
  // spot +50%
  extStorageMaterial: 2.5,
  storageProductEU: 3.5,
  storageProductNaftaUSD: 4,
  // Table 3/4 — channels
  agentMinSupport: 5,
  // €'000
  agentSetup: 7500,
  agentTermination: 5e3,
  ispPerPort: 1e3,
  internetServicePct: 0.03,
  // of internet sales value
  // Table 15 — personnel
  recruitCost: 2e3,
  dismissCost: 5e3,
  trainCost: 8500,
  consultantPerDay: 1e3,
  // Table 20 — financial
  taxRate: 0.25,
  overdraftSpread: 0.04,
  unauthorisedSpread: 0.1,
  termLoanRate: 10,
  // % p.a. on term loans
  factoryFixedPerSqm: 20,
  // per quarter
  creditControlPerUnit: 1,
  creditCardPerUnit: 1,
  salesOfficePctOrders: 0.01,
  // Table 2 — information
  infoMarketCost: 5e3,
  infoCompetitorsCost: 7500,
  // Table 22 — insurance: plan -> [primaryRisk%, premium%] of (non-current assets + inventories)
  insurance: {
    0: { risk: 1, premium: 0 },
    1: { risk: 1e-3, premium: 6e-3 },
    2: { risk: 2e-3, premium: 35e-4 },
    3: { risk: 3e-3, premium: 2e-3 },
    4: { risk: 4e-3, premium: 1e-3 }
  },
  // Table 23 — customer credit (days)
  creditDays: [60, 90, 0],
  // Table 26 — space
  landUseMax: 0.8,
  factoryUseMax: 0.75,
  sqmPerMachine: 25,
  sqmPerWorker: 10,
  sqmPer1000Materials: 5,
  wipSqm: [0.25, 0.5, 1],
  // material prices ($ per '000 units) from 2016Q1 report
  matPriceSpotUSD: SOURCE.context.matPriceSpotUSD,
  matPrice3mUSD: SOURCE.context.matPrice3mUSD,
  matPrice6mUSD: SOURCE.context.matPrice6mUSD,
  // Table 21 — materials are valued at 90% of the LOWEST quoted price
  // (spot / 3-month / 6-month), converted to euros.
  matValuationDiscount: 0.9,
  // Table 21 — finished-goods standard cost build-up per product:
  // material content (at valuation) + machining hours × rate + assembly hours × rate.
  // Used to allocate opening stock value per product and to apportion the
  // production pool across products. Rates are model standards (€/hour).
  fgValMachineRate: 25,
  fgValAssemblyRate: 12.6,
  // subcontracted components: ordered this quarter, delivered next quarter as
  // machined components (WIP) that still need assembly. Cost per manual
  // (m2.htm): driven by the CURRENT material spot price, the premium-materials
  // share and the exchange rate, plus the subcontractor's machining margin.
  // Assembly cost is NOT included (we do it).
  // CALIBRATED to the official 2016 Q1 management report (HstY16Q1.Xls, Group
  // information sheet): "Component cost (€ per unit) — from (no premium
  // materials) 124 / 204 / 314, to (100% premium materials) 157 / 269 / 411",
  // quoted at spot $71,919/'000 and €0.9/$ → spotEURref 64.7271. The engine
  // derives a per-product contractor factor and a premium adder fraction from
  // these six endpoints, so every endpoint reproduces EXACTLY at reference
  // conditions, with linear interpolation in the premium-materials % and
  // sensible scaling under material-price / FX moves.
  subcontractQuoteRef: {
    spotEUR: 64.7271,
    // € per material unit at the quote
    min: SOURCE.context.quoteMin,
    // €/unit at 0% premium materials
    max: SOURCE.context.quoteMax
    // €/unit at 100% premium materials
  },
  buildingCostPerSqm: SOURCE.context.buildingCostPerSqm,
  // Table 25 — effective website capacity (visits/hour) by number of ports.
  // Intermediate port counts are linearly interpolated between these points.
  portCapacity: [[1, 2], [2, 7], [5, 31], [10, 81], [20, 190], [50, 537]],
  // ---- Calibration constants (heuristic demand model) ----
  // Base demand per [market][product] at reference conditions, seasonality = 1.0
  // Calibrated so the model reproduces actual 2016 Q1 orders (seasonality Q1 = 0.85).
  baseDemand: SOURCE.context.referenceOrders.map((row) => [row[0] / 0.85, row[1] / 0.85, row[2] / 0.85]),
  seasonalityByQ: [0.85, 0.95, 1.06, 1.38],
  // Q1 low, Q4 peak
  priceElasticity: [-2.1, -1.8, -1.3],
  // reference conditions (2016 Q1 decisions) for normalization
  refAdvProd: SOURCE.sourceDecisions.advProd,
  // €'000
  refAdvCorp: [10, 5, 10],
  refAgents: { n: 3, support: 10, comm: 7 },
  refDist: { n: 1, support: 8, comm: 6 },
  refNetDist: { support: 9, comm: 5 },
  refStars: [2, 3, 2],
  rejectBaseRate: 0.029,
  // ~3% of production rejected (from history)
  fxRef: 0.9
};

// src/engine/baseline.ts
function fgStdWeight(p, fx) {
  const matVal = P.matValuationDiscount * Math.min(P.matPriceSpotUSD, P.matPrice3mUSD, P.matPrice6mUSD) / 1e3 * fx;
  return P.materialContent[p] * matVal + P.machTimeMin[p] / 60 * P.fgValMachineRate + P.minAssemblyMin[p] / 60 * P.fgValAssemblyRate;
}
function baselineProductFGValue() {
  const units = [135, 9, 8];
  const w = [0, 1, 2].map((p) => fgStdWeight(p, 0.9));
  const denom = units.reduce((a, u, p) => a + u * w[p], 0);
  const total = 23568;
  return [0, 1, 2].map((p) => total * (units[p] * w[p]) / denom);
}
var QUARTERS = ["2016 Q2", "2016 Q3", "2016 Q4", "2017 Q1", "2017 Q2"];
var SEASON_IDX = [1, 2, 3, 0, 1];
function baselineState() {
  const state = {
    quarterLabel: "2016 Q2",
    seasonIndex: 1,
    machines: 4,
    machineEfficiency: 95.1,
    machineValue: 1070870,
    assemblyWorkers: 21,
    machinists: 27,
    factoryArea: 500,
    landUnused: 300,
    machinesPipeline: 0,
    workersPipeline: 0,
    traineesPipeline: 0,
    factoryExtPipeline: 0,
    agentsPipeline: 0,
    portsPipeline: null,
    subcontractPipeline: [0, 0, 0],
    subcontractPipelineVal: [0, 0, 0],
    subcontractPayable: 0,
    matPipeline3: 0,
    matPipeline6: 0,
    materialsStock: 1720,
    componentWipUnits: [0, 0, 0],
    componentWipValue: [0, 0, 0],
    productStocks: [
      [110, 0, 0],
      [13, 9, 0],
      [12, 0, 8]
    ],
    backlog: [
      [0, 5, 6],
      [0, 0, 1],
      [0, 0, 0]
    ],
    agentsEU: 3,
    distNafta: 1,
    distNet: 1,
    ports: 5,
    cash: 826635,
    // 1,976,635 total incl. 1,150,000 term deposit
    termDepositAmt: 115e4,
    receivables: 818125,
    payables: 326696,
    taxDue: 0,
    termLoanAmt: 0,
    shareCapital: 4e6,
    shareCapYearStart: 4e6,
    // 2016 opening issued capital (annual ±10% cap basis)
    sharesIssuedThisYear: 0,
    sharesRepurchasedThisYear: 0,
    retainedEarnings: -43916,
    sharePrice: 1.0801,
    machineryBoughtThisYear: 0,
    corpImage: [10, 5, 10],
    // = last quarter corporate ad spend (index base)
    webImage: 15,
    stars: [2, 3, 2],
    rdProgress: [25, 15, 15],
    cumDividends: 0,
    cumRepurchases: 0,
    cumIssues: 0,
    taxableCarryforward: -43916,
    improvementsAvailable: [true, false, false],
    // P1 major pending; P2 minor was consumed in 2016 Q1
    priorWage: 1200,
    overdraftLimit: 618e3,
    borrowingPower: 1542e3,
    // per 2016 Q1 management report
    sharePremium: 0,
    finishedGoodsValue: 23568,
    // per 2016 Q1 report (= sum of productFGValue)
    productFGValue: baselineProductFGValue(),
    materialsValue: 93582,
    // per 2016 Q1 report (Table 21 basis: 1,720 u × €54.41)
    matPipeline3Val: 0,
    matPipeline6Val: 0,
    buildingValue: 25e4,
    capitalWip: 0,
    overdraft: 0,
    mgmtBudgetEffective: 70,
    // €'000 — 2016 Q1 actual management budget
    mgmtBudgetPending: null
  };
  return { ...state, ...SOURCE.opening };
}
function defaultDecisions() {
  const d = structuredClone(SOURCE.sourceDecisions);
  d.takeImprovement = [false, false, false];
  d.infoMarket = true;
  return d;
}
function defaultEcon(seasonIdx) {
  return {
    exchangeRate: SOURCE.context.exchangeRate,
    baseRate: SOURCE.context.baseRate,
    seasonality: [0.85, 0.95, 1.06, 1.38][seasonIdx],
    growth: 1.01,
    compPrices: structuredClone(SOURCE.sourceDecisions.prices)
  };
}

// src/engine/decision-schema.ts
var DECISION_FIELDS = [];
var add = (path, label, min = 0, max = 99, boolean = false) => DECISION_FIELDS.push({ path, label, min, max, boolean });
var markets = ["EU", "NAFTA", "NET"];
for (const [key, label, max] of [["advCorp", "Corporate advertising \u20AC'000", 99]]) for (let m = 0; m < 3; m++) add([key, m], `${label} ${markets[m]}`, 0, max);
for (const [key, label, max] of [["advProd", "Product advertising \u20AC'000", 99], ["prices", "Price \u20AC", 999], ["deliveries", "Make & ship units", 9999]]) for (let m = 0; m < 3; m++) for (let p = 0; p < 3; p++) add([key, m, p], `${label} ${markets[m]} P${p + 1}`, key === "deliveries" && m !== 1 ? -999 : 0, max);
for (let p = 0; p < 3; p++) add(["takeImprovement", p], `Take P${p + 1} major improvement`, 0, 1, true);
for (const [key, label, max] of [["rd", "R&D \u20AC'000", 99], ["assemblyTimes", "Assembly minutes", 999], ["premium", "Premium materials %", 100], ["subcontract", "Subcontract components", 9999]]) for (let p = 0; p < 3; p++) add([key, p], `${label} P${p + 1}`, key === "assemblyTimes" ? [100, 150, 300][p] : 0, max);
for (const [key, label] of [["agentsEU", "EU agents"], ["distNafta", "NAFTA distributors"], ["distNet", "NET distributor"]]) for (const part of key === "distNet" ? ["support", "commission"] : ["want", "support", "commission"]) add([key, part], `${label} ${part}`, part === "support" ? 5 : 0, 99);
var scalar = [["matSpot", "Materials spot '000", 0, 99], ["matM3", "Materials 3-month '000", 0, 99], ["matM6", "Materials 6-month '000", 0, 99], ["maintenance", "Maintenance hours/machine", 0, 99], ["shift", "Shift level", 1, 3], ["ports", "Website ports", 0, 99], ["webDev", "Website development \u20AC'000", 0, 999], ["hire", "Hire +/dismiss \u2212", -9, 99], ["train", "Workers to train", 0, 9], ["wage", "Assembly wage cents/hour", 900, 9999], ["mgmtBudget", "Management budget \u20AC'000", 30, 999], ["trainingDays", "Consultant days", 0, 90], ["shares", "Share issue/repurchase '000", -999, 999], ["dividend", "Dividend cents/share", 0, 99], ["termLoan", "Term loan \u20AC'000", 0, 9999], ["termDeposit", "Deposit change \u20AC'000", -999, 9999], ["machinesBuy", "Machines to buy", 0, 99], ["machinesSell", "Machines to sell", 0, 99], ["factoryExt", "Factory extension m\xB2", 0, 9999], ["insurance", "Insurance plan", 0, 4]];
for (const [key, label, min, max] of scalar) add([key], label, min, max);
add(["infoMarket"], "Purchase market shares", 0, 1, true);
add(["infoCompetitors"], "Purchase corporate activity", 0, 1, true);
function fieldValue(o, path) {
  let x = o;
  for (const k of path) {
    if (x == null) return void 0;
    x = x[k];
  }
  return x;
}
function setField(o, path, value) {
  let x = o;
  for (const k of path.slice(0, -1)) x = x[k];
  x[path[path.length - 1]] = value;
}
function validDecisions(x) {
  return DECISION_FIELDS.every((f) => {
    const v = fieldValue(x, f.path);
    return f.boolean ? typeof v === "boolean" : typeof v === "number" && Number.isFinite(v);
  }) && ["advCorp", "rd", "assemblyTimes", "premium", "subcontract", "takeImprovement"].every((k) => Array.isArray(x[k]) && x[k].length === 3) && ["advProd", "prices", "deliveries"].every((k) => {
    const m = x[k];
    return Array.isArray(m) && m.length === 3 && m.every((r) => Array.isArray(r) && r.length === 3);
  });
}
function validEcon(x) {
  if (!x || typeof x !== "object") return false;
  const e = x;
  return [e.exchangeRate, e.seasonality, e.growth].every((v) => Number.isFinite(v) && v >= 0.01) && e.exchangeRate <= 10 && e.growth <= 5 && e.seasonality <= 5 && Number.isFinite(e.baseRate) && e.baseRate >= 0 && e.baseRate <= 100 && Array.isArray(e.compPrices) && e.compPrices.length === 3 && e.compPrices.every((r) => Array.isArray(r) && r.length === 3 && r.every((v) => Number.isFinite(v) && v >= 1 && v <= 999));
}

// src/engine/simulate-fin.ts
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var eur = (n) => Math.round(n);
function finishQuarter(s, d, econ, w, mid, model) {
  const qOfYear = parseInt(s.quarterLabel.slice(-1), 10);
  const openingCash = s.cash;
  const openingOverdraft = s.overdraft;
  const openingReceivables = s.receivables;
  const openingPayables = s.payables;
  const openingRetained = s.retainedEarnings;
  const openingSubcontractPayable = s.subcontractPayable;
  const { sales, orders, productionActual, rejects } = mid;
  const totalProduced = productionActual.reduce((a, b) => a + b, 0);
  let revenue = 0, orderValue = 0;
  for (let m = 0; m < 3; m++) for (let p = 0; p < 3; p++) {
    revenue += sales[m][p] * d.prices[m][p];
    orderValue += orders[m][p] * d.prices[m][p];
  }
  const marketRevenue = revenue;
  const scrapProceeds = rejects.reduce((a, n, p) => a + n * P.scrapValue[p], 0);
  const spotEUR = P.matPriceSpotUSD / 1e3 * econ.exchangeRate;
  const matUnitVal = P.matValuationDiscount * Math.min(
    spotEUR,
    P.matPrice3mUSD / 1e3 * econ.exchangeRate,
    P.matPrice6mUSD / 1e3 * econ.exchangeRate
  );
  const arrivalUnits = s.matPipeline3 * 1e3;
  const arrivalVal = s.matPipeline3Val;
  s.matPipeline3 = s.matPipeline6;
  s.matPipeline3Val = s.matPipeline6Val;
  s.matPipeline6 = 0;
  s.matPipeline6Val = 0;
  const spotUnits = d.matSpot * 1e3;
  const spotVal = spotUnits * spotEUR;
  const availUnits = mid.openingMaterialsUnits + arrivalUnits + spotUnits;
  const availVal = mid.openingMaterialsValue + arrivalVal + spotVal;
  const materialsShortfall = Math.max(0, mid.materialsConsumed - availUnits);
  const emergencyVal = materialsShortfall * spotEUR * (1 + P.unplannedPremium);
  if (materialsShortfall > 0) {
    w.push({
      severity: "warn",
      title: "Emergency material purchase",
      detail: `Short ${eur(materialsShortfall)} material units \u2014 auto-bought on spot market at +10% premium (\u20AC${eur(emergencyVal).toLocaleString()}, fully charged to cost of sales and supplier payments). Order more spot/futures next time.`
    });
  }
  const consumedUnits = mid.materialsConsumed - materialsShortfall;
  const premiumAdder = [0, 1, 2].reduce((a, p) => a + mid.machinedActual[p] * P.materialContent[p] * spotEUR * (d.premium[p] / 100) * P.premiumMaterialsPremium, 0);
  s.materialsStock = availUnits - consumedUnits;
  s.materialsValue = s.materialsStock * matUnitVal;
  let materialCostEUR = availVal + emergencyVal - s.materialsValue + premiumAdder;
  const futureOrderedCost = d.matM3 * P.matPrice3mUSD * econ.exchangeRate + d.matM6 * P.matPrice6mUSD * econ.exchangeRate;
  if (model.inventoryValuation === "manual-standard") {
    const closingOnOrderUnits = (s.matPipeline3 + d.matM3 + d.matM6) * 1e3;
    materialCostEUR += s.matPipeline3Val + futureOrderedCost - closingOnOrderUnits * matUnitVal;
  }
  const wageEUR = d.wage / 100;
  const unskilledWage = wageEUR * P.unskilledWageRatio;
  const requiredMachinists = s.machines * P.unskilledPerMachine[d.shift];
  const recruitedMachinists = Math.max(0, requiredMachinists - s.machinists);
  const dismissedMachinists = Math.ceil(Math.max(0, s.machinists - requiredMachinists) / 2);
  s.machinists += recruitedMachinists - dismissedMachinists;
  const hoursPerMachinist = requiredMachinists > 0 ? mid.physicalMachineHours * 4 / requiredMachinists : 0;
  const basicMachinistHours = Math.max(360, Math.min(420, hoursPerMachinist));
  const saturdayMachinistHours = Math.min(d.shift === 1 ? 84 : 42, Math.max(0, hoursPerMachinist - 420));
  const sundayMachinistHours = Math.min(72, Math.max(0, hoursPerMachinist - 420 - (d.shift === 1 ? 84 : 42)));
  const payPerMachinist = (basicMachinistHours + saturdayMachinistHours * 1.5 + sundayMachinistHours * 2) * unskilledWage * (1 + P.shiftPremium[d.shift]);
  const machinistWages = s.machinists * payPerMachinist;
  const assemblyTimeWages = (mid.assemblyTiers.basic + mid.assemblyTiers.saturday * P.saturdayPremium + mid.assemblyTiers.sunday * P.sundayPremium) * wageEUR;
  const parityPayment = assemblyTimeWages > 0 ? Math.max(0, s.assemblyWorkers * payPerMachinist * model.parityWeeksFactor - assemblyTimeWages) : 0;
  const assemblyWages = assemblyTimeWages + parityPayment;
  const runningCosts = mid.physicalMachineHours * P.machineRunningPerHour;
  const supervision = P.supervisionPerShift * d.shift;
  const prodOverheads = P.overheadPerMachine * s.machines;
  const planning = totalProduced * P.planningPerUnit;
  const inspection = (totalProduced + rejects.reduce((a, b) => a + b, 0)) * P.inspectionPerUnit;
  const maintenanceCost = d.maintenance * s.machines * P.maintContractRate + (d.maintenance < 12 ? (12 - d.maintenance) * s.machines * P.maintBreakdownRate : 0);
  let obsoleteProceeds = 0;
  const fgPoolVal = [0, 0, 0];
  const fgPoolUnits = [0, 0, 0];
  for (let p = 0; p < 3; p++) {
    const openUnits = mid.openingFGUnitsByProduct[p];
    const openVal = s.productFGValue[p];
    const unitVal = openUnits > 0 ? openVal / openUnits : 0;
    obsoleteProceeds += mid.obsoleteByProduct[p] * unitVal;
    fgPoolVal[p] = openVal - mid.obsoleteByProduct[p] * unitVal;
    fgPoolUnits[p] = openUnits - mid.obsoleteByProduct[p];
  }
  let machineSaleProceeds = 0, decommissionCost = 0;
  if (d.machinesSell > 0) {
    const sold = Math.min(d.machinesSell, s.machines);
    if (sold !== d.machinesSell) w.push({ severity: "critical", title: "Machine sale capped", adjustment: true, detail: `Requested ${d.machinesSell}; only ${sold} machines can be sold. Effective sale ${sold}.` });
    d.machinesSell = sold;
    if (sold > 0) {
      const soldBook = sold * (s.machineValue / s.machines);
      s.machines -= sold;
      s.machineValue -= soldBook;
      decommissionCost = sold * P.decommissionCharge;
      machineSaleProceeds = soldBook;
      w.push({
        severity: "info",
        title: "Machines sold",
        detail: `${sold} machine(s) sold \u2014 gross proceeds \u20AC${eur(soldBook).toLocaleString()}; decommissioning \u20AC${eur(decommissionCost).toLocaleString()} expensed once and paid via suppliers.`
      });
    }
  }
  const advTotal = (d.advCorp.reduce((a, b) => a + b, 0) + d.advProd.flat().reduce((a, b) => a + b, 0)) * 1e3;
  const rdTotal = d.rd.reduce((a, b) => a + b, 0) * 1e3;
  const agentsCost = s.agentsEU * d.agentsEU.support * 1e3 + s.distNafta * d.distNafta.support * 1e3 + s.distNet * d.distNet.support * 1e3 + Math.max(0, d.agentsEU.want - s.agentsEU) * P.agentSetup + Math.max(0, s.agentsEU - d.agentsEU.want) * P.agentTermination + Math.max(0, d.distNafta.want - s.distNafta) * P.agentSetup + Math.max(0, s.distNafta - d.distNafta.want) * P.agentTermination + (mid.internetChange === "open" ? P.agentSetup : mid.internetChange === "close" ? P.agentTermination : 0) + d.agentsEU.commission / 100 * (orders[0][0] * d.prices[0][0] + orders[0][1] * d.prices[0][1] + orders[0][2] * d.prices[0][2]) + d.distNafta.commission / 100 * (sales[1][0] * d.prices[1][0] + sales[1][1] * d.prices[1][1] + sales[1][2] * d.prices[1][2]) + d.distNet.commission / 100 * (sales[2][0] * d.prices[2][0] + sales[2][1] * d.prices[2][1] + sales[2][2] * d.prices[2][2]);
  const ispCost = (mid.internetChange === "open" ? 7500 : mid.internetChange === "close" ? 5e3 : 0) + s.ports * P.ispPerPort + P.internetServicePct * (sales[2][0] * d.prices[2][0] + sales[2][1] * d.prices[2][1] + sales[2][2] * d.prices[2][2]);
  const salesOffice = P.salesOfficePctOrders * orderValue;
  const guaranteeCost = (sales[0][0] + sales[1][0] + sales[2][0]) * P.guaranteeFee[0] * 0.02 + (sales[0][1] + sales[1][1] + sales[2][1]) * P.guaranteeFee[1] * 0.02 + (sales[0][2] + sales[1][2] + sales[2][2]) * P.guaranteeFee[2] * 0.02;
  const personnelCost = recruitedMachinists * 1e3 + dismissedMachinists * 2e3 + Math.max(0, d.hire) * P.recruitCost + Math.max(0, -d.hire) * P.dismissCost + d.train * P.trainCost + d.trainingDays * P.consultantPerDay;
  const factoryFixed = P.factoryFixedPerSqm * s.factoryArea;
  const infoCost = (d.infoMarket ? P.infoMarketCost : 0) + (d.infoCompetitors ? P.infoCompetitorsCost : 0);
  const creditControl = P.creditControlPerUnit * (sales[0].reduce((a, b) => a + b, 0) + sales[1].reduce((a, b) => a + b, 0)) + P.creditCardPerUnit * sales[2].reduce((a, b) => a + b, 0);
  const webDevCost = d.webDev * 1e3;
  const mgmtCost = s.mgmtBudgetEffective * 1e3;
  const loads = (m) => {
    const units = [mid.delivered[m][0], mid.delivered[m][1], mid.delivered[m][2]];
    return Math.ceil(units[0] / P.containerCap[0] + units[1] / P.containerCap[1] + units[2] / P.containerCap[2]);
  };
  const euDays = Math.ceil(P.europeJourneyKm / P.kmPerDay);
  const transportCost = loads(0) * euDays * P.transportPerDay + loads(1) * (Math.ceil(2 * P.naftaPortKm / P.kmPerDay) * P.transportPerDay + P.naftaContainerCrossing) + loads(2) * Math.ceil(P.netAgentKm / P.kmPerDay) * P.transportPerDay;
  const spaceNeeded = s.machines * P.sqmPerMachine + s.assemblyWorkers * P.sqmPerWorker + s.materialsStock / 1e3 * P.sqmPer1000Materials + s.componentWipUnits[0] * P.wipSqm[0] + s.componentWipUnits[1] * P.wipSqm[1] + s.componentWipUnits[2] * P.wipSqm[2];
  const spaceAvail = s.factoryArea * P.factoryUseMax;
  if (spaceNeeded > spaceAvail) w.push({
    severity: "warn",
    title: "Factory space overflow",
    detail: `Need ~${eur(spaceNeeded)} m\xB2 vs ${eur(spaceAvail)} m\xB2 usable. Excess materials/WIP stored externally at extra cost; new hires/machines may be capped.`
  });
  let warehousing = 0;
  for (let p = 0; p < 3; p++) for (let m = 0; m < 3; m++) {
    const average = (mid.openingProductStocks[m][p] + s.productStocks[m][p]) / 2;
    warehousing += average * (m === 1 ? P.storageProductNaftaUSD * econ.exchangeRate : P.storageProductEU);
  }
  const avgMaterials = (mid.openingMaterialsUnits + s.materialsStock) / 2;
  const avgComponents = [0, 1, 2].map((p) => (mid.openingComponentUnits[p] + s.componentWipUnits[p] - mid.compUsed[p]) / 2);
  const componentArea = avgComponents.reduce((a, n, p) => a + n * P.wipSqm[p], 0);
  const availableStorageArea = Math.max(0, spaceAvail - s.machines * P.sqmPerMachine - s.assemblyWorkers * P.sqmPerWorker);
  let overflow = Math.max(0, avgMaterials / 1e3 * P.sqmPer1000Materials + componentArea - availableStorageArea);
  const externalMaterials = Math.min(avgMaterials, overflow * 1e3 / P.sqmPer1000Materials);
  overflow = Math.max(0, overflow - externalMaterials / 1e3 * P.sqmPer1000Materials);
  const externalComponents = componentArea > 0 ? avgComponents.reduce((a, n) => a + n, 0) * Math.min(1, overflow / componentArea) : 0;
  warehousing += externalMaterials * P.extStorageMaterial + externalComponents * 3;
  const insPlan = P.insurance[d.insurance];
  const insurancePremium = insPlan.premium * mid.openingInsuredBase;
  const adminExpenses = advTotal + agentsCost + ispCost + salesOffice + guaranteeCost + rdTotal + webDevCost + personnelCost + maintenanceCost + P.purchasingAdmin + infoCost + creditControl + insurancePremium + mgmtCost + factoryFixed + warehousing + decommissionCost;
  const depreciation = s.machineValue * P.machineDepreciation;
  s.machineValue -= depreciation;
  const productionPool = materialCostEUR + machinistWages + assemblyWages + runningCosts + supervision + prodOverheads + planning + inspection;
  const stdW = [0, 1, 2].map((p) => P.materialContent[p] * matUnitVal + P.machTimeMin[p] / 60 * P.fgValMachineRate + P.minAssemblyMin[p] / 60 * P.fgValAssemblyRate);
  const usedComponentValues = [0, 0, 0];
  for (let p = 0; p < 3; p++) {
    const wipU = s.componentWipUnits[p];
    if (wipU > 0 && mid.compUsed[p] > 0) {
      const wipUnitCost = s.componentWipValue[p] / wipU;
      const consumed = mid.compUsed[p] * wipUnitCost;
      usedComponentValues[p] = consumed;
      fgPoolVal[p] += consumed;
      s.componentWipUnits[p] -= mid.compUsed[p];
      s.componentWipValue[p] -= consumed;
    }
  }
  const compOrderUnitCost = [0, 1, 2].map((p) => {
    const ref = P.subcontractQuoteRef;
    const matCost = P.materialContent[p] * spotEUR;
    const machCost = P.machTimeMin[p] / 60 * P.fgValMachineRate;
    const refMat = P.materialContent[p] * ref.spotEUR;
    const contractorFactor = ref.min[p] / (refMat + machCost);
    const premiumAdderFrac = (ref.max[p] - ref.min[p]) / refMat;
    return (matCost + machCost) * contractorFactor + d.premium[p] / 100 * premiumAdderFrac * matCost;
  });
  const subcontractOrderVal = [0, 1, 2].reduce((a, p) => a + d.subcontract[p] * compOrderUnitCost[p], 0);
  s.subcontractPipeline = [...d.subcontract];
  s.subcontractPipelineVal = [0, 1, 2].map((p) => d.subcontract[p] * compOrderUnitCost[p]);
  s.subcontractPayable = subcontractOrderVal * 0.5;
  const subcontractPaid = subcontractOrderVal * 0.5 + openingSubcontractPayable;
  if (subcontractOrderVal > 0) {
    w.push({
      severity: "info",
      title: "Subcontract order placed",
      detail: `${eur(d.subcontract.reduce((a, b) => a + b, 0))} components ordered for \u20AC${eur(subcontractOrderVal).toLocaleString()} (FX-locked): 50% paid now, 50% next quarter. Delivery next quarter as WIP \u2014 they still need assembly.`
    });
  }
  const prodDenom = [0, 1, 2].reduce((a, p) => a + productionActual[p] * stdW[p], 0);
  let cogs = 0;
  const standardUnits = [0, 0, 0];
  if (model.inventoryValuation === "manual-standard") {
    cogs = productionPool + fgPoolVal.reduce((a, b) => a + b, 0);
    for (let p = 0; p < 3; p++) {
      const standardUnit = 1.1 * (P.materialContent[p] * matUnitVal * (1 + d.premium[p] / 100 * 0.5) + wageEUR * (0.65 + P.shiftPremium[d.shift]) * 4 * P.machTimeMin[p] / 60 + wageEUR * d.assemblyTimes[p] / 60);
      standardUnits[p] = standardUnit;
      const units = fgPoolUnits[p] + productionActual[p];
      const openValue = fgPoolVal[p] - usedComponentValues[p];
      const weightedUnit = units > 0 ? (openValue + productionActual[p] * standardUnit) / units : 0;
      const closingUnits = s.productStocks.reduce((a, row) => a + row[p], 0);
      s.productFGValue[p] = closingUnits * weightedUnit;
      cogs -= s.productFGValue[p];
    }
  } else if (prodDenom > 0) {
    for (let p = 0; p < 3; p++) {
      const alloc = productionPool * (productionActual[p] * stdW[p]) / prodDenom;
      fgPoolVal[p] += alloc;
      fgPoolUnits[p] += productionActual[p];
      const soldP = sales[0][p] + sales[1][p] + sales[2][p];
      const cogsP = fgPoolUnits[p] > 0 ? fgPoolVal[p] * (soldP / fgPoolUnits[p]) : 0;
      cogs += cogsP;
      s.productFGValue[p] = fgPoolVal[p] - cogsP;
    }
  } else {
    cogs = productionPool;
    for (let p = 0; p < 3; p++) {
      const soldP = sales[0][p] + sales[1][p] + sales[2][p];
      const cogsP = fgPoolUnits[p] > 0 ? fgPoolVal[p] * (soldP / fgPoolUnits[p]) : 0;
      cogs += cogsP;
      s.productFGValue[p] = fgPoolVal[p] - cogsP;
    }
  }
  revenue += obsoleteProceeds + scrapProceeds;
  cogs += transportCost;
  cogs += obsoleteProceeds;
  s.finishedGoodsValue = s.productFGValue[0] + s.productFGValue[1] + s.productFGValue[2];
  const grossProfit = revenue - cogs;
  const operatingProfit = grossProfit - adminExpenses - depreciation;
  let loanDrawn = 0;
  if (d.termLoan > 0) {
    let req = d.termLoan * 1e3;
    if (req > s.borrowingPower) {
      w.push({
        severity: "critical",
        title: "Loan exceeds borrowing power",
        adjustment: true,
        detail: `Requested \u20AC${eur(req).toLocaleString()} but last quarter's reported borrowing power is \u20AC${eur(s.borrowingPower).toLocaleString()}. Effective draw capped at \u20AC${eur(s.borrowingPower).toLocaleString()}.`
      });
      req = s.borrowingPower;
    }
    req = Math.floor(req / 1e3) * 1e3;
    s.termLoanAmt += req;
    loanDrawn = req;
  }
  let depositChange = d.termDeposit * 1e3;
  if (depositChange < 0 && -depositChange > s.termDepositAmt) {
    w.push({
      severity: "warn",
      title: "Deposit withdrawal capped",
      adjustment: true,
      detail: `Only \u20AC${eur(s.termDepositAmt).toLocaleString()} on deposit. Withdrawal cut to that.`
    });
    depositChange = -s.termDepositAmt;
  }
  s.termDepositAmt += depositChange;
  const interestReceived = s.termDepositAmt * (econ.baseRate / 100) / 4;
  const interestPaidLoan = s.termLoanAmt * (P.termLoanRate / 100) / 4;
  const receivablesEnd = (sales[0][0] * d.prices[0][0] + sales[0][1] * d.prices[0][1] + sales[0][2] * d.prices[0][2]) * (P.creditDays[0] / 90) + (sales[1][0] * d.prices[1][0] + sales[1][1] * d.prices[1][1] + sales[1][2] * d.prices[1][2]) * (P.creditDays[1] / 90);
  const collected = marketRevenue - receivablesEnd + s.receivables;
  s.receivables = receivablesEnd;
  const futuresOrderedVal = d.matM3 * 1e3 * (P.matPrice3mUSD / 1e3) * econ.exchangeRate + d.matM6 * 1e3 * (P.matPrice6mUSD / 1e3) * econ.exchangeRate;
  const materialPurchasesVal = spotVal + emergencyVal + futuresOrderedVal + premiumAdder;
  const deferredNow = advTotal + guaranteeCost + webDevCost + maintenanceCost + warehousing + infoCost + transportCost;
  const payablesEnd = deferredNow + materialPurchasesVal * 0.5 + s.subcontractPayable;
  const productionCashCosts = machinistWages + assemblyWages + runningCosts + supervision + prodOverheads + planning + inspection;
  const paidSuppliersAdmin = adminExpenses + transportCost - deferredNow + (openingPayables - openingSubcontractPayable);
  const paidMaterials = materialPurchasesVal * 0.5;
  const paidNow = paidSuppliersAdmin + productionCashCosts + paidMaterials + subcontractPaid;
  s.payables = payablesEnd;
  let dividendPaid = 0;
  const sharesCount = s.shareCapital;
  const maxDividend = Math.max(0, openingRetained);
  const wantDividend = d.dividend / 100 * (sharesCount / 1);
  if (wantDividend > 0 && maxDividend <= 0) {
    w.push({
      severity: "critical",
      title: "Dividend blocked",
      adjustment: true,
      detail: `Opening retained earnings are \u20AC${eur(openingRetained).toLocaleString()} \u2014 no dividend is legally payable until reserves are positive at the START of the quarter. Forced to 0.`
    });
  } else if (wantDividend > maxDividend) {
    dividendPaid = Math.floor(maxDividend / sharesCount * 100) / 100 * sharesCount;
    w.push({
      severity: "warn",
      title: "Dividend capped",
      adjustment: true,
      detail: `Requested dividend exceeds opening retained earnings; cut to \u20AC${eur(maxDividend).toLocaleString()}.`
    });
  } else dividendPaid = wantDividend;
  const creditWorthiness = Math.max(0, s.borrowingPower + openingCash - openingOverdraft + s.termDepositAmt - depositChange);
  let machinesCost = d.machinesBuy * P.machineCost;
  let extCost = d.factoryExt * P.buildingCostPerSqm;
  if (machinesCost + extCost > creditWorthiness) {
    const affordable = Math.max(0, creditWorthiness);
    if (machinesCost > affordable) {
      machinesCost = Math.floor(affordable / P.machineCost) * P.machineCost;
      w.push({ severity: "critical", title: "Machine order refused", adjustment: true, detail: "Credit-worthiness insufficient \u2014 the supplier would cut or refuse your machine order (starred decision)." });
    }
    if (machinesCost + extCost > affordable) {
      extCost = Math.max(0, affordable - machinesCost);
      w.push({ severity: "critical", title: "Factory extension refused", adjustment: true, detail: "Credit-worthiness insufficient \u2014 the contractor would shrink or refuse the extension." });
    }
  }
  if (d.factoryExt * P.buildingCostPerSqm > 0 && d.factoryExt > s.landUnused) w.push({ severity: "critical", title: "Not enough land", adjustment: true, detail: `Only ${s.landUnused} m\xB2 of unused land \u2014 extension would be capped.` });
  extCost = Math.floor(Math.min(extCost / P.buildingCostPerSqm, s.landUnused)) * P.buildingCostPerSqm;
  s.capitalWip += machinesCost + extCost;
  if (qOfYear === 1) {
    s.shareCapYearStart = s.shareCapital;
    s.sharesIssuedThisYear = 0;
    s.sharesRepurchasedThisYear = 0;
  }
  let repurchaseCharge = 0;
  let shareCash = 0;
  let effSharesK = 0;
  if (d.shares !== 0) {
    const annualCap = s.shareCapYearStart * 0.1;
    const roomIssue = Math.max(0, annualCap - s.sharesIssuedThisYear);
    const roomRepurchase = Math.max(0, annualCap - s.sharesRepurchasedThisYear);
    const reqEur = d.shares * 1e3;
    const effEur = reqEur > 0 ? Math.min(reqEur, roomIssue) : Math.max(reqEur, -roomRepurchase);
    if (effEur !== reqEur) w.push({
      severity: "warn",
      title: "Share change capped",
      adjustment: true,
      detail: `Annual limit is \xB110% of the \u20AC${eur(s.shareCapYearStart).toLocaleString()} capital at the start of the year (\u20AC${eur(annualCap).toLocaleString()}); already used \u20AC${eur(reqEur > 0 ? s.sharesIssuedThisYear : s.sharesRepurchasedThisYear).toLocaleString()}. Effective trade: \u20AC${eur(effEur).toLocaleString()} nominal.`
    });
    if (effEur !== 0) {
      if (s.sharePrice < 1) w.push({ severity: "critical", title: "Share dealing blocked", adjustment: true, detail: "Share price below par (\u20AC1) \u2014 no issue or repurchase allowed." });
      else {
        shareCash = effEur * s.sharePrice;
        effSharesK = effEur / 1e3;
        const premiumChange = effEur * (s.sharePrice - 1);
        if (premiumChange < 0) {
          repurchaseCharge = Math.max(0, -premiumChange - s.sharePremium);
          s.sharePremium = Math.max(0, s.sharePremium + premiumChange);
          s.retainedEarnings -= repurchaseCharge;
        } else s.sharePremium += premiumChange;
        if (effEur > 0) {
          s.cumIssues += shareCash;
          s.sharesIssuedThisYear += effEur;
        } else {
          s.cumRepurchases += -shareCash;
          s.sharesRepurchasedThisYear += -effEur;
        }
        s.shareCapital += effEur;
      }
    }
  }
  const machinesBought = eur(machinesCost / P.machineCost);
  s.machinesPipeline = machinesBought;
  s.factoryExtPipeline = eur(extCost / P.buildingCostPerSqm);
  s.landUnused = Math.max(0, s.landUnused - s.factoryExtPipeline);
  s.workersPipeline = Math.max(0, d.hire);
  s.traineesPipeline = Math.max(0, d.train);
  if (d.hire < 0) s.assemblyWorkers = Math.max(0, s.assemblyWorkers + d.hire);
  s.matPipeline3 += d.matM3;
  s.matPipeline3Val += d.matM3 * 1e3 * (P.matPrice3mUSD / 1e3) * econ.exchangeRate;
  s.matPipeline6 += d.matM6;
  s.matPipeline6Val += d.matM6 * 1e3 * (P.matPrice6mUSD / 1e3) * econ.exchangeRate;
  if (model.inventoryValuation === "manual-standard") {
    s.matPipeline3Val = s.matPipeline3 * 1e3 * matUnitVal;
    s.matPipeline6Val = s.matPipeline6 * 1e3 * matUnitVal;
  }
  s.agentsPipeline = Math.max(0, d.agentsEU.want - s.agentsEU);
  if (d.agentsEU.want < s.agentsEU) s.agentsEU = d.agentsEU.want;
  s.distNafta = Math.max(0, d.distNafta.want);
  s.portsPipeline = d.ports;
  const taxPaid = qOfYear === 2 ? s.taxDue : 0;
  if (taxPaid > 0) {
    w.push({
      severity: "info",
      title: "Tax settled",
      detail: `Paid \u20AC${eur(taxPaid).toLocaleString()} of tax assessed at last Q4.`
    });
    s.taxDue = 0;
  }
  let cash = openingCash + collected + interestReceived + shareCash + loanDrawn + machineSaleProceeds + obsoleteProceeds + scrapProceeds - paidNow - dividendPaid - machinesCost - extCost - taxPaid - interestPaidLoan - depositChange;
  let overdraftEnd = openingOverdraft;
  if (cash >= 0 && overdraftEnd > 0) {
    const repay = Math.min(cash, overdraftEnd);
    overdraftEnd -= repay;
    cash -= repay;
  }
  if (cash < 0) {
    overdraftEnd += -cash;
    cash = 0;
  }
  const overdraftLimit = s.overdraftLimit;
  let overdraftInterest = 0;
  let unauthorised = false;
  if (overdraftEnd > 0) {
    unauthorised = overdraftEnd > overdraftLimit;
    const rate = (econ.baseRate / 100 + (unauthorised ? P.unauthorisedSpread : P.overdraftSpread)) / 4;
    overdraftInterest = overdraftEnd * rate;
    overdraftEnd += overdraftInterest;
    w.push({
      severity: unauthorised ? "critical" : "warn",
      title: unauthorised ? "UNAUTHORISED overdraft" : "Overdraft used",
      detail: `Overdraft \u20AC${eur(overdraftEnd).toLocaleString()} vs limit \u20AC${eur(overdraftLimit).toLocaleString()}. ${unauthorised ? "Punitive interest (base+10%) on the WHOLE overdraft." : "Within authorised limit (base+4%)."}`
    });
  }
  s.cash = cash;
  s.overdraft = overdraftEnd;
  const interestPaidTotal = interestPaidLoan + overdraftInterest;
  const netInterest = interestReceived - interestPaidTotal;
  const pbt = operatingProfit + netInterest;
  s.taxableCarryforward += pbt;
  let tax = 0;
  if (qOfYear === 4) {
    if (s.taxableCarryforward > 0) {
      tax = s.taxableCarryforward * P.taxRate;
      s.taxDue += tax;
      s.taxableCarryforward = 0;
      w.push({
        severity: "info",
        title: "Annual tax assessed",
        detail: `25% on accumulated taxable profit \u2014 \u20AC${eur(tax).toLocaleString()} payable in next year's Q2.`
      });
    }
  }
  const netProfit = pbt - tax;
  s.retainedEarnings += netProfit - dividendPaid;
  s.cumDividends += dividendPaid;
  const equity = s.shareCapital + s.sharePremium + s.retainedEarnings;
  const navPerShare = equity / (s.shareCapital / 1);
  const annROE = equity > 0 ? netProfit / equity * 4 : -0.5;
  const divYield = s.cumDividends > 0 ? dividendPaid / Math.max(1, s.sharePrice * sharesCount) : 0;
  const liquidityPenalty = unauthorised ? 0.15 : overdraftEnd > 0 ? 0.05 : 0;
  const sentiment = clamp(1 + 0.9 * annROE + model.dividendSentimentWeight * divYield - liquidityPenalty + (netProfit > 0 ? 0.02 : -0.06), 0.5, 2.2);
  s.sharePrice = clamp(navPerShare * sentiment, 0.01, 50);
  const marketValue = s.sharePrice * (s.shareCapital / 1);
  const investmentPerformance = marketValue + s.cumDividends + s.cumRepurchases - s.cumIssues;
  const wipValueEnd = s.componentWipValue[0] + s.componentWipValue[1] + s.componentWipValue[2];
  const overdraftLimitNext = Math.max(
    0,
    0.5 * (5e4 + s.buildingValue + s.finishedGoodsValue + s.materialsValue + wipValueEnd + s.matPipeline3Val + s.matPipeline6Val + s.subcontractPipelineVal.reduce((a, b) => a + b, 0)) + 0.9 * s.receivables - s.taxDue - s.payables
  );
  s.overdraftLimit = overdraftLimitNext;
  s.borrowingPower = Math.max(0, 0.5 * (s.sharePrice * s.shareCapital) - s.termLoanAmt - overdraftLimitNext);
  const assemblyHoursWorked = mid.assemblyTiers.basic + mid.assemblyTiers.saturday + mid.assemblyTiers.sunday;
  const carbonTonnes = (s.factoryArea * 9.5 + mid.physicalMachineHours * 2.82 + assemblyHoursWorked * 0.47) / 1e3;
  if (s.mgmtBudgetEffective < 50) w.push({
    severity: "warn",
    title: "Management budget thin",
    detail: "Low management budget degrades quality across the whole company and raises incident risk."
  });
  const adminBreakdown = [
    { label: "Advertising", value: advTotal },
    { label: "Agents & distributors", value: agentsCost },
    { label: "Internet service provider", value: ispCost },
    { label: "Sales office", value: salesOffice },
    { label: "Guarantee servicing", value: guaranteeCost },
    { label: "Product development (R&D)", value: rdTotal },
    { label: "Website development", value: webDevCost },
    { label: "Personnel department", value: personnelCost },
    { label: "Machine maintenance", value: maintenanceCost },
    { label: "Purchasing & warehousing", value: P.purchasingAdmin + warehousing },
    { label: "Business intelligence", value: infoCost },
    { label: "Credit control", value: creditControl },
    { label: "Insurance premiums", value: insurancePremium },
    { label: "Management salaries", value: mgmtCost },
    { label: "Factory rates & fixed", value: factoryFixed },
    { label: "Decommissioning", value: decommissionCost }
  ].map((x) => ({ label: x.label, value: eur(x.value) }));
  const details = {
    inventoryEvidence: { method: model.inventoryValuation, standardUnit: standardUnits, productValues: [...s.productFGValue], materialsOnOrderValue: eur(s.matPipeline3Val + s.matPipeline6Val) },
    productionCosts: {
      machinists: s.machinists,
      recruited: recruitedMachinists,
      dismissed: dismissedMachinists,
      physicalMachineHours: mid.physicalMachineHours,
      machinistHoursPerPerson: hoursPerMachinist,
      machinistWages: eur(machinistWages),
      assemblyTimeWages: eur(assemblyTimeWages),
      parityPayment: eur(parityPayment),
      assemblyWages: eur(assemblyWages),
      runningCosts: eur(runningCosts),
      inspection: eur(inspection),
      transport: eur(transportCost)
    },
    income: {
      revenue: eur(revenue),
      cogs: eur(cogs),
      grossProfit: eur(grossProfit),
      adminExpenses: eur(adminExpenses),
      depreciation: eur(depreciation),
      operatingProfit: eur(operatingProfit),
      interestReceived: eur(interestReceived),
      interestPaid: eur(interestPaidTotal),
      pbt: eur(pbt),
      taxAssessed: eur(tax),
      netProfit: eur(netProfit)
    },
    adminBreakdown,
    cashFlow: {
      openingCash: eur(openingCash - openingOverdraft),
      collected: eur(collected),
      interestReceived: eur(interestReceived),
      loanDrawn: eur(loanDrawn),
      shareCash: eur(shareCash),
      obsoleteProceeds: eur(obsoleteProceeds),
      scrapProceeds: eur(scrapProceeds),
      assetProceeds: eur(machineSaleProceeds),
      paidSuppliersAdmin: eur(paidSuppliersAdmin),
      paidProduction: eur(productionCashCosts),
      paidMaterials: eur(paidMaterials),
      subcontractPaid: eur(subcontractPaid),
      dividendPaid: eur(dividendPaid),
      capex: eur(machinesCost + extCost),
      taxPaid: eur(taxPaid),
      interestPaid: eur(interestPaidTotal),
      depositChange: eur(depositChange),
      closingCash: eur(s.cash),
      overdraftEnd: eur(s.overdraft)
    },
    workingCapital: {
      receivablesOpen: eur(openingReceivables),
      receivablesEnd: eur(s.receivables),
      payablesOpen: eur(openingPayables),
      payablesEnd: eur(s.payables),
      closingInvValue: eur(s.finishedGoodsValue),
      materialsStock: eur(s.materialsStock)
    },
    retained: {
      opening: eur(openingRetained),
      netProfit: eur(netProfit),
      dividendPaid: eur(dividendPaid),
      repurchaseCharge: eur(repurchaseCharge),
      closing: eur(s.retainedEarnings)
    },
    balance: {
      fixedAssets: eur(5e4 + s.buildingValue + s.machineValue),
      capitalWip: eur(s.capitalWip),
      inventories: eur(s.finishedGoodsValue),
      materialsValue: eur(s.materialsValue),
      wipComponents: eur(wipValueEnd),
      materialsOnOrder: eur(s.matPipeline3Val + s.matPipeline6Val + s.subcontractPipelineVal[0] + s.subcontractPipelineVal[1] + s.subcontractPipelineVal[2]),
      receivables: eur(s.receivables),
      cash: eur(s.cash),
      deposit: eur(s.termDepositAmt),
      payables: eur(s.payables),
      taxDue: eur(s.taxDue),
      overdraft: eur(s.overdraft),
      termLoan: eur(s.termLoanAmt),
      shareCapital: eur(s.shareCapital),
      sharePremium: eur(s.sharePremium),
      retainedEarnings: eur(s.retainedEarnings)
    }
  };
  const effectiveDecisions = {
    ...d,
    mgmtBudget: d.mgmtBudget,
    // portal instruction announces the reduction; expense is shown separately
    dividend: dividendPaid > 0 ? Math.round(dividendPaid / sharesCount * 1e4) / 100 : 0,
    shares: effSharesK,
    termLoan: eur(loanDrawn / 1e3),
    termDeposit: eur(depositChange / 1e3),
    machinesBuy: machinesBought,
    factoryExt: s.factoryExtPipeline
  };
  const report = {
    quarterLabel: s.quarterLabel,
    orders: mid.orders,
    sales,
    backlogEnd: mid.backlogEnd,
    lostInternetDemand: mid.lostInternetDemand,
    productionPlanned: mid.productionPlanned,
    productionActual,
    productionScaled: mid.productionScaled,
    rejects,
    grossStarts: mid.grossStarts,
    rejectRate: mid.rejectRate,
    assemblyWorkersOpen: mid.assemblyWorkersOpen,
    obsoleteUnits: mid.obsoleteUnits,
    obsoleteByProduct: mid.obsoleteByProduct,
    obsoleteProceeds: eur(obsoleteProceeds),
    machHoursNeeded: mid.machHoursNeeded,
    machHoursAvail: mid.machHoursAvail,
    assemblyHoursNeeded: mid.assemblyHoursNeeded,
    assemblyHoursAvail: mid.assemblyHoursAvail,
    assemblyTiers: mid.assemblyTiers,
    mgmtBudgetEffective: s.mgmtBudgetEffective,
    materialsNeeded: mid.materialsNeeded,
    materialsShortfall: eur(materialsShortfall),
    componentWipEnd: [...s.componentWipUnits],
    spaceNeeded: eur(spaceNeeded),
    spaceAvail: eur(spaceAvail),
    revenue: eur(revenue),
    cogs: eur(cogs),
    grossProfit: eur(grossProfit),
    adminExpenses: eur(adminExpenses),
    operatingProfit: eur(operatingProfit),
    netInterest: eur(netInterest),
    pbt: eur(pbt),
    tax: eur(tax),
    netProfit: eur(netProfit),
    cashEnd: eur(s.cash),
    overdraftEnd: eur(s.overdraft),
    overdraftLimit: eur(overdraftLimit),
    unauthorised,
    dividendPaid: eur(dividendPaid),
    sharePrice: s.sharePrice,
    marketValue: eur(marketValue),
    investmentPerformance: eur(investmentPerformance),
    ipBreakdown: {
      navPerShare: Math.round(navPerShare * 1e4) / 1e4,
      sentiment: Math.round(sentiment * 1e3) / 1e3,
      marketValue: eur(marketValue),
      cumDividends: eur(s.cumDividends),
      cumRepurchases: eur(s.cumRepurchases),
      cumIssues: eur(s.cumIssues)
    },
    stars: [...s.stars],
    webStars: mid.webStars,
    failedVisitsPct: mid.failedVisitsPct,
    carbonTonnes: Math.round(carbonTonnes * 10) / 10,
    warnings: w,
    effectiveDecisions,
    details
  };
  return { state: s, report };
}

// src/engine/simulate.ts
var M = 3;
var PR = 3;
var clamp2 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var clone3 = (m) => [[...m[0]], [...m[1]], [...m[2]]];
var eur2 = (n) => Math.round(n);
function portCapacity(ports) {
  const pts = P.portCapacity;
  if (ports <= pts[0][0]) return Math.max(0, ports / pts[0][0]) * pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (ports <= pts[i][0]) {
      const [x02, y02] = pts[i - 1];
      const [x12, y12] = pts[i];
      return y02 + (y12 - y02) * (ports - x02) / (x12 - x02);
    }
  }
  const [x0, y0] = pts[pts.length - 2];
  const [x1, y1] = pts[pts.length - 1];
  return y1 + (y1 - y0) * (ports - x1) / (x1 - x0);
}
function sanitizeDecisions(dIn, priorWage) {
  const warnings = [];
  if (!validDecisions(dIn)) throw new Error("Decisions require all 75 finite, correctly shaped fields.");
  const d = structuredClone(dIn);
  if (d.wage < P.minWageCents || d.wage < priorWage) {
    const floor = Math.max(P.minWageCents, priorWage);
    warnings.push({
      severity: "critical",
      title: "Wage cut not permitted",
      adjustment: true,
      detail: `Assembly wages cannot be cut below last quarter's effective rate (and never below \u20AC9.00/hr). Forced from ${d.wage} to ${floor} cents.`
    });
    d.wage = floor;
  }
  if (d.shift < 1 || d.shift > 3) {
    warnings.push({
      severity: "critical",
      title: "Invalid shift level",
      adjustment: true,
      detail: `Shift must be 1, 2 or 3. Forced from ${d.shift} into range.`
    });
    d.shift = clamp2(Math.round(d.shift), 1, 3);
  }
  if (d.train < 0 || d.train > 9) {
    warnings.push({
      severity: "warn",
      title: "Training quota adjusted",
      adjustment: true,
      detail: `Workers to train must be 0\u20139 per quarter. Forced from ${d.train} into range.`
    });
    d.train = clamp2(Math.round(d.train), 0, 9);
  }
  if (d.trainingDays < 0 || d.trainingDays > 90) {
    warnings.push({
      severity: "warn",
      title: "Consultant days adjusted",
      adjustment: true,
      detail: `Staff training consultant days must be 0\u201390. Forced from ${d.trainingDays} into range.`
    });
    d.trainingDays = clamp2(Math.round(d.trainingDays), 0, 90);
  }
  if (d.termLoan < 0) {
    warnings.push({
      severity: "warn",
      title: "Loan repayment not via this field",
      adjustment: true,
      detail: "The decision sheet only accepts new borrowing (0 or more). Negative entry forced to 0."
    });
    d.termLoan = 0;
  }
  for (const f of DECISION_FIELDS) {
    if (f.boolean) continue;
    const requested = fieldValue(d, f.path);
    const effective = clamp2(Math.round(requested), f.min, f.max);
    if (requested !== effective) {
      setField(d, f.path, effective);
      warnings.push({
        severity: "critical",
        title: "Official input limit",
        adjustment: true,
        detail: `${f.label}: requested ${requested}; effective ${effective} (integer range ${f.min}\u2013${f.max}).`
      });
    }
  }
  return { d, warnings };
}
function simulateQuarter(prev, dIn, econ, model = resolveModel()) {
  const sv = sanitizeDecisions(dIn, prev.priorWage);
  const w = [...sv.warnings];
  const d = sv.d;
  const s = {
    ...prev,
    productStocks: clone3(prev.productStocks),
    backlog: clone3(prev.backlog),
    corpImage: [...prev.corpImage],
    stars: [...prev.stars],
    rdProgress: [...prev.rdProgress],
    subcontractPipeline: [...prev.subcontractPipeline],
    subcontractPipelineVal: [...prev.subcontractPipelineVal],
    componentWipUnits: [...prev.componentWipUnits],
    componentWipValue: [...prev.componentWipValue],
    improvementsAvailable: [...prev.improvementsAvailable],
    productFGValue: [...prev.productFGValue]
  };
  s.mgmtBudgetEffective = prev.mgmtBudgetPending != null ? prev.mgmtBudgetPending : prev.mgmtBudgetEffective;
  s.mgmtBudgetPending = null;
  if (d.mgmtBudget < s.mgmtBudgetEffective) {
    const noticeFloor = Math.ceil(s.mgmtBudgetEffective * 0.9);
    s.mgmtBudgetPending = Math.max(d.mgmtBudget, noticeFloor);
    w.push({
      severity: "warn",
      title: "Management budget cut deferred",
      adjustment: true,
      detail: `Reductions need one quarter's notice and are capped at 10% per quarter. This quarter stays at \u20AC${s.mgmtBudgetEffective}k; \u20AC${s.mgmtBudgetPending}k takes effect next quarter.`
    });
  } else if (d.mgmtBudget > s.mgmtBudgetEffective) {
    s.mgmtBudgetEffective = d.mgmtBudget;
  }
  s.machineValue += s.machinesPipeline * P.machineCost;
  s.buildingValue += s.factoryExtPipeline * P.buildingCostPerSqm;
  s.capitalWip = Math.max(0, s.capitalWip - s.machinesPipeline * P.machineCost - s.factoryExtPipeline * P.buildingCostPerSqm);
  s.machines += s.machinesPipeline;
  s.machinesPipeline = 0;
  s.assemblyWorkers += s.workersPipeline + s.traineesPipeline;
  s.workersPipeline = 0;
  s.traineesPipeline = 0;
  s.factoryArea += s.factoryExtPipeline;
  s.factoryExtPipeline = 0;
  s.agentsEU += s.agentsPipeline;
  s.agentsPipeline = 0;
  const wasInternetOpen = s.ports > 0;
  if (s.portsPipeline !== null) s.ports = s.portsPipeline;
  s.portsPipeline = null;
  s.distNet = s.ports > 0 ? 1 : 0;
  const internetChange = wasInternetOpen === s.ports > 0 ? "none" : s.ports > 0 ? "open" : "close";
  if (d.hire < -s.assemblyWorkers) {
    w.push({ severity: "critical", title: "Dismissal capped", adjustment: true, detail: `Only ${s.assemblyWorkers} assembly workers are available; dismissal reduced to that number.` });
    d.hire = -s.assemblyWorkers;
  }
  for (let m = 0; m < 3; m++) if ([s.agentsEU, s.distNafta, s.distNet][m] === 0) {
    for (let p = 0; p < 3; p++) if (d.deliveries[m][p] > 0) {
      w.push({ severity: "critical", title: "No active sales channel", adjustment: true, detail: `Market ${["EU", "NAFTA", "NET"][m]} P${p + 1}: delivery forced to zero because no agent/distributor is active.` });
      d.deliveries[m][p] = 0;
    }
  }
  const subcontractArriving = [...s.subcontractPipeline];
  const subcontractArrivingVal = [...s.subcontractPipelineVal];
  s.subcontractPipeline = [0, 0, 0];
  s.subcontractPipelineVal = [0, 0, 0];
  const subcontractTotal = subcontractArriving.reduce((a, b) => a + b, 0);
  if (subcontractTotal > 0) {
    for (let p = 0; p < PR; p++) {
      s.componentWipUnits[p] += subcontractArriving[p];
      s.componentWipValue[p] += subcontractArrivingVal[p];
    }
    w.push({
      severity: "info",
      title: "Subcontracted components arrived",
      detail: `${eur2(subcontractTotal)} machined components delivered into work-in-progress (\u20AC${eur2(subcontractArrivingVal.reduce((a, b) => a + b, 0)).toLocaleString()} at order-locked cost). They still need assembly labour this quarter; anything unused stays in WIP for later.`
    });
  }
  const orderCredit = Math.max(0, s.borrowingPower + s.cash - s.overdraft + s.termDepositAmt);
  let acceptedBuy = Math.min(d.machinesBuy, Math.floor(orderCredit / P.machineCost));
  let acceptedExt = Math.min(d.factoryExt, s.landUnused, Math.floor(Math.max(0, orderCredit - acceptedBuy * P.machineCost) / P.buildingCostPerSqm));
  const futureWorkers = s.assemblyWorkers + Math.min(0, d.hire);
  const soldMachines = Math.min(d.machinesSell, s.machines);
  const buySpace = Math.max(0, Math.floor(((s.factoryArea + acceptedExt) * P.factoryUseMax - futureWorkers * P.sqmPerWorker) / P.sqmPerMachine) - (s.machines - soldMachines));
  acceptedBuy = Math.min(acceptedBuy, buySpace);
  acceptedExt = Math.min(d.factoryExt, s.landUnused, Math.floor(Math.max(0, orderCredit - acceptedBuy * P.machineCost) / P.buildingCostPerSqm));
  for (const [key, value] of [["machinesBuy", acceptedBuy], ["factoryExt", acceptedExt]]) if (d[key] !== value) {
    w.push({ severity: "critical", title: "Capital order capped", adjustment: true, detail: `${key}: requested ${d[key]}, accepted ${value}; limited by opening credit, land or factory floor space.` });
    d[key] = value;
  }
  const futureMachines = s.machines - soldMachines + d.machinesBuy;
  let hiringRoom = Math.max(0, Math.floor(((s.factoryArea + d.factoryExt) * P.factoryUseMax - futureMachines * P.sqmPerMachine) / P.sqmPerWorker) - futureWorkers);
  if (d.hire > hiringRoom) {
    w.push({ severity: "critical", title: "Recruitment limited by factory space", adjustment: true, detail: `Requested ${d.hire} new assembly workers; room for ${hiringRoom}. Effective hiring reduced before fees and next-quarter arrival.` });
    d.hire = hiringRoom;
  }
  hiringRoom -= Math.max(0, d.hire);
  if (d.train > hiringRoom) {
    w.push({ severity: "critical", title: "Training limited by factory space", adjustment: true, detail: `Requested ${d.train} trainees; room for ${hiringRoom}. Effective training reduced before fees and arrival.` });
    d.train = hiringRoom;
  }
  s.priorWage = d.wage;
  const fxFactor = Math.pow(econ.exchangeRate / P.fxRef, 1);
  const orders = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let m = 0; m < M; m++) {
    const refCorp = P.refAdvCorp[m];
    const spendRatio = refCorp > 0 ? d.advCorp[m] / refCorp : 1;
    s.corpImage[m] = 0.7 * s.corpImage[m] + 0.3 * refCorp * spendRatio;
  }
  for (let p = 0; p < PR; p++) {
    const timeRatio = d.assemblyTimes[p] / P.minAssemblyMin[p];
    const premBoost = d.premium[p] / 100;
    const target = clamp2(1.2 + 2.2 * clamp2(timeRatio - 1, 0, 0.35) / 0.35 + 1.4 * premBoost + (s.rdProgress[p] > 60 ? 0.4 : s.rdProgress[p] > 30 ? 0.2 : 0), 1, 5);
    s.stars[p] = clamp2(0.75 * s.stars[p] + 0.25 * target, 1, 5);
    s.rdProgress[p] += d.rd[p];
  }
  s.webImage = 0.7 * s.webImage + 0.3 * d.webDev;
  const webStars = clamp2(1 + s.webImage / 15, 1, 5);
  for (let m = 0; m < M; m++) {
    for (let p = 0; p < PR; p++) {
      if (d.prices[m][p] <= 0 || [s.agentsEU, s.distNafta, s.distNet][m] === 0) {
        orders[m][p] = 0;
        continue;
      }
      const compP = econ.compPrices[m][p] > 0 ? econ.compPrices[m][p] : d.prices[m][p];
      const relPrice = d.prices[m][p] / compP;
      let fPrice = Math.pow(relPrice, P.priceElasticity[p] * model.demandElasticityScale);
      if (relPrice < 0.72) fPrice *= 0.75;
      const fAdv = 1 + 0.35 * (Math.sqrt(Math.max(0, d.advProd[m][p]) / Math.max(1, P.refAdvProd[m][p])) - 1);
      const fCorp = 1 + 0.22 * (s.corpImage[m] / P.refAdvCorp[m] - 1);
      const fQual = 1 + 0.1 * (s.stars[p] - P.refStars[p]);
      let fChan = 1;
      if (m === 0) {
        fChan = clamp2(Math.sqrt(Math.max(0.2, s.agentsEU) / P.refAgents.n) * Math.sqrt(Math.max(1, d.agentsEU.support) / P.refAgents.support) * Math.pow(Math.max(1, d.agentsEU.commission) / P.refAgents.comm, 0.5), 0.25, 1.35);
      } else if (m === 1) {
        fChan = clamp2(Math.sqrt(Math.max(0.2, s.distNafta) / P.refDist.n) * Math.sqrt(Math.max(1, d.distNafta.support) / P.refDist.support) * Math.pow(Math.max(1, d.distNafta.commission) / P.refDist.comm, 0.5), 0.25, 1.3) * fxFactor;
      } else {
        const fWeb = 1 + 0.12 * (webStars - 2);
        fChan = clamp2(Math.sqrt(Math.max(1, d.distNet.support) / P.refNetDist.support) * Math.pow(Math.max(1, d.distNet.commission) / P.refNetDist.comm, 0.5), 0.3, 1.25) * fWeb * fxFactor;
      }
      orders[m][p] = eur2(P.baseDemand[m][p] * econ.seasonality * econ.growth * fPrice * fAdv * fCorp * fQual * fChan);
    }
  }
  const netVisits = (orders[2][0] + orders[2][1] + orders[2][2]) * 9;
  const capVisitsHr = portCapacity(s.ports);
  const capacityVisits = capVisitsHr * 24 * 90;
  const failedVisitsPct = clamp2((netVisits - capacityVisits) / Math.max(1, netVisits) * 100 * 4, 0, 40);
  if (failedVisitsPct > 0) {
    for (let p = 0; p < PR; p++) orders[2][p] = eur2(orders[2][p] * (1 - failedVisitsPct / 100));
  }
  if (failedVisitsPct > 5) w.push({
    severity: "warn",
    title: "Website congested",
    detail: `~${failedVisitsPct.toFixed(0)}% of website visits fail with ${s.ports} ports. Add ports or expect lost internet orders and image damage.`
  });
  const recalled = [0, 0, 0];
  for (let p = 0; p < 3; p++) {
    let room = [0, 1, 2].reduce((a, m) => a + Math.max(0, d.deliveries[m][p]), 0);
    for (const m of [0, 2]) if (d.deliveries[m][p] < 0) {
      const requested = -d.deliveries[m][p];
      const actual = d.takeImprovement[p] ? 0 : Math.min(requested, s.productStocks[m][p], room);
      s.productStocks[m][p] -= actual;
      recalled[p] += actual;
      room -= actual;
      d.deliveries[m][p] = -actual;
      w.push({
        severity: actual < requested ? "warn" : "info",
        title: "Stock redistribution",
        adjustment: actual < requested,
        detail: `${m === 0 ? "EU" : "NET"} P${p + 1}: ${actual} units returned and redistributed to positive delivery destinations. Limited by opening stock and requested destinations; launching a new model prevents old-stock redistribution. Return-leg freight is approximated by the outbound route model.`
      });
    }
  }
  const planTotal = [0, 1, 2].map((p) => [0, 1, 2].reduce((a, m) => a + Math.max(0, d.deliveries[m][p]), 0) - recalled[p]);
  const rejectRate = [0, 0, 0];
  for (let p = 0; p < PR; p++) {
    const qualityFactor = clamp2(1.35 - 0.5 * (d.assemblyTimes[p] / P.minAssemblyMin[p] - 1) - 0.5 * d.premium[p] / 100 - 2e-3 * d.trainingDays, 0.4, 1.5);
    rejectRate[p] = P.rejectBaseRate * qualityFactor;
  }
  const grossStarts = [0, 1, 2].map((p) => Math.ceil(planTotal[p] / Math.max(0.5, 1 - rejectRate[p])));
  const machHoursAvail = s.machines * P.shiftMachHours[d.shift] * (s.machineEfficiency / 100);
  const att = P.assemblyAttendance;
  const asmBasicAvail = s.assemblyWorkers * P.assemblyBasicHours * att;
  const asmSatAvail = s.assemblyWorkers * P.assemblySaturdayHours * att;
  const asmSunAvail = s.assemblyWorkers * P.assemblySundayHours * att;
  const assemblyHoursAvail = asmBasicAvail + asmSatAvail + asmSunAvail;
  const compPlan = [0, 1, 2].map((p) => Math.min(s.componentWipUnits[p], grossStarts[p]));
  const machinedPlan = [0, 1, 2].map((p) => grossStarts[p] - compPlan[p]);
  const machHoursNeeded = machinedPlan.reduce((a, q, p) => a + q * P.machTimeMin[p] / 60, 0);
  const assemblyHoursNeeded = grossStarts.reduce((a, q, p) => a + q * d.assemblyTimes[p] / 60, 0);
  const materialsNeeded = machinedPlan.reduce((a, q, p) => a + q * P.materialContent[p], 0);
  const capRatio = Math.min(
    machHoursNeeded > 0 ? machHoursAvail / machHoursNeeded : 1,
    assemblyHoursNeeded > 0 ? assemblyHoursAvail / assemblyHoursNeeded : 1,
    1
  );
  const productionScaled = capRatio < 0.999;
  if (productionScaled) {
    const binding = machHoursAvail / Math.max(1, machHoursNeeded) < assemblyHoursAvail / Math.max(1, assemblyHoursNeeded) ? `machine shop (${eur2(machHoursAvail)} of ${eur2(machHoursNeeded)} hrs)` : `assembly (${eur2(assemblyHoursAvail)} of ${eur2(assemblyHoursNeeded)} hrs)`;
    w.push({
      severity: "critical",
      title: "Production plan exceeds capacity",
      detail: `Plan cut ~${((1 - capRatio) * 100).toFixed(0)}% \u2014 binding constraint: ${binding}. In the real sim your delivery numbers would be starred (*).`
    });
  }
  const productionActual = [0, 0, 0];
  const rejects = [0, 0, 0];
  const compUsed = [0, 0, 0];
  const machinedActual = [0, 0, 0];
  for (let p = 0; p < PR; p++) {
    const grossMade = eur2(grossStarts[p] * capRatio);
    rejects[p] = Math.min(grossMade, eur2(grossMade * rejectRate[p]));
    productionActual[p] = Math.min(planTotal[p], grossMade - rejects[p]);
    rejects[p] = grossMade - productionActual[p];
    compUsed[p] = Math.min(s.componentWipUnits[p], grossMade);
    machinedActual[p] = grossMade - compUsed[p];
  }
  const asmHoursUsed = Math.min(assemblyHoursNeeded * capRatio, assemblyHoursAvail);
  const tierBasic = Math.min(asmHoursUsed, asmBasicAvail);
  const tierSat = Math.min(Math.max(0, asmHoursUsed - tierBasic), asmSatAvail);
  const tierSun = Math.min(Math.max(0, asmHoursUsed - tierBasic - tierSat), asmSunAvail);
  const assemblyTiers = { basic: tierBasic, saturday: tierSat, sunday: tierSun };
  const materialsConsumed = machinedActual.reduce((a, q, p) => a + q * P.materialContent[p], 0);
  const effBefore = s.machineEfficiency;
  if (d.maintenance >= 24) s.machineEfficiency = clamp2(s.machineEfficiency + 0.2, 80, 100);
  else s.machineEfficiency = clamp2(s.machineEfficiency - Math.max(0.4, 1.4 - d.maintenance * 0.06), 80, 100);
  if (d.maintenance < 15) w.push({
    severity: "warn",
    title: "Maintenance too low",
    detail: `${d.maintenance} hrs/machine is below the safe zone. Efficiency fell ${(effBefore - s.machineEfficiency).toFixed(1)} pts and breakdown risk is rising.`
  });
  let obsoleteUnits = 0;
  const obsoleteByProduct = [0, 0, 0];
  for (let p = 0; p < PR; p++) {
    if (!d.takeImprovement[p]) continue;
    const oldUnits = s.productStocks[0][p] + s.productStocks[1][p] + s.productStocks[2][p];
    if (oldUnits > 0) {
      s.productStocks[0][p] = 0;
      s.productStocks[1][p] = 0;
      s.productStocks[2][p] = 0;
      obsoleteUnits += oldUnits;
      obsoleteByProduct[p] = oldUnits;
    }
    if (s.improvementsAvailable[p]) {
      s.improvementsAvailable[p] = false;
      s.stars[p] = clamp2(s.stars[p] + 0.6, 1, 5);
      w.push({
        severity: "info",
        title: `P${p + 1} improvement launched`,
        detail: `${eur2(oldUnits)} obsolete units liquidated at valuation outside normal markets (see cash flow). Star rating improved; the improvement is now consumed.`
      });
    } else {
      w.push({
        severity: "warn",
        title: `No P${p + 1} improvement available`,
        detail: `No completed R&D improvement to take up \u2014 ${eur2(oldUnits)} old units disposed of WITHOUT the quality benefit. The official sim would star this decision.`
      });
    }
  }
  for (let p = 0; p < PR; p++) {
    if (!s.improvementsAvailable[p] && s.rdProgress[p] > 60) {
      s.improvementsAvailable[p] = true;
      w.push({ severity: "info", title: `P${p + 1} R&D breakthrough`, detail: "Cumulative R&D has produced a new product improvement, available to take up from this quarter." });
    }
  }
  const sales = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const backlogEnd = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const lostInternetDemand = [0, 0, 0];
  const delivered = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let p = 0; p < PR; p++) {
    const total = Math.max(0, planTotal[p] + recalled[p]);
    const exact = [0, 1, 2].map((m) => total > 0 ? Math.max(0, d.deliveries[m][p]) * (productionActual[p] + recalled[p]) / total : 0);
    const alloc = exact.map(Math.floor);
    let left = productionActual[p] + recalled[p] - alloc.reduce((a, b) => a + b, 0);
    const order = [0, 1, 2].sort((a, b) => exact[b] - alloc[b] - (exact[a] - alloc[a]));
    for (const m of order) if (left-- > 0) alloc[m]++;
    for (let m = 0; m < 3; m++) delivered[m][p] = alloc[m];
  }
  for (let m = 0; m < M; m++) {
    for (let p = 0; p < PR; p++) {
      const avail = delivered[m][p] + s.productStocks[m][p];
      const demandHere = orders[m][p] + (m < 2 ? s.backlog[m][p] : 0);
      sales[m][p] = Math.min(demandHere, avail);
      const unfulfilled = demandHere - sales[m][p];
      if (m < 2) backlogEnd[m][p] = eur2(unfulfilled * 0.5);
      else lostInternetDemand[p] = unfulfilled;
      s.productStocks[m][p] = avail - sales[m][p];
    }
  }
  const totalUnfulfilled = backlogEnd[0].concat(backlogEnd[1]).reduce((a, b) => a + b, 0) + lostInternetDemand.reduce((a, b) => a + b, 0);
  if (totalUnfulfilled > 30) w.push({
    severity: "warn",
    title: "Stock-out risk",
    detail: `~${eur2(totalUnfulfilled)} units of demand unmet (backlog after cancellations + lost internet sales). Produce more or temper demand (price/ads).`
  });
  s.backlog = backlogEnd;
  return finishQuarter(s, d, econ, w, {
    orders,
    sales,
    backlogEnd,
    lostInternetDemand,
    productionPlanned: planTotal,
    productionActual,
    productionScaled,
    rejects,
    grossStarts,
    rejectRate,
    assemblyWorkersOpen: s.assemblyWorkers,
    machHoursNeeded,
    machHoursAvail,
    assemblyHoursNeeded,
    assemblyHoursAvail,
    assemblyTiers,
    capRatio,
    compUsed,
    machinedActual,
    materialsNeeded,
    materialsConsumed,
    delivered,
    internetChange,
    openingProductStocks: prev.productStocks,
    openingComponentUnits: prev.componentWipUnits,
    physicalMachineHours: machinedActual.reduce((a, n, p) => a + n * P.machTimeMin[p] / 60, 0) / Math.max(0.01, prev.machineEfficiency / 100),
    subcontractArriving,
    subcontractArrivingVal,
    webStars,
    failedVisitsPct,
    obsoleteUnits,
    obsoleteByProduct,
    openingFGUnitsByProduct: [0, 1, 2].map((p) => prev.productStocks[0][p] + prev.productStocks[1][p] + prev.productStocks[2][p]),
    openingMaterialsUnits: prev.materialsStock,
    openingMaterialsValue: prev.materialsValue,
    openingInsuredBase: 5e4 + prev.buildingValue + prev.machineValue + prev.finishedGoodsValue + prev.materialsValue + prev.componentWipValue.reduce((a, b) => a + b, 0) + prev.matPipeline3Val + prev.matPipeline6Val + prev.subcontractPipelineVal.reduce((a, b) => a + b, 0)
  }, model);
}

// src/engine/index.ts
function runSimulation(decisionsPerQuarter, econOverrides, modelOptions = {}) {
  if (decisionsPerQuarter.length !== 5 || !decisionsPerQuarter.every(validDecisions)) throw new Error("Supply five complete decision quarters.");
  if (econOverrides && (econOverrides.length > 5 || econOverrides.some((e, i) => !validEcon({ ...defaultEcon(SEASON_IDX[i]), ...e })))) throw new Error("External assumptions must be finite and positive (base rate \u2265 0).");
  const model = resolveModel(modelOptions);
  let state = baselineState();
  const reports = [];
  const states = [];
  for (let q = 0; q < 5; q++) {
    state.quarterLabel = QUARTERS[q];
    state.seasonIndex = SEASON_IDX[q];
    const econ = { ...defaultEcon(SEASON_IDX[q]), ...econOverrides?.[q] ?? {} };
    const out = simulateQuarter(state, decisionsPerQuarter[q], econ, model);
    state = out.state;
    reports.push(out.report);
    states.push(structuredClone(state));
  }
  return { reports, finalState: state, states };
}
export {
  DECISION_FIELDS,
  QUARTERS,
  baselineState,
  defaultDecisions,
  defaultEcon,
  fieldValue,
  portCapacity,
  resolveModel,
  runSimulation,
  sanitizeDecisions,
  setField,
  validDecisions,
  validEcon
};
