<script>
    import { get } from "svelte/store";
    export let color;
    export let special;
    export let symbol;
</script>

<div>
    Color: {color}
    Special: {special}
    Symbol: {symbol}
</div>