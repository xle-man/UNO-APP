<script>
   import { listOfMatchesScreenData } from "../javascripts/AppStore";

   export let color = "black";
   export let width = "5";
</script>
   

<svg
   xmlns="http://www.w3.org/2000/svg"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   style="isolation:isolate"
   viewBox="186 505.712 244.077 240.167"
   width="100%"
   height="100%"
   class={`${$listOfMatchesScreenData.isFetching ? "fetching" : ""}`}
   ><g
      ><path
         d=" M 382.047 611.779 L 362.906 610.175 L 343.764 608.571 C 334.013 607.753 331.768 601.527 338.755 594.676 L 360.542 573.312 L 382.329 551.947 C 389.316 545.096 395.497 547.462 396.123 557.228 L 397.352 576.396 L 398.581 595.565 C 399.207 605.331 391.798 612.596 382.047 611.779 Z "
         fill={color}
      /><path
         d=" M 231 613.672 Q 239.168 571.047 278.81 556.646 C 285.805 554.105 293.535 552.223 302 551 Q 340.674 547.637 372 583.513"
         fill="none"
         vector-effect="non-scaling-stroke"
         stroke-width={width}
         stroke={color}
         stroke-linejoin="miter"
         stroke-linecap="round"
         stroke-miterlimit="3"
      /><path
         d=" M 234.123 641.621 L 253.298 642.752 L 272.473 643.883 C 282.241 644.46 284.639 650.628 277.823 657.65 L 256.57 679.546 L 235.318 701.441 C 228.502 708.463 222.265 706.251 221.398 696.503 L 219.696 677.371 L 217.994 658.238 C 217.127 648.491 224.354 641.045 234.123 641.621 Z "
         fill={color}
      /><path
         d=" M 385.077 636 Q 377.964 678.813 338.689 694.189 C 331.759 696.902 324.078 698.974 315.645 700.406 Q 277.067 704.722 244.864 669.631"
         fill="none"
         vector-effect="non-scaling-stroke"
         stroke-width={width}
         stroke={color}
         stroke-linejoin="miter"
         stroke-linecap="round"
         stroke-miterlimit="3"
      /></g
   ></svg
>

<style>
   .fetching {
      
   }
</style>