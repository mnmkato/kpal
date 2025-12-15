import { AuthClient } from "./AuthClient";
import { signInWithEmail, signOut, signUpNewUser } from "../actions";
export default function Auth() {
    
    async function handleSignInWithEmail(email: string, password: string) {
        'use server'
        return await signInWithEmail(email, password);
    }
    async function handleSignUpNewUser(email: string, password: string) {
        'use server'
        return await signUpNewUser(email, password);
    }   
    async function handleSignOut() {
        'use server'
        return await signOut();
    }
    return (
        <div className="px-4 max-w-lg mx-auto">
             <AuthClient
                signInWithEmail={handleSignInWithEmail}
                signUpNewUser={handleSignUpNewUser}
                signOut={handleSignOut} />
        </div>
    );
}
