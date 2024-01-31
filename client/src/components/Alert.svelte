<script>
    import { fade, fly } from 'svelte/transition';
    import { get } from "svelte/store";
    import { alertData } from '../javascripts/AppStore';

    let isIntervalOn = false;

    $: if($alertData.time > 0 && !isIntervalOn) {
        isIntervalOn = true;
        const timeDecrement = setInterval(() => {
            alertData.update(data => Object.assign(data, {time: data.time - 200}));
            if(get(alertData).time <= 0) { 
                clearInterval(timeDecrement);
                isIntervalOn = false;
            }
        }, 200);
    }
</script>

{#if $alertData.time > 0}
    <div class="alert" in:fly={{ x: -200, duration: 500}} out:fade={{duration: 500}} > <!--z-index[100]-->
        {@html $alertData.message}
    </div>
{/if}

<style>
    .alert {
        position: fixed;
        z-index: 100;
        bottom: 10px;
        left: 10px;
        padding: 10px 20px;
        background-color: lightgray;
    }
</style>