<script>
    import { gameScreenData } from "../javascripts/AppStore";

    export let color = "#767676";
    export let width = "2";
    export let onclick;
</script>

<button class="confirm-button" on:click={onclick} disabled={$gameScreenData.match.activePlayer != $gameScreenData.player.id}>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        style="isolation:isolate"
        viewBox="708 473.41 153.827 169"
        width="100%"
        height="100%"
        ><path
            d=" M 839.917 571.733 L 791.929 599.439 L 743.941 627.145 C 730.728 634.773 720 628.58 720 613.322 L 720 557.91 L 720 502.498 C 720 487.241 730.728 481.047 743.941 488.676 L 791.929 516.382 L 839.917 544.088 C 853.131 551.717 853.131 564.104 839.917 571.733 Z "
            fill="none"
            vector-effect="non-scaling-stroke"
            stroke-width={width}
            stroke={color}
            stroke-linejoin="miter"
            stroke-linecap="square"
            stroke-miterlimit="3"
            class="path-stroke"
        /></svg
    >
</button>


<style>
    .confirm-button {
        background-color: var(--zinc-800);
        border: 2px solid var(--zinc-700);
        height: 60px;
        color: var(--gray);
        font-size: 24px;
        padding: 10px 10px 10px 10px;
        transition: ease-in-out 0.2s;
        border-radius: 10px;
    }

    .confirm-button:not(:disabled):hover {
        cursor: pointer;
        border-color: var(--white);
        color: var(--white);
    }

    .confirm-button:disabled {
        opacity: 0.5;
    }

    .path-stroke {
        transition: ease-in-out 0.2s;
    }

    .confirm-button:not(:disabled):hover .path-stroke {
        stroke: white;
    }
</style>
