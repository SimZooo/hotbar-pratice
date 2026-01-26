<script lang="ts">
    import { stats, durations, GameMode, current_mode } from "$lib";
    import { formatCorrectClicks } from "$lib";

    let {
        current_correct_clicks,
        duration,
        onDurationChange,
        onStart,
        onOptions,
        onTutorial,
    }: {
        current_correct_clicks: number | null;
        duration: number;
        onDurationChange: (dur: number) => void;
        onStart: () => void;
        onOptions: () => void;
        onTutorial: () => void;
    } = $props();
</script>

<div class="place-self-center text-white mt-50 absolute flex items-end">
    <p class="text-5xl">HOTBAR PRACTICE</p>
    <p class="">v0.1</p>
</div>

<div
    class="place-self-center text-white mt-100 absolute flex flex-col text-2xl"
>
    <p>
        PB: {formatCorrectClicks($stats.pb_correct_clicks || 0)} correct clicks
    </p>
    {#if current_correct_clicks}
        <p>
            Last round: {formatCorrectClicks(current_correct_clicks || 0)} correct
            clicks
        </p>
    {/if}
</div>

<button
    class="top-100 place-self-center absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
    onclick={onStart}>Start</button
>

<div
    class="top-180 place-self-center absolute text-white text-2xl flex flex-row gap-10"
>
    {#each Object.values(GameMode).filter((mode) => typeof mode === "string") as mode}
        <button
            class="w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 hover:cursor-pointer text-shadow-black text-shadow-lg {$current_mode ===
            GameMode[mode as keyof typeof GameMode]
                ? 'border-white'
                : 'border-black'}"
            onclick={() =>
                ($current_mode = GameMode[mode as keyof typeof GameMode])}
            >{mode}</button
        >
    {/each}
</div>

<div class="absolute top-150 w-full flex justify-center gap-10">
    {#each durations as dur}
        <button
            onclick={() => onDurationChange(dur)}
            class="text-white bg-[#6F6F6F] w-60 h-15 border-3 hover:cursor-pointer text-shadow-black text-shadow-lg text-lg {dur ===
            duration
                ? 'border-white'
                : 'border-black'}">{dur}s</button
        >
    {/each}
</div>

<div class="absolute right-25 top-5 flex flex-col w-fit justify-center gap-5">
    <button
        class="text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
        onclick={onOptions}>Options</button
    >
    <button
        class="text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
        onclick={onTutorial}>How to Play</button
    >
</div>
