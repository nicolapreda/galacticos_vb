import { db } from "@/lib/db";
import { deleteUser } from "@/lib/actions";
import CreateUserForm from "./CreateUserForm";
import { revalidatePath } from "next/cache";

export default async function UsersPage() {
    // Fetch users (simple query)
    let users = [];
    try {
        users = await db.prepare('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC').all() as any;
    } catch (e) {
        console.error("Failed to fetch users:", e);
    }

    return (
        <div className="min-h-screen bg-galacticos-dark text-white p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black font-anton uppercase tracking-widest text-flyer-cyan">Gestione Utenti</h1>
                        <p className="text-gray-400 mt-2">Aggiungi o rimuovi amministratori del pannello.</p>
                    </div>
                </div>

                {/* Create New User Form */}
                <CreateUserForm />

                {/* Users List */}
                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                         <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-8 bg-white block"></span>
                            Utenti Attivi ({users.length})
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-gray-400 text-xs uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Data Creazione</th>
                                    <th className="px-6 py-4 text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white">{user.name}</td>
                                        <td className="px-6 py-4 text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Do not allow deleting 'admin' purely for safety in this demo, but logic allows it */}
                                           <DeleteUserButton id={user.id} />
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                            Nessun utente trovato.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Client component for delete button to handle pending state or confirmation if needed (simplified here)
function DeleteUserButton({ id }: { id: number }) {
    // We can use a form here for progressive enhancement
    return (
        <form 
            action={async () => {
                "use server";
                await deleteUser(id);
            }}
        >
            <button 
                className="text-red-400 hover:text-red-300 hover:underline text-sm font-bold uppercase tracking-wider"
                type="submit"
            >
                Elimina
            </button>
        </form>
    );
}
