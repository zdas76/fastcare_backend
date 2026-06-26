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