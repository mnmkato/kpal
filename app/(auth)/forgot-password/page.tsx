
import { resetPasswordForEmail } from "../actions";
import { ForgotPasswordClient } from "./forgotPasswordClient";

export default function ForgotPassword() {
    async function handleResetPassword(email: string) {
        'use server'
        return await resetPasswordForEmail(email);
    }
    return (
        <div className="mx-auto">
            <ForgotPasswordClient resetPassword={handleResetPassword} />
        </div>
    );
}