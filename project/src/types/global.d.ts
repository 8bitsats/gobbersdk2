interface Window {
  solana?: {
    connect(): Promise<{ publicKey: { toString(): string } }>;
    disconnect(): void;
    signTransaction(transaction: any): Promise<any>;
    signAllTransactions(transactions: any[]): Promise<any[]>;
  }
}