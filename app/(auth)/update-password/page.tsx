import UpdatePasswordClient from "./updatePasswordClient";
import { updatePassword } from "../actions";

export default function UpdatePassword({ params }: { params: Promise<{ code: string }> }) {
    async function handleUpdatePassword(password: string, code: string) {
        'use server'
        return await updatePassword(password, code);
    }
    return (
        <div className="px-4 max-w-lg mx-auto">
            <UpdatePasswordClient params={params} updatePassword={handleUpdatePassword} />
        </div>
    );
}