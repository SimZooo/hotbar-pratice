<script lang="ts">
    import { hotbar, settings } from "$lib";
    import { formatCorrectClicks, formatTime } from "$lib";

    let {
        slots,
        to_select,
        selectedPos,
        current_correct_clicks,
        now,
        start_time,
        onBack,
        container,
    }: {
        slots: HTMLImageElement[];
        to_select: number;
        selectedPos: { left: number; top: number };
        current_correct_clicks: number | null;
        now: number;
        start_time: number;
        onBack: () => void;
        container: HTMLDivElement;
    } = $props();
</script>

<div class="relative z-10 w-full h-full">
    <div class="place-self-center text-white mt-50 absolute flex items-end">
        <p class="text-5xl">HOTBAR PRACTICE</p>
        <p class="">v0.1</p>
    </div>
    <div
        class="place-self-center text-white mt-100 absolute flex flex-col items-end"
    >
        <p class="text-2xl">
            Correct Clicks: {formatCorrectClicks(current_correct_clicks || 0)}
        </p>
        <p class="text-2xl">
            Time: {formatTime(start_time)}
        </p>
    </div>
    <div class="flex justify-center items-center size-full gap-12">
        {#if $settings.options.offhand_enabled}
            <img
                src="./offhand.png"
                alt=""
                class="h-32 aspect-square shadow-2xl shadow-black place-self-center"
            />
        {/if}
        <div class="flex">
            {#each Array(9) as _, i}
                <div class="relative h-30 aspect-square">
                    <img
                        src="./slot.png"
                        alt=""
                        class="h-full w-full shadow-2xl shadow-black"
                        bind:this={slots[i]}
                    />

                    <p
                        class="absolute inset-0 flex items-center justify-center
                               text-white text-xl pointer-events-none z-10"
                    >
                        {$hotbar[i]}
                    </p>
                </div>
            {/each}
        </div>
    </div>

    <img
        src="./selected.png"
        alt=""
        class="h-32 aspect-square absolute"
        style="left: {selectedPos.left}px; top: {selectedPos.top - 4}px"
    />
</div>

<button
    class="left-25 top-5 absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg z-1000"
    onclick={onBack}>Back</button
>
