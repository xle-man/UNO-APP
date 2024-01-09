<script>
    import { fade, fly } from 'svelte/transition';
    import { get } from "svelte/store";
    import { gameScreenData } from '../javascripts/AppStore';

    let isIntervalOn = false;

    $: if($gameScreenData.alert.time > 0 && !isIntervalOn) {
        isIntervalOn = true;
        const timeDecrement = setInterval(() => {
            gameScreenData.update(value => {
                value.alert.time = value.alert.time - 200;
                return value;
            });
            if(get(gameScreenData).alert.time <= 0) { 
                clearInterval(timeDecrement);
                isIntervalOn = false;
            }
        }, 200);
    }
</script>

{#if $gameScreenData.alert.time > 0 || $gameScreenData.alert.isPermanent}
    <div class="game-alert" in:fly={{ y: -100, duration: 500}} out:fade={{duration: 500}}> <!--z-index[40]-->
        <div>
            {$gameScreenData.alert.message}
        </div>
    </div>
{/if}

<style>
    .game-alert {
        max-width: 70%;
        position: fixed;
        z-index: 40;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 5px;
    }
</style>