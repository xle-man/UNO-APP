<script>
    import { signIn, isSignedIn, switchScreen } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    let login;
    let password;

    function signInButtonClicked() {
        const result = signIn(login, password);
        if(result) {
            switchScreen(CONSTANTS.SCREEN.MAIN_SCREEN);
        }
    }
</script>

<div>
    <input type="text" name="login" placeholder="email" bind:value={login}>
    <input type="password" name="password" placeholder="password" bind:value={password}>
    <button on:click={signInButtonClicked}>SIGN IN</button>
</div>