<script>
    import { gameScreenData } from "../javascripts/AppStore";

    export let color = "#767676";
    export let width = "2";
    export let onclick;
</script>

<button class="action-button" on:click={onclick} disabled={$gameScreenData.match.activePlayer != $gameScreenData.player.id}>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        style="isolation:isolate"
        viewBox="901.429 481.41 134.8 153"
        width="100%"
        height="100%"
        ><path
            d=" M 991.824 615.925 L 990.682 620.188 L 990.372 621.346 C 988.625 627.864 981.916 631.738 975.398 629.991 L 914.493 613.672 C 907.975 611.925 904.101 605.216 905.848 598.698 L 933.774 494.474 C 935.521 487.957 942.23 484.083 948.748 485.829 L 1009.653 502.149 C 1016.171 503.895 1020.045 510.605 1018.298 517.123 L 1017.027 521.867 M 964.489 564.7 L 959.84 568.588 Q 954.289 573.974 959.223 579.876 Q 964.157 585.777 968.765 591.288 Q 974.17 597.384 979.731 600.273 C 988.816 604.992 998.213 603.293 1007.923 595.175 L 1021.871 583.513 Q 1039.851 568.083 1026.617 552.254 Q 1011.318 533.956 1001.526 522.244 C 991.734 510.532 981.212 521.139 990.113 531.786 L 1000.009 543.621 Q 989.881 531.508 983.399 523.755 C 976.917 516.002 967.449 525.293 973.254 532.236 Q 979.059 539.179 986.684 548.298 Q 975.909 535.412 969.013 527.164 C 962.118 518.916 951.223 527.359 958.446 535.999 Q 965.67 544.639 975.056 555.865 Q 966.652 545.814 961.274 539.381 C 955.895 532.947 945.101 541.511 950.706 548.216 Q 956.312 554.92 975.798 578.226 L 964.489 564.7 Z "
            fill-rule="evenodd"
            fill="none"
            vector-effect="non-scaling-stroke"
            stroke-width={width}
            stroke={color}
            stroke-linejoin="miter"
            stroke-linecap="round"
            stroke-miterlimit="3"
            class="path-stroke"
        /></svg
    >
</button>

<style>
    .action-button {
        background-color: var(--zinc-800);
        border: 2px solid var(--zinc-700);
        height: 60px;
        color: var(--gray);
        font-size: 24px;
        padding: 10px 10px 10px 10px;
        transition: ease-in-out 0.2s;
        border-radius: 10px;
    }

    .action-button:not(:disabled) {
        border-color: var(--white);
        color: var(--white);
    }

    .action-button:not(:disabled) .path-stroke {
        stroke: white;
    }

    .action-button:not(:disabled):hover {
        cursor: pointer;
    }

    .path-stroke {
        transition: ease-in-out 0.2s;
    }
</style>
