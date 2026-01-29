"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/actions/shop-actions";
import { useState } from "react";

export default function DeleteProductButton({ id }: { id: number }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm("Sei sicuro di voler eliminare questo drop? Questa azione non può essere annullata.")) {
            setIsDeleting(true);
            await deleteProduct(id);
        }
    };

    return (
        <button 
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
            title="Elimina Drop"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
