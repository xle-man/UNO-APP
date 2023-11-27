<script>
    import { get } from "svelte/store";
    import { gameScreenData } from "../javascripts/AppStore";
    import Card from "./Card.svelte";

</script>

<div class="gameScreen-container">
    cards:
    {#each $gameScreenData.player.cards as card}
        <Card color={"RED"} isSpecial={false} symbol={"0"} />
    {/each}
</div>


<style>
    .gameScreen-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>