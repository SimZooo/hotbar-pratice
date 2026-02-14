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

    let showProjects = $state(false);
</script>

<div class="absolute left-1/2 -translate-x-1/2 text-white top-50 flex items-end">
    <p class="text-5xl">HOTBAR PRACTICE</p>
    <p class="">v1.0.0</p>
</div>

<div
    class="absolute left-1/2 -translate-x-1/2 text-white top-80 flex flex-col text-2xl"
>
    <p>
        PB: {formatCorrectClicks(
            ($current_mode === GameMode.Navigation
                ? $stats.pb_navigation
                : $stats.pb_sorting) || 0
        )} correct clicks
    </p>
    {#if current_correct_clicks}
        <p>
            Last round: {formatCorrectClicks(current_correct_clicks || 0)} correct
            clicks
        </p>
    {/if}
</div>

<button
    class="top-100 absolute left-1/2 -translate-x-1/2 text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
    onclick={onStart}>Start</button
>

<div
    class="top-180 absolute left-1/2 -translate-x-1/2 text-white text-2xl flex flex-row gap-10"
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
    <div class="relative">
        <button
            class="text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg animate-pulse-subtle"
            onclick={() => (showProjects = !showProjects)}>My Projects</button
        >
        {#if showProjects}
            <div
                class="absolute top-full right-0 mt-2 flex flex-col gap-2 bg-[#4F4F4F] border-3 border-black p-3 z-20"
            >
                <a
                    href="https://foldrly.com"
                    target="_blank"
                    class="text-white text-lg hover:underline text-shadow-black text-shadow-lg"
                    >Foldrly</a
                >
                <a
                    href="https://specifai.info"
                    target="_blank"
                    class="text-white text-lg hover:underline text-shadow-black text-shadow-lg"
                    >SpecifAI</a
                >
                <a
                    href="https://trainflexi.com"
                    target="_blank"
                    class="text-white text-lg hover:underline text-shadow-black text-shadow-lg"
                    >TrainFlexi</a
                >
            </div>
        {/if}
    </div>
</div>
