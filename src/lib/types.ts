export type CategoryInsight = {
  name: string;
  amount: number;
  count: number;
  pct: number;
};

export type CounterpartyInsight = {
  name: string;
  amount: number;
};

export type TopExpense = {
  amount: number;
  details: string;
  time: string;
  category: string;
  counterparty: string;
};

export type DailyPoint = {
  date: string;
  amount: number;
};

export type Transaction = {
  receipt: string;
  time: string;
  details: string;
  status: string;
  paid_in: number;
  withdrawn: number;
  balance: number;
  category: string;
  counterparty: string;
  direction: "in" | "out";
  amount: number;
};

export type StatementMetadata = {
  name: string;
  mobile: string;
  email: string;
  period: string;
  request_date: string;
};

export type SummaryRow = {
  type: string;
  paid_in: number;
  paid_out: number;
};

export type Analysis = {
  period: { start: string; end: string; days: number };
  totals: {
    money_in: number;
    money_out: number;
    net: number;
    consumption_spend: number;
    savings_moved: number;
    fees: number;
  };
  activity: {
    transactions: number;
    spending_transactions: number;
    avg_spend_per_txn: number;
    avg_daily_spend: number;
    largest_single_expense: {
      amount: number;
      details: string;
      time: string;
    } | null;
    highest_day: DailyPoint;
  };
  by_category: CategoryInsight[];
  by_counterparty: CounterpartyInsight[];
  top_expenses: TopExpense[];
  daily: DailyPoint[];
  transactions: Transaction[];
  statement: {
    metadata: StatementMetadata;
    summary: SummaryRow[];
    verification_code: string;
    filename: string;
    document_id: string;
    processed_at: string;
  };
};
