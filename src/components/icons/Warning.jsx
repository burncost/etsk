export default function Warning() {
  return (
    <>
      <div
        class="w-32 h-32 mx-auto bg-red-200 border-2 
                border-red-300 text-6xl font-semibold rounded-full 
                text-center pt-7"
      >
        <span class="animate-pulse">🚨</span>
      </div>
      <div class="text-center text-red-600 text-lg uppercase">Caution!</div>
    </>
  );
}
