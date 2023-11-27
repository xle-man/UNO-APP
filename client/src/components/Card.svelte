<script>
    import { get } from "svelte/store";
    export let color;
    export let isSpecial;
    export let symbol;
</script>


<div class="card-container">
    Color: {color}
    Special: {isSpecial}
    Symbol: {symbol}
</div>

<style>
    .card-container {
        border: 2px solid black;
    }
</style>