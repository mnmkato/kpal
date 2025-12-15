import UpdatePasswordClient from "./updatePasswordClient";
import { updatePassword } from "../actions";

export default function UpdatePassword() {
    async function handleUpdatePassword(password: string) {
        'use server'
        return await updatePassword(password);
    }
    return (
        <div className="px-4 max-w-lg mx-auto">
            <UpdatePasswordClient updatePassword={handleUpdatePassword} />
        </div>
    );
}