'use server'

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpNewUser(email: string, password: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/`,
        },
    })
    if (error) {
        return {error: error.message}
    }
    return { success: true };
}

export async function signInWithEmail(email: string, password: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    if (error) {
        console.log(error)
        return {error: error.message}
    } 
    console.log(data)
    return { success: true };
}
export async function resetPasswordForEmail(email: string) {
    const supabase = await  createClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
    })
    if (error) {
        console.log(error)
        return {error: error.message}
    }   
    return { success: true };
}   

export async function signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut()
}