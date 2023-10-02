import { writable, get } from 'svelte/store';
import { navigate } from "svelte-routing";
import CONSTANTS from "../javascripts/Constants";

export const matchID = writable(null);
export const playerID = writable(null);
export const isSocketConnected = writable(false);
export const isSignedIn = writable(false);


export function switchScreen(screen) {
    navigate(`/${screen}`, {replace: true});
}

export function signIn(login, password) {
    // Server API for signing in (returns true/false)\
    isSignedIn.set(true);
    return true;
}