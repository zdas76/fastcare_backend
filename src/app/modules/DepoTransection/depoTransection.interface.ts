export type TDepoTransection = {
    providerdepoId: number;
    receiverdepoId: number;
    ledgerHeadId: number;
    date: string;
    debitAmount: number;
    narration?: string;
    depoInventories: DepoInventory[];
};

export type DepoInventory = {
    id: number;
    productId: number;
    reqQuantity: number;
    acceptedQuantity: number;
    product: Product;
};


type Product = {
    id?: number;
    name?: string;
};


export type TInventoryItemData = {
    id: number;
    productId: number;
    reqQuantity: number;
    acceptedQuantity: number;
    product: { name: string; };
};


export type TCretidItem = {
    transactionId: number;
    itemId: number;
    depoId: number;
    amount: number;
    narration: string;
    date: string;
}

export type TDebitItem = {
    transactionId: number;
    ledgerHeadId: number;
    depoId: number;
    debitAmount: number;
    narration: string;
}


export interface LedgerHead {
    id: number;
    name: string;
    [key: string]: any; // Allows for any other dynamic fields hidden inside [Object]
}

export interface DepoJournal {
    id: number;
    depoTransactionId: number;
    date: Date | string;
    ledgerHeadId: number;
    creditAmount: number;
    debitAmount: number;
    narration: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    ledgerHead: LedgerHead;
}

export interface TDepoPaymentTransaction {
    id: number;
    date: Date | string;
    providerdepoId: number;
    receiverdepoId: number;
    invoiceNo: string | null;
    voucherNo: string;
    voucherType: 'PAYMENT' | 'RECEIPT' | string; // Use union types for known statuses
    status: 'PENDING' | 'APPROVED' | string;   // Use union types for known statuses
    createdAt: Date | string;
    updatedAt: Date | string;
    depoJournals: DepoJournal[];
}