<script>
    import { fade, fly } from 'svelte/transition';
    import { get } from "svelte/store";
    import { alertDisplayTime, alertData } from '../javascripts/AppStore';

    let isIntervalOn = false;

    $: if($alertDisplayTime > 0 && !isIntervalOn) {
        isIntervalOn = true;
        const timeDecrement = setInterval(() => {
            alertDisplayTime.set(get(alertDisplayTime) - 200);
            if(get(alertDisplayTime) <= 0) { 
                clearInterval(timeDecrement);
                isIntervalOn = false;
            }
        }, 200);
    }
</script>

{#if $alertDisplayTime > 0}
    <div class="alert" in:fly={{ x: 200, duration: 500}} out:fade={{duration: 500}} > <!--z-index[100]-->
        {$alertData.message}
    </div>
{/if}

<style>
    .alert {
        position: fixed;
        z-index: 100;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background-color: lightgray;
    }
</style>