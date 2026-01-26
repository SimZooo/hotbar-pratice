<script lang="ts">
    let { onBack }: { onBack: () => void } = $props();
</script>

<div
    class="relative flex flex-col size-full justify-center z-20 text-white text-center text-3xl"
>
    <p>
        Press the hotbar keybind corresponding to the highlighted slot.
    </p>
    <p>You can edit your preferred keybinds in the options!</p>
    <button
        class="left-25 top-5 absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg z-1000"
        onclick={onBack}
    >Back</button
    >
</div>